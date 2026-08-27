import Link from "next/link";
import { ArrowLeftIcon, MicIcon, VideoIcon } from "lucide-react";

import { auth } from "@/auth";
import { MeetingLauncher } from "@/components/meeting-launcher";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function JoinLandingPage() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto min-h-screen w-full max-w-[90rem] border-x bg-card">
        <header className="flex h-16 items-center justify-between border-b px-5 sm:px-8">
          <Link href="/" className="font-display text-xl font-semibold tracking-[-0.02em]">PrepRoom</Link>
          <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "px-3")}><ArrowLeftIcon data-icon="inline-start" />Back</Link>
        </header>

        <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[0.9fr_1.1fr]">
          <section className="flex flex-col border-b px-5 py-10 sm:px-8 sm:py-14 lg:border-b-0 lg:border-r lg:px-12">
            <div>
              <h1 className="max-w-[13ch] text-balance font-display text-[clamp(2.8rem,5vw,5rem)] font-semibold leading-[0.98] tracking-[-0.035em]">Join a peer interview.</h1>
              <p className="mt-5 max-w-[52ch] text-base leading-7 text-muted-foreground sm:text-lg">Use the code from your interviewer. You will check your camera, microphone, and display name before entering.</p>
            </div>

            <div className="mt-10 grid border-y sm:grid-cols-2 lg:mt-auto">
              <div className="flex gap-3 border-b px-4 py-5 sm:border-b-0 sm:border-r"><VideoIcon className="mt-0.5 size-5 text-primary" /><div><p className="font-semibold">Camera check</p><p className="mt-1 text-sm leading-5 text-muted-foreground">Preview video before joining.</p></div></div>
              <div className="flex gap-3 px-4 py-5"><MicIcon className="mt-0.5 size-5 text-primary" /><div><p className="font-semibold">Microphone check</p><p className="mt-1 text-sm leading-5 text-muted-foreground">Choose the device you want to use.</p></div></div>
            </div>
          </section>

          <section className="flex items-center px-5 py-10 sm:px-8 lg:px-14">
            <div className="w-full max-w-2xl">
              <h2 className="font-display text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">Enter your room code</h2>
              <p className="mt-3 max-w-[58ch] leading-7 text-muted-foreground">Room codes use six or more letters and numbers. Paste the code with or without its dash.</p>
              <div className="mt-8 border-y py-8">
                <MeetingLauncher signedIn={Boolean(session?.user)} showCreate={false} appearance="run-sheet" className="max-w-none" />
              </div>
              <p className="mt-5 text-sm text-muted-foreground">Signed-in candidates continue directly to device check.</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
