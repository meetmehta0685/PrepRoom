import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { BrandMark } from "@/components/brand-mark";
import { InterviewSetup } from "@/components/interview-setup";

export default async function NewInterviewPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin?callbackUrl=/interview/new");

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto mb-6 flex w-full max-w-6xl items-center gap-3">
        <BrandMark />
        <span className="font-semibold tracking-tight">PrepRoom</span>
      </div>
      <div className="mx-auto w-full max-w-6xl">
        <InterviewSetup />
      </div>
    </main>
  );
}
