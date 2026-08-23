import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { MeetingRoom } from "@/components/meeting-room";

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

  return (
    <MeetingRoom
      code={normalizedCode}
      name={query.name?.trim() || session.user.name || "PrepRoom user"}
      audio={query.audio !== "0"}
      video={query.video !== "0"}
      microphoneId={query.microphone}
      cameraId={query.camera}
    />
  );
}
