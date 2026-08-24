import { customAlphabet } from "nanoid";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { createOpeningQuestion } from "@/lib/ai-interviewer";
import { experienceLevelValues, interviewTrackValues, trackLabel } from "@/lib/interviews";
import { prisma } from "@/lib/prisma";
import { parseResume } from "@/lib/resume";

export const runtime = "nodejs";
export const maxDuration = 30;

const createCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);
const createInterviewSchema = z.object({
  interviewerType: z.enum(["AI", "PEER"]),
  track: z.enum(interviewTrackValues),
  level: z.enum(experienceLevelValues),
  jobTitle: z.string().trim().min(2).max(80),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in before starting an interview." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "The interview details could not be read." }, { status: 400 });
  }

  const parsed = createInterviewSchema.safeParse({
    interviewerType: form.get("interviewerType"),
    track: form.get("track"),
    level: form.get("level"),
    jobTitle: form.get("jobTitle"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the interview details and try again." }, { status: 400 });
  }

  const { interviewerType, track, level, jobTitle } = parsed.data;

  try {
    if (interviewerType === "PEER") {
      const code = `PRP-${createCode()}`;
      await prisma.interviewSession.create({
        data: {
          candidate: { connect: { id: session.user.id } },
          interviewerType,
          track,
          level,
          jobTitle,
          meeting: {
            create: {
              code,
              livekitRoom: `preproom-${crypto.randomUUID()}`,
              title: `${trackLabel(track)} mock interview`,
              createdBy: { connect: { id: session.user.id } },
            },
          },
        },
      });

      return NextResponse.json({ destination: `/join/${code}` });
    }

    const resumeFile = form.get("resume");
    if (!(resumeFile instanceof File)) {
      return NextResponse.json({ error: "Upload your resume PDF to start an AI interview." }, { status: 400 });
    }

    let resume;
    try {
      resume = await parseResume(resumeFile);
    } catch (error) {
      const message = error instanceof Error ? error.message : "The resume could not be read.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const activeInterview = await prisma.interviewSession.findFirst({
      where: {
        candidateId: session.user.id,
        interviewerType: "AI",
        status: "ACTIVE",
        track: parsed.data.track,
        level: parsed.data.level,
        jobTitle: parsed.data.jobTitle,
        resumeFingerprint: resume.fingerprint,
      },
      orderBy: { createdAt: "desc" },
    });
    if (activeInterview) {
      return NextResponse.json({ destination: `/interview/${activeInterview.id}`, resumed: true });
    }

    const interviewsInLastDay = await prisma.interviewSession.count({
      where: {
        candidateId: session.user.id,
        interviewerType: "AI",
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });
    if (interviewsInLastDay >= 10) {
      return NextResponse.json({ error: "You have reached today's AI interview limit. Try again tomorrow." }, { status: 429 });
    }

    const opening = await createOpeningQuestion({ track, level, jobTitle, resumeText: resume.text });
    const interview = await prisma.$transaction(async (transaction) => {
      await transaction.interviewSession.updateMany({
        where: { candidateId: session.user.id, interviewerType: "AI", status: "ACTIVE" },
        data: { status: "ABANDONED" },
      });

      return transaction.interviewSession.create({
        data: {
          candidate: { connect: { id: session.user.id } },
          interviewerType,
          track,
          level,
          jobTitle,
          resumeName: resume.name,
          resumeText: resume.text,
          resumeFingerprint: resume.fingerprint,
          messages: {
            create: {
              role: "INTERVIEWER",
              content: opening.question,
              questionType: opening.questionType,
              codeLanguage: opening.codeLanguage,
            },
          },
        },
      });
    });

    return NextResponse.json({ destination: `/interview/${interview.id}` });
  } catch (error) {
    console.error("Failed to create interview", error);
    return NextResponse.json({ error: "The interview could not be created." }, { status: 500 });
  }
}
