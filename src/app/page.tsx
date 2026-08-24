import Link from "next/link";
import { ArrowRightIcon, ArrowUpRightIcon, CheckIcon } from "lucide-react";

import { auth } from "@/auth";
import { MeetingLauncher } from "@/components/meeting-launcher";
import { RoomPreview } from "@/components/room-preview";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const outcomes = ["AI interviewer", "Peer interviews", "Adaptive questions", "Feedback reports"];

export default async function Home() {
  const session = await auth();

  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />
      <section className="mx-auto grid w-full max-w-7xl items-center gap-16 px-5 pb-24 pt-10 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-10 lg:pb-32 lg:pt-20">
        <div>
          <Badge variant="secondary" className="mb-6 gap-2 px-3 py-1.5">
            <span className="size-1.5 rounded-full bg-primary" />
            Built for placement prep
          </Badge>
          <h1 className="max-w-2xl font-display text-5xl font-medium leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            Practise together. <span className="text-primary">Interview better.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Practise software-engineering interviews with an AI or invite a peer. Work through focused questions and leave with a clear report.
          </p>
          <div className="mt-8 flex flex-col items-start gap-5">
            <Link href="/interview/new" className={cn(buttonVariants({ size: "lg" }), "h-12 px-5")}>
              Start a mock interview
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
            <div className="w-full max-w-md">
              <p className="mb-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">Joining an interview?</p>
              <MeetingLauncher signedIn={Boolean(session?.user)} showCreate={false} />
            </div>
          </div>
          <ul className="mt-9 flex flex-wrap gap-x-5 gap-y-3 text-sm text-muted-foreground">
            {outcomes.map((outcome) => (
              <li key={outcome} className="flex items-center gap-2">
                <CheckIcon className="text-primary" />
                {outcome}
              </li>
            ))}
          </ul>
        </div>
        <RoomPreview />
      </section>

      <section className="border-y bg-card/70 backdrop-blur-sm">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-12 sm:px-8 md:grid-cols-3 lg:px-10">
          <Feature label="01" title="Choose the interviewer" copy="Practise alone with AI or invite a peer into a private LiveKit room." />
          <Feature label="02" title="Work through five questions" copy="Pick a software-engineering track and answer at the level you are targeting." />
          <Feature label="03" title="Review the report" copy="See technical and communication scores with concrete areas to practise next." />
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <p>PrepRoom, built for deliberate practice.</p>
        <a href="https://livekit.io" className="flex items-center gap-1.5 hover:text-foreground">
          Calls powered by LiveKit <ArrowUpRightIcon />
        </a>
      </footer>
    </main>
  );
}

function Feature({ label, title, copy }: { label: string; title: string; copy: string }) {
  return (
    <article className="grid grid-cols-[auto_1fr] gap-4">
      <span className="font-mono text-xs text-primary">{label}</span>
      <div>
        <h2 className="font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
      </div>
    </article>
  );
}
