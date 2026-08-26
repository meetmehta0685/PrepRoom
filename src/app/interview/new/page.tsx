import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { InterviewSetup } from "@/components/interview-setup";

export default async function NewInterviewPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin?callbackUrl=/interview/new");

  return (
    <main className="landing-sheet min-h-screen overflow-x-hidden">
      <div className="landing-frame relative mx-auto min-h-screen w-full max-w-[96rem] border-x border-b">
        <span aria-hidden="true" className="punch-hole left-5 top-5" />
        <span aria-hidden="true" className="punch-hole right-5 top-5" />
        <header className="flex h-20 items-center justify-between border-b px-14 sm:px-16">
          <Link href="/" className="font-display text-3xl font-semibold uppercase leading-none focus-visible:outline-none">PrepRoom</Link>
          <p className="hidden font-mono text-[0.68rem] uppercase tracking-[0.16em] sm:block">AI rehearsal / setup</p>
        </header>
        <InterviewSetup />
        <span aria-hidden="true" className="registration-mark bottom-3 left-3" />
        <span aria-hidden="true" className="registration-mark bottom-3 right-3" />
      </div>
    </main>
  );
}
