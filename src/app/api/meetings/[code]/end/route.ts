import { RoomServiceClient } from "livekit-server-sdk";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { hasDatabase, hasLiveKit } from "@/lib/config";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to end this room." }, { status: 401 });
  }
  if (!hasDatabase) {
    return NextResponse.json({ error: "Room storage is not configured." }, { status: 503 });
  }

  const { code } = await params;
  const meeting = await prisma.meeting.findUnique({ where: { code: code.toUpperCase() } });
  if (!meeting || meeting.createdById !== session.user.id) {
    return NextResponse.json({ error: "Only the person who created this room can end it." }, { status: 404 });
  }
  if (meeting.endedAt) {
    return NextResponse.json({ ended: true });
  }

  try {
    const endedAt = new Date();
    await prisma.$transaction([
      prisma.meeting.update({ where: { id: meeting.id }, data: { endedAt } }),
      prisma.interviewSession.updateMany({
        where: { meetingId: meeting.id, status: "ACTIVE" },
        data: { status: "COMPLETED", completedAt: endedAt },
      }),
    ]);
  } catch (error) {
    console.error("Failed to end meeting", error);
    return NextResponse.json({ error: "The room could not be ended. Try again." }, { status: 500 });
  }

  // Closing the LiveKit room disconnects everyone still inside. The room is
  // already marked ended, so a LiveKit failure only delays the disconnect.
  if (hasLiveKit) {
    try {
      const roomService = new RoomServiceClient(
        process.env.LIVEKIT_URL!,
        process.env.LIVEKIT_API_KEY!,
        process.env.LIVEKIT_API_SECRET!,
      );
      await roomService.deleteRoom(meeting.livekitRoom);
    } catch (error) {
      console.error("Failed to close LiveKit room", error);
    }
  }

  return NextResponse.json({ ended: true });
}
