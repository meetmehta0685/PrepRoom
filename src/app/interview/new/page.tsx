import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { InterviewSetup } from "@/components/interview-setup";

export default async function NewInterviewPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin?callbackUrl=/interview/new");

  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <div className="relative mx-auto min-h-screen w-full max-w-[96rem] border-x bg-card">
        <header className="flex h-16 items-center justify-between border-b px-5 sm:px-8 lg:px-12">
          <Link href="/" className="font-display text-xl font-semibold tracking-[-0.02em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">PrepRoom</Link>
          <p className="hidden text-sm text-muted-foreground sm:block">Interview setup</p>
        </header>
        <InterviewSetup />
      </div>
    </main>
  );
}
