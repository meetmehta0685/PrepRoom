import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { AiInterviewRoom } from "@/components/ai-interview-room";
import type { ExperienceLevelValue, InterviewTrackValue } from "@/lib/interviews";
import { prisma } from "@/lib/prisma";

export default async function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  if (!session?.user?.id) redirect(`/signin?callbackUrl=${encodeURIComponent(`/interview/${id}`)}`);

  const interview = await prisma.interviewSession.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      report: { include: { questionReviews: { orderBy: { questionNumber: "asc" } } } },
    },
  });

  if (!interview || interview.candidateId !== session.user.id || interview.interviewerType !== "AI") notFound();

  return (
    <AiInterviewRoom
      interview={{
        id: interview.id,
        track: interview.track as InterviewTrackValue,
        level: interview.level as ExperienceLevelValue,
        jobTitle: interview.jobTitle,
        messages: interview.messages.map((message) => ({
          id: message.id,
          role: message.role,
          content: message.content,
          questionType: message.questionType,
          codeLanguage: message.codeLanguage,
        })),
        report: interview.report,
      }}
    />
  );
}
