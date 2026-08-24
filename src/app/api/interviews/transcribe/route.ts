import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { MAX_AUDIO_BYTES, audioExtension, isAcceptedAudioType } from "@/lib/audio-recording";
import { hasGroq } from "@/lib/config";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to use voice answers." }, { status: 401 });
  }

  if (!hasGroq) {
    return NextResponse.json({ error: "Voice transcription is not configured." }, { status: 503 });
  }

  const form = await request.formData();
  const interviewId = form.get("interviewId");
  const audio = form.get("audio");

  if (typeof interviewId !== "string" || !(audio instanceof File)) {
    return NextResponse.json({ error: "No voice recording was received." }, { status: 400 });
  }

  const interview = await prisma.interviewSession.findUnique({ where: { id: interviewId } });
  if (!interview || interview.candidateId !== session.user.id || interview.interviewerType !== "AI" || interview.status !== "ACTIVE") {
    return NextResponse.json({ error: "This interview is not available for voice answers." }, { status: 404 });
  }

  if (!isAcceptedAudioType(audio.type)) {
    return NextResponse.json({ error: "This browser produced an unsupported audio format." }, { status: 415 });
  }

  if (audio.size === 0 || audio.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: "Keep voice answers under two minutes and try again." }, { status: 413 });
  }

  const upload = new FormData();
  upload.append("file", audio, `answer.${audioExtension(audio.type)}`);
  upload.append("model", "whisper-large-v3-turbo");
  upload.append("language", "en");
  upload.append("response_format", "json");
  upload.append("prompt", "A software engineering interview answer. Preserve technical terms such as Next.js, PostgreSQL, APIs, WebRTC, OAuth, and TypeScript.");

  try {
    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: upload,
    });

    if (!response.ok) {
      console.error("Groq transcription failed", response.status);
      const status = response.status === 429 ? 429 : 502;
      const error = response.status === 429
        ? "Voice transcription has reached its free limit. Type your answer for now."
        : "The recording could not be transcribed. Try again or type your answer.";
      return NextResponse.json({ error }, { status });
    }

    const result = (await response.json()) as { text?: string };
    const text = result.text?.trim();
    if (!text) {
      return NextResponse.json({ error: "No speech was detected. Record again and speak closer to the microphone." }, { status: 422 });
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Voice transcription request failed", error);
    return NextResponse.json({ error: "The recording could not be transcribed. Try again or type your answer." }, { status: 502 });
  }
}
