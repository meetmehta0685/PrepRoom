import Link from "next/link";
import { ArrowRightIcon, BotIcon, MicIcon, UsersIcon } from "lucide-react";

import { auth } from "@/auth";
import { MeetingLauncher } from "@/components/meeting-launcher";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const bars = [8, 14, 11, 19, 25, 17, 10, 22, 29, 16, 12, 21, 27, 13, 8, 18, 24, 15, 11, 20, 26, 16, 9, 14, 22, 12, 7, 17, 23, 15, 10, 19, 26, 13, 8, 15, 21, 12, 7, 16, 24, 14, 9, 18, 27, 15, 10, 20];

export default async function Home() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto min-h-screen w-full max-w-[100rem] border-x bg-card">
        <SiteHeader variant="landing" />

        <section className="grid border-b px-5 py-10 sm:px-8 sm:py-12 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12 lg:px-12">
          <div>
            <h1 className="max-w-[15ch] text-balance font-display text-[clamp(2.8rem,5.2vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.035em]">
              Practise the interview before it counts.
            </h1>
            <p className="mt-5 max-w-[58ch] text-base leading-7 text-muted-foreground sm:text-lg">
              Run a realistic mock interview with AI or invite a peer. Review what worked while it is still practice.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:mt-0 lg:min-w-[31rem]">
            <Link href="/interview/new" className={cn(buttonVariants({ size: "lg" }), "h-14 justify-between px-5 text-base")}>
              <span className="flex items-center gap-2"><BotIcon data-icon="inline-start" />Start AI interview</span>
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
            <a href="#peer-practice" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-14 justify-between px-5 text-base")}>
              <span className="flex items-center gap-2"><UsersIcon data-icon="inline-start" />Peer practice</span>
              <ArrowRightIcon data-icon="inline-end" />
            </a>
          </div>
        </section>

        <section aria-labelledby="canvas-title" className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <h2 id="canvas-title" className="sr-only">How an AI interview adapts to your answer</h2>
          <div className="interview-canvas overflow-hidden rounded-2xl border bg-background">
            <div className="flex items-center justify-between border-b bg-card px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2 text-sm font-semibold"><span className="size-2 rounded-full bg-primary" />AI interviewer</div>
              <p className="font-mono text-[0.68rem] tabular-nums text-muted-foreground">Illustrative session · 01:04</p>
            </div>

            <div className="relative lg:grid lg:grid-cols-[10rem_1fr]">
              <nav aria-label="Interview mode preview" className="flex border-b bg-card lg:flex-col lg:border-b-0 lg:border-r">
                <a href="#ai-lane" className="flex flex-1 items-center gap-2 border-r px-4 py-4 text-sm font-semibold text-primary lg:flex-none lg:border-b lg:border-r-0"><BotIcon className="size-4" />AI interviewer</a>
                <a href="#peer-practice" className="flex flex-1 items-center gap-2 px-4 py-4 text-sm text-muted-foreground lg:flex-none"><UsersIcon className="size-4" />Peer interviewer</a>
              </nav>

              <div id="ai-lane" className="relative min-w-0">
                <div className="playhead pointer-events-none absolute bottom-0 left-[48%] top-0 z-10 hidden w-px bg-primary lg:block" aria-hidden="true">
                  <span className="absolute -left-2.5 top-[46%] flex size-5 items-center justify-center rounded-full bg-primary ring-4 ring-primary/15"><span className="h-2 w-px bg-white" /></span>
                </div>
                <TranscriptLane time="00:00" label="AI interviewer" copy="Tell me about a scaling trade-off you made." />
                <TranscriptLane time="00:31" label="Candidate answer" copy="I kept writes synchronous because the audit trail mattered more than peak throughput. The queue became the first pressure point." active />
                <TranscriptLane time="01:04" label="Adaptive follow-up" copy="What failed first as throughput grew?" followUp />
              </div>
            </div>

            <div className="grid border-t bg-card sm:grid-cols-[1fr_auto] sm:items-center">
              <ol className="grid grid-cols-5">
                {["Context", "Opening", "Answer", "Follow-up", "Report"].map((item, index) => (
                  <li key={item} className={cn("border-r px-3 py-3 last:border-r-0", index === 2 && "bg-accent")}>
                    <span className="block font-mono text-[0.62rem] tabular-nums text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                    <span className="mt-1 block truncate text-xs font-medium sm:text-sm">{item}</span>
                  </li>
                ))}
              </ol>
              <p className="border-t px-4 py-3 text-xs text-muted-foreground sm:border-l sm:border-t-0">The next question follows the candidate.</p>
            </div>
          </div>
        </section>

        <section id="peer-practice" className="grid border-t lg:grid-cols-2">
          <div className="border-b px-5 py-10 sm:px-8 lg:border-b-0 lg:border-r lg:px-12 lg:py-12">
            <h2 className="font-display text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">Practise with AI.</h2>
            <p className="mt-3 max-w-[52ch] leading-7 text-muted-foreground">Questions shaped by your resume, target role, and answers. Upload a PDF resume, choose an interview track, then answer by voice or text.</p>
            <Link href="/interview/new" className={cn(buttonVariants({ size: "lg" }), "mt-7 h-11 px-4")}>Start AI interview<ArrowRightIcon data-icon="inline-end" /></Link>
          </div>
          <div className="px-5 py-10 sm:px-8 lg:px-12 lg:py-12">
            <h2 className="font-display text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">Practise with a peer.</h2>
            <p className="mt-3 max-w-[52ch] leading-7 text-muted-foreground">Open a private room and practise live with someone you trust.</p>
            <MeetingLauncher signedIn={Boolean(session?.user)} appearance="run-sheet" className="mt-7 max-w-2xl" />
          </div>
        </section>

        <footer className="flex flex-col gap-2 border-t px-5 py-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <p className="font-semibold text-foreground">PrepRoom</p>
          <p>AI and peer mock interviews. Private interview material.</p>
        </footer>
      </div>
    </main>
  );
}

function TranscriptLane({ time, label, copy, active = false, followUp = false }: { time: string; label: string; copy: string; active?: boolean; followUp?: boolean }) {
  return (
    <article className={cn("relative grid min-h-36 border-b bg-card last:border-b-0 sm:grid-cols-[5rem_12rem_1fr]", active && "bg-accent/45")}>
      <time className="border-b px-4 py-4 font-mono text-[0.68rem] tabular-nums text-muted-foreground sm:border-b-0 sm:border-r">{time}</time>
      <div className="border-b px-4 py-4 sm:border-b-0 sm:border-r">
        <p className={cn("text-sm font-semibold", followUp && "text-primary")}>{label}</p>
        {active ? <Waveform /> : null}
      </div>
      <div className="relative flex min-w-0 items-center px-4 py-5 sm:px-6">
        <p className={cn("max-w-[66ch] text-base leading-7", followUp && "text-lg font-semibold text-primary")}>{copy}</p>
        {followUp ? (
          <svg aria-hidden="true" viewBox="0 0 160 72" className="absolute -top-9 right-6 hidden h-20 w-40 overflow-visible text-primary lg:block">
            <path d="M8 8 C 82 8, 62 60, 150 60" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 5" />
            <circle cx="8" cy="8" r="4" fill="currentColor" />
            <path d="m143 54 7 6-8 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        ) : null}
      </div>
    </article>
  );
}

function Waveform() {
  return (
    <div aria-hidden="true" className="mt-4 flex h-8 items-center gap-[2px] overflow-hidden text-primary">
      <MicIcon className="mr-2 size-4 shrink-0" />
      {bars.map((height, index) => <span key={index} className="w-px shrink-0 bg-current" style={{ height }} />)}
    </div>
  );
}
