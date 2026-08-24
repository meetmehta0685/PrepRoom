import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { MeetingRoom } from "@/components/meeting-room";
import { hasDatabase } from "@/lib/config";
import { levelLabel, trackLabel, type ExperienceLevelValue, type InterviewTrackValue } from "@/lib/interviews";
import { prisma } from "@/lib/prisma";

type RoomSearchParams = {
  name?: string;
  audio?: string;
  video?: string;
  microphone?: string;
  camera?: string;
};

export default async function RoomPage({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<RoomSearchParams> }) {
  const session = await auth();
  const { code } = await params;
  const query = await searchParams;
  const normalizedCode = code.toUpperCase();

  if (!session?.user) {
    redirect(`/signin?callbackUrl=${encodeURIComponent(`/join/${normalizedCode}`)}`);
  }

  let sessionLabel = "Study session";
  let participantRole: string | undefined;
  if (hasDatabase) {
    const meeting = await prisma.meeting.findUnique({ where: { code: normalizedCode }, include: { interview: true } });
    if (meeting) {
      sessionLabel = meeting.title;
      if (meeting.interview) {
        sessionLabel = `${trackLabel(meeting.interview.track as InterviewTrackValue)} · ${levelLabel(meeting.interview.level as ExperienceLevelValue)}`;
        participantRole = meeting.interview.candidateId === session.user.id ? "Candidate" : "Peer interviewer";
      }
    }
  }

  return (
    <MeetingRoom
      code={normalizedCode}
      name={query.name?.trim() || session.user.name || "PrepRoom user"}
      audio={query.audio !== "0"}
      video={query.video !== "0"}
      microphoneId={query.microphone}
      cameraId={query.camera}
      sessionLabel={sessionLabel}
      participantRole={participantRole}
    />
  );
}
