import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { BrandMark } from "@/components/brand-mark";
import { JoinSetup } from "@/components/join-setup";
import { hasDatabase } from "@/lib/config";
import { prisma } from "@/lib/prisma";

export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const session = await auth();
  const { code } = await params;
  const normalizedCode = code.toUpperCase();

  if (!session?.user) {
    redirect(`/signin?callbackUrl=${encodeURIComponent(`/join/${normalizedCode}`)}`);
  }

  if (hasDatabase) {
    const meeting = await prisma.meeting.findUnique({ where: { code: normalizedCode } });
    if (!meeting || meeting.endedAt) notFound();
  }

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <div className="mx-auto mb-5 flex w-full max-w-5xl items-center gap-3">
        <BrandMark />
        <span className="font-semibold tracking-tight">PrepRoom</span>
      </div>
      <div className="mx-auto flex w-full max-w-5xl justify-center">
        <JoinSetup code={normalizedCode} initialName={session.user.name ?? ""} />
      </div>
    </main>
  );
}
