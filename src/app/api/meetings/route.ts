import { customAlphabet } from "nanoid";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { hasDatabase } from "@/lib/config";
import { prisma } from "@/lib/prisma";

const createCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in before creating a room." }, { status: 401 });
  }

  const code = `PRP-${createCode()}`;
  const livekitRoom = `preproom-${crypto.randomUUID()}`;

  if (hasDatabase) {
    try {
      await prisma.meeting.create({
        data: {
          code,
          livekitRoom,
          createdById: session.user.id,
        },
      });
    } catch (error) {
      console.error("Failed to create meeting", error);
      return NextResponse.json({ error: "The room could not be saved." }, { status: 500 });
    }
  }

  return NextResponse.json({ code });
}
