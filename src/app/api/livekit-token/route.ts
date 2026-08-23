import { AccessToken } from "livekit-server-sdk";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { hasDatabase, hasLiveKit } from "@/lib/config";
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

  const token = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
    identity: `${session.user.id}-${crypto.randomUUID()}`,
    name: parsed.data.name,
    ttl: "2h",
  });
  token.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true, canPublishData: true });

  return NextResponse.json({
    token: await token.toJwt(),
    serverUrl: process.env.LIVEKIT_URL,
  });
}
