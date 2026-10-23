import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { candidateSafeAnswerFeedback, codeLanguageValues, createInterviewReport, createNextQuestion } from "@/lib/ai-interviewer";
import type { ExperienceLevelValue, InterviewTrackValue } from "@/lib/interviews";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const maxDuration = 30;

const answerSchema = z.object({
  answer: z.string().trim().min(2).max(12_000),
  questionType: z.enum(["TEXT", "CODE"]),
  codeLanguage: z.enum(codeLanguageValues).nullable(),
});
// Resumes an interview whose last answer was saved but whose next step failed.
const continueSchema = z.object({ continue: z.literal(true) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to continue the interview." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "The answer could not be read." }, { status: 400 });
  }

  const resume = continueSchema.safeParse(body).success;
  const parsed = answerSchema.safeParse(body);
  if (!resume && !parsed.success) {
    return NextResponse.json({ error: "Give an answer before continuing." }, { status: 400 });
  }

  const { id } = await params;
  const interview = await prisma.interviewSession.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "asc" } }, report: true },
  });

  if (!interview || interview.candidateId !== session.user.id || interview.interviewerType !== "AI") {
    return NextResponse.json({ error: "This interview is not available." }, { status: 404 });
  }

  if (interview.status !== "ACTIVE" || interview.report) {
    return NextResponse.json({ error: "This interview is no longer active." }, { status: 409 });
  }

  const lastMessage = interview.messages.at(-1);
  const awaitingNextStep = lastMessage?.role === "CANDIDATE";
  if (resume && !awaitingNextStep) {
    return NextResponse.json({ error: "There is no saved answer waiting. Answer the current question." }, { status: 409 });
  }
  if (!resume && awaitingNextStep) {
    return NextResponse.json({ error: "Your previous answer is saved. Continue the interview before answering again.", answerSaved: true }, { status: 409 });
  }

  let answerSaved = resume;
  try {
    const messages = [...interview.messages];
    if (!resume && parsed.success) {
      const currentQuestion = [...messages].reverse().find((message) => message.role === "INTERVIEWER");
      if (!currentQuestion || currentQuestion.questionType !== parsed.data.questionType) {
        return NextResponse.json({ error: "The interview question changed. Reload before submitting." }, { status: 409 });
      }

      messages.push(await prisma.interviewMessage.create({
        data: {
          interviewId: id,
          role: "CANDIDATE",
          content: parsed.data.answer,
          questionType: currentQuestion.questionType,
          codeLanguage: currentQuestion.questionType === "CODE" ? parsed.data.codeLanguage : null,
        },
      }));
      answerSaved = true;
    }

    const turns = messages.map((message) => ({
      role: message.role,
      content: message.content,
      questionType: message.questionType,
      codeLanguage: message.codeLanguage,
    }));
    const answerCount = turns.filter((turn) => turn.role === "CANDIDATE").length;

    if (answerCount >= 5) {
      const generated = await createInterviewReport({
        track: interview.track as InterviewTrackValue,
        level: interview.level as ExperienceLevelValue,
        jobTitle: interview.jobTitle,
        turns,
        resumeText: interview.resumeText,
      });
      const report = await prisma.$transaction(async (transaction) => {
        const { questionReviews, ...reportData } = generated.report;
        const created = await transaction.interviewReport.create({
          data: {
            interviewId: id,
            ...reportData,
            isBaseline: generated.provider === "practice",
            questionReviews: { create: questionReviews },
          },
          include: { questionReviews: { orderBy: { questionNumber: "asc" } } },
        });
        await transaction.interviewSession.update({
          where: { id },
          data: { status: "COMPLETED", completedAt: new Date() },
        });
        return created;
      });

      return NextResponse.json({ completed: true, report, provider: generated.provider });
    }

    const generated = await createNextQuestion({
      track: interview.track as InterviewTrackValue,
      level: interview.level as ExperienceLevelValue,
      jobTitle: interview.jobTitle,
      turns,
      answerCount,
      resumeText: interview.resumeText,
    });
    const question = await prisma.interviewMessage.create({
      data: {
        interviewId: id,
        role: "INTERVIEWER",
        content: generated.question,
        questionType: generated.questionType,
        codeLanguage: generated.codeLanguage,
      },
    });

    return NextResponse.json({
      completed: false,
      feedback: candidateSafeAnswerFeedback,
      question,
      provider: generated.provider,
    });
  } catch (error) {
    console.error("Failed to continue AI interview", error);
    return NextResponse.json(
      {
        error: answerSaved
          ? "Your answer was saved, but the interviewer could not respond. Continue the interview to try again."
          : "Your answer could not be saved. Try submitting it again.",
        answerSaved,
      },
      { status: 502 },
    );
  }
}
