import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { hasDatabase } from "@/lib/config";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in to join this room." }, { status: 401 });
  }

  const { code } = await params;
  const normalizedCode = code.toUpperCase();

  if (!hasDatabase) {
    return NextResponse.json({ code: normalizedCode, title: "Study session" });
  }

  try {
    const meeting = await prisma.meeting.findUnique({ where: { code: normalizedCode } });
    if (!meeting || meeting.endedAt) {
      return NextResponse.json({ error: "This room does not exist or has ended." }, { status: 404 });
    }
    return NextResponse.json({ code: meeting.code, title: meeting.title });
  } catch (error) {
    console.error("Failed to load meeting", error);
    return NextResponse.json({ error: "The room could not be loaded." }, { status: 500 });
  }
}
