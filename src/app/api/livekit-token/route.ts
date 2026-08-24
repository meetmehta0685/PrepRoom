import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { hasDatabase, hasLiveKit } from "@/lib/config";
import { findActiveParticipantRoom } from "@/lib/livekit-presence";
import { prisma } from "@/lib/prisma";

const requestSchema = z.object({
  code: z.string().min(6).max(20),
  name: z.string().trim().min(1).max(60),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to join this room." }, { status: 401 });
  }

  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "The room code or display name is invalid." }, { status: 400 });
  }

  if (!hasLiveKit) {
    return NextResponse.json({ error: "LiveKit credentials have not been added yet.", setupRequired: true }, { status: 503 });
  }

  const code = parsed.data.code.toUpperCase();
  let roomName = `preproom-demo-${code.toLowerCase()}`;

  if (hasDatabase) {
    try {
      const meeting = await prisma.meeting.findUnique({ where: { code } });
      if (!meeting || meeting.endedAt) {
        return NextResponse.json({ error: "This room does not exist or has ended." }, { status: 404 });
      }
      roomName = meeting.livekitRoom;
    } catch (error) {
      console.error("Failed to resolve meeting", error);
      return NextResponse.json({ error: "The room could not be loaded." }, { status: 500 });
    }
  }

  const identity = session.user.id;

  try {
    const roomService = new RoomServiceClient(
      process.env.LIVEKIT_URL!,
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
    );
    const activeRoom = await findActiveParticipantRoom(roomService, identity);

    if (activeRoom) {
      return NextResponse.json(
        {
          code: "ALREADY_IN_MEETING",
          error: "You are already in a meeting. Leave it before joining another.",
        },
        { status: 409 },
      );
    }
  } catch (error) {
    console.error("Failed to check active meeting", error);
    return NextResponse.json(
      {
        code: "PRESENCE_CHECK_FAILED",
        error: "Your active meeting status could not be checked. Try again.",
      },
      { status: 502 },
    );
  }

  const token = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
    identity,
    name: parsed.data.name,
    ttl: "2h",
  });
  token.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true, canPublishData: true });

  return NextResponse.json({
    token: await token.toJwt(),
    serverUrl: process.env.LIVEKIT_URL,
  });
}
