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
    <main className="landing-sheet min-h-screen overflow-x-hidden">
      <div className="landing-frame relative mx-auto min-h-screen w-full max-w-[96rem] border-x border-b">
        <span aria-hidden="true" className="punch-hole left-5 top-5" />
        <span aria-hidden="true" className="punch-hole right-5 top-5" />
        <header className="flex h-20 items-center justify-between border-b px-14 sm:px-16">
          <Link href="/" className="font-display text-3xl font-semibold uppercase leading-none focus-visible:outline-none">PrepRoom</Link>
          <p className="hidden font-mono text-[0.68rem] uppercase tracking-[0.16em] sm:block">Room {normalizedCode} / device check</p>
        </header>
        <JoinSetup code={normalizedCode} initialName={session.user.name ?? ""} sessionTitle={sessionTitle} />
        <span aria-hidden="true" className="registration-mark bottom-3 left-3" />
        <span aria-hidden="true" className="registration-mark bottom-3 right-3" />
      </div>
    </main>
  );
}
