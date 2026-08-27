import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
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

  let sessionTitle = "Study session";
  if (hasDatabase) {
    const meeting = await prisma.meeting.findUnique({ where: { code: normalizedCode } });
    if (!meeting || meeting.endedAt) notFound();
    sessionTitle = meeting.title;
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <div className="relative mx-auto min-h-screen w-full max-w-[96rem] border-x bg-card">
        <header className="flex h-16 items-center justify-between border-b px-5 sm:px-8 lg:px-12">
          <Link href="/" className="font-display text-xl font-semibold tracking-[-0.02em] focus-visible:outline-none">PrepRoom</Link>
          <p className="hidden text-sm text-muted-foreground sm:block">Room {normalizedCode} · device check</p>
        </header>
        <JoinSetup code={normalizedCode} initialName={session.user.name ?? ""} sessionTitle={sessionTitle} />
      </div>
    </main>
  );
}
