import { ArrowUpRightIcon, CheckIcon } from "lucide-react";

import { auth } from "@/auth";
import { MeetingLauncher } from "@/components/meeting-launcher";
import { RoomPreview } from "@/components/room-preview";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";

const outcomes = ["Mock interviews", "Peer study calls", "Screen sharing", "Built-in room chat"];

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
            Open a focused room for mock interviews, DSA practice, and study sessions. Video, screen sharing, and chat stay in one place.
          </p>
          <div className="mt-8">
            <MeetingLauncher signedIn={Boolean(session?.user)} />
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
          <Feature label="01" title="Create in one click" copy="Start a private room and share the short code with your study partner." />
          <Feature label="02" title="Check your setup" copy="Choose your camera and microphone before you enter the room." />
          <Feature label="03" title="Stay on the problem" copy="Use chat and screen sharing without leaving the call or breaking focus." />
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
