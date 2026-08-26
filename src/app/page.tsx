import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { auth } from "@/auth";
import { MeetingLauncher } from "@/components/meeting-launcher";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const cues = [
  { code: "A01", title: "Resume context", copy: "Backend engineer · payments API", state: "Set" },
  { code: "A02", title: "Opening question", copy: "Tell me about a scaling trade-off you made.", state: "Asked" },
  { code: "A03", title: "Candidate answer", copy: "I kept writes synchronous for auditability.", state: "Current" },
  { code: "A04", title: "Adaptive follow-up", copy: "What failed first as throughput grew?", state: "Next" },
  { code: "A05", title: "Interview report", copy: "Technical judgment, communication, next practice.", state: "After" },
];

export default async function Home() {
  const session = await auth();

  return (
    <main className="landing-sheet min-h-screen overflow-x-hidden">
      <div className="landing-frame relative mx-auto w-full max-w-[96rem] border-x border-b">
        <span aria-hidden="true" className="punch-hole left-5 top-5" />
        <span aria-hidden="true" className="punch-hole right-5 top-5" />
        <SiteHeader variant="landing" />

        <section className="grid min-h-[37rem] border-b lg:grid-cols-[0.37fr_0.63fr]">
          <div className="flex min-w-0 flex-col border-b px-6 pb-7 pt-10 sm:px-10 lg:border-b-0 lg:border-r lg:px-12 lg:pb-8 lg:pt-12">
            <h1 className="max-w-[9ch] font-display text-[clamp(4rem,7.2vw,6rem)] font-semibold leading-[0.84] tracking-[-0.025em] text-balance">
              Practise the interview before it counts.
            </h1>
            <div aria-hidden="true" className="mt-7 h-[3px] w-full max-w-md bg-foreground" />
            <p className="mt-7 max-w-[36rem] text-base leading-7 sm:text-lg">
              Run a realistic mock interview with AI or invite a peer. Review what worked while it is still practice.
            </p>
            <div className="mt-auto hidden items-end justify-between gap-8 pt-12 text-xs lg:flex">
              <div className="flex items-end gap-3">
                <span className="font-display text-5xl font-semibold leading-none">SC.</span>
                <span className="font-mono uppercase tracking-[0.14em]">Preparation / 01</span>
              </div>
              <p className="font-note max-w-36 -rotate-2 text-right text-lg italic leading-5">Practice now. Perform later.</p>
            </div>
          </div>

          <div className="grid min-w-0 md:grid-cols-2">
            <p className="bg-accent px-6 py-2 font-mono text-[0.65rem] uppercase tracking-[0.14em] md:hidden">Choose your interviewer</p>
            <nav aria-label="Interview modes" className="grid grid-cols-2 border-b md:hidden">
              <a href="#ai-cue" className="border-r px-5 py-4">
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em]">A01</span>
                <span className="mt-1 block font-display text-2xl uppercase">AI interviewer</span>
              </a>
              <a href="#peer-cue" className="px-5 py-4">
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em]">B02</span>
                <span className="mt-1 block font-display text-2xl uppercase">Peer interviewer</span>
              </a>
            </nav>
            <ModeCue id="ai-cue" code="A01" title="AI interviewer" description="Questions shaped by your resume, target role, and answers." className="border-b md:border-b-0 md:border-r">
              <Link href="/interview/new" className={cn(buttonVariants({ size: "lg" }), "h-12 w-full justify-between px-5")}>
                Start AI interview
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
              <ul className="mt-5 grid gap-2 text-sm leading-5">
                <li>Upload a PDF resume</li>
                <li>Choose a role and interview track</li>
                <li>Answer by voice or text</li>
              </ul>
            </ModeCue>

            <ModeCue id="peer-cue" code="B02" title="Peer interviewer" description="Open a private room and practise live with someone you trust.">
              <MeetingLauncher signedIn={Boolean(session?.user)} appearance="run-sheet" className="w-full" />
            </ModeCue>
          </div>
        </section>

        <section aria-labelledby="run-title" className="relative px-6 py-7 sm:px-10 lg:px-12">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="run-title" className="font-display text-3xl font-semibold uppercase leading-none tracking-[-0.02em]">One interview run</h2>
              <p className="mt-2 text-sm">Illustrative path. The real questions follow the candidate.</p>
            </div>
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em]">Resume → answer → next question → report</p>
          </div>

          <div className="overflow-x-auto border-y">
            <ol className="cue-track grid min-w-[62rem] grid-cols-5">
              {cues.map((cue, index) => (
                <li key={cue.code} className={cn("cue-step relative min-h-44 border-r p-4 last:border-r-0", index === 2 && "cue-step-current")}>
                  <div className="flex items-start justify-between gap-3">
                    <span className={cn("cue-code font-display text-2xl font-semibold", index < 3 && "bg-accent px-1")}>{cue.code}</span>
                    <span className="font-note -rotate-2 text-base italic">{cue.state}</span>
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold uppercase leading-none">{cue.title}</h3>
                  <p className="mt-3 max-w-[24ch] text-sm leading-5">{cue.copy}</p>
                  {index < cues.length - 1 ? (
                    <ArrowRightIcon aria-hidden="true" className="cue-arrow absolute -right-3 top-1/2 z-10 size-6 -translate-y-1/2 bg-background" />
                  ) : null}
                  {index === 2 ? (
                    <Image
                      src="/preproom-adaptive-note.png"
                      alt="Next cue adapted from this answer."
                      width={800}
                      height={360}
                      className="adaptive-note absolute -right-16 bottom-1 z-20 h-auto w-40 -rotate-2"
                    />
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <footer className="flex flex-col gap-2 border-t px-6 py-5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-12">
          <p className="font-mono uppercase tracking-[0.14em]">PrepRoom · AI and peer mock interviews</p>
          <p>Private interview material. Clear next practice.</p>
        </footer>

        <span aria-hidden="true" className="registration-mark bottom-3 left-3" />
        <span aria-hidden="true" className="registration-mark bottom-3 right-3" />
      </div>
    </main>
  );
}

function ModeCue({
  id,
  code,
  title,
  description,
  className,
  children,
}: {
  id: string;
  code: string;
  title: string;
  description: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <article id={id} className={cn("mode-cue relative flex min-h-[31rem] min-w-0 scroll-mt-4 flex-col px-6 pb-8 pt-12 sm:px-8 lg:min-h-[37rem]", className)}>
      <span aria-hidden="true" className="tape-tab left-8 top-5" />
      <div>
        <h2 className="font-display text-4xl font-semibold uppercase leading-none tracking-[-0.02em] sm:text-5xl">{title}</h2>
        <p className="mt-4 max-w-[31ch] text-base leading-6">{description}</p>
      </div>
      <div className="mode-code-frame relative my-8 flex flex-1 items-center justify-center border-y">
        <span className="font-display text-[clamp(5rem,9vw,8.5rem)] font-semibold leading-none tracking-[0.08em]">{code}</span>
      </div>
      <div>{children}</div>
    </article>
  );
}
