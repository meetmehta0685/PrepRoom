import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { createInterviewReportPdf } from "@/lib/interview-report-pdf";
import { levelLabel, trackLabel, type ExperienceLevelValue, type InterviewTrackValue } from "@/lib/interviews";
import { prisma } from "@/lib/prisma";

function filename(value: string) {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
  return `preproom-${slug || "interview"}-report.pdf`;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to download this report." }, { status: 401 });
  }

  const { id } = await params;
  const interview = await prisma.interviewSession.findUnique({
    where: { id },
    include: {
      report: { include: { questionReviews: { orderBy: { questionNumber: "asc" } } } },
    },
  });

  if (!interview || interview.candidateId !== session.user.id || !interview.report) {
    return NextResponse.json({ error: "This interview report is not available." }, { status: 404 });
  }
  if (!interview.report.questionReviews.length) {
    return NextResponse.json({ error: "This older report does not include detailed question reviews. Complete a new interview to download the expanded report." }, { status: 409 });
  }

  const bytes = await createInterviewReportPdf({
    jobTitle: interview.jobTitle,
    track: trackLabel(interview.track as InterviewTrackValue),
    level: levelLabel(interview.level as ExperienceLevelValue),
    completedAt: interview.completedAt ?? interview.report.createdAt,
    ...interview.report,
  });

  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename(interview.jobTitle)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
