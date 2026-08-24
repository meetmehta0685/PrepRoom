import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { codeLanguageValues, createInterviewReport, createNextQuestion } from "@/lib/ai-interviewer";
import type { ExperienceLevelValue, InterviewTrackValue } from "@/lib/interviews";
import { prisma } from "@/lib/prisma";

const answerSchema = z.object({
  answer: z.string().trim().min(2).max(12_000),
  questionType: z.enum(["TEXT", "CODE"]),
  codeLanguage: z.enum(codeLanguageValues).nullable(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to continue the interview." }, { status: 401 });
  }

  const parsed = answerSchema.safeParse(await request.json());
  if (!parsed.success) {
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

  try {
    const currentQuestion = [...interview.messages].reverse().find((message) => message.role === "INTERVIEWER");
    if (!currentQuestion || currentQuestion.questionType !== parsed.data.questionType) {
      return NextResponse.json({ error: "The interview question changed. Reload before submitting." }, { status: 409 });
    }

    const candidateMessage = await prisma.interviewMessage.create({
      data: {
        interviewId: id,
        role: "CANDIDATE",
        content: parsed.data.answer,
        questionType: currentQuestion.questionType,
        codeLanguage: currentQuestion.questionType === "CODE" ? parsed.data.codeLanguage : null,
      },
    });
    const turns = [...interview.messages, candidateMessage].map((message) => ({
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
        const created = await transaction.interviewReport.create({
          data: { interviewId: id, ...generated.report },
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
      feedback: generated.feedback,
      question,
      provider: generated.provider,
    });
  } catch (error) {
    console.error("Failed to continue AI interview", error);
    return NextResponse.json({ error: "The interviewer could not respond. Your answer was saved; reload and try again." }, { status: 502 });
  }
}
