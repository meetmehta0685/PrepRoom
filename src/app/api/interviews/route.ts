import { customAlphabet } from "nanoid";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { experienceLevelValues, interviewTrackValues, questionBank, trackLabel } from "@/lib/interviews";
import { prisma } from "@/lib/prisma";

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

  const parsed = createInterviewSchema.safeParse(await request.json());
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

    const activeInterview = await prisma.interviewSession.findFirst({
      where: { candidateId: session.user.id, interviewerType: "AI", status: "ACTIVE" },
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

    const interview = await prisma.interviewSession.create({
      data: {
        candidate: { connect: { id: session.user.id } },
        interviewerType,
        track,
        level,
        jobTitle,
        messages: {
          create: {
            role: "INTERVIEWER",
            content: questionBank[track][0],
          },
        },
      },
    });

    return NextResponse.json({ destination: `/interview/${interview.id}` });
  } catch (error) {
    console.error("Failed to create interview", error);
    return NextResponse.json({ error: "The interview could not be created." }, { status: 500 });
  }
}
