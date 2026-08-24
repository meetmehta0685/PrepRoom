import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { createInterviewReport, createNextQuestion } from "@/lib/ai-interviewer";
import type { ExperienceLevelValue, InterviewTrackValue } from "@/lib/interviews";
import { prisma } from "@/lib/prisma";

const answerSchema = z.object({ answer: z.string().trim().min(2).max(6000) });

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

  if (interview.status === "COMPLETED" || interview.report) {
    return NextResponse.json({ error: "This interview is already complete." }, { status: 409 });
  }

  try {
    const candidateMessage = await prisma.interviewMessage.create({
      data: { interviewId: id, role: "CANDIDATE", content: parsed.data.answer },
    });
    const turns = [...interview.messages, candidateMessage].map((message) => ({
      role: message.role,
      content: message.content,
    }));
    const answerCount = turns.filter((turn) => turn.role === "CANDIDATE").length;

    if (answerCount >= 5) {
      const generated = await createInterviewReport({
        track: interview.track as InterviewTrackValue,
        level: interview.level as ExperienceLevelValue,
        jobTitle: interview.jobTitle,
        turns,
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
    });
    const question = await prisma.interviewMessage.create({
      data: { interviewId: id, role: "INTERVIEWER", content: generated.question },
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
