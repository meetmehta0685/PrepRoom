import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRightIcon, BotIcon, PlusIcon, UsersIcon } from "lucide-react";

import { auth } from "@/auth";
import { EndRoomButton } from "@/components/end-room-button";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { levelLabel, trackLabel, type ExperienceLevelValue, type InterviewTrackValue } from "@/lib/interviews";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

export default async function InterviewsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/interviews");

  const [interviews, rooms] = await Promise.all([
    prisma.interviewSession.findMany({
      where: { candidateId: session.user.id, interviewerType: "AI" },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        jobTitle: true,
        track: true,
        level: true,
        status: true,
        createdAt: true,
        completedAt: true,
        report: { select: { overallScore: true, isBaseline: true } },
      },
    }),
    prisma.meeting.findMany({
      where: { createdById: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        code: true,
        title: true,
        createdAt: true,
        endedAt: true,
        interview: { select: { track: true, level: true } },
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto min-h-screen w-full max-w-[90rem] border-x bg-card">
        <SiteHeader variant="landing" />

        <section className="border-b px-5 py-10 sm:px-8 sm:py-12 lg:px-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-[clamp(2.4rem,4vw,3.5rem)] font-semibold leading-[1] tracking-[-0.035em]">My interviews</h1>
              <p className="mt-4 max-w-[56ch] leading-7 text-muted-foreground">Return to a report, resume an unfinished AI interview, or manage the peer rooms you created.</p>
            </div>
            <Link href="/interview/new" className={cn(buttonVariants({ size: "lg" }), "h-11 shrink-0")}>
              <PlusIcon data-icon="inline-start" />
              New interview
            </Link>
          </div>
        </section>

        <section aria-labelledby="ai-interviews-title" className="border-b">
          <header className="flex items-center gap-3 border-b px-5 py-4 sm:px-8 lg:px-12">
            <BotIcon className="size-5 text-primary" aria-hidden="true" />
            <h2 id="ai-interviews-title" className="font-display text-xl font-semibold tracking-[-0.02em]">AI interviews</h2>
            <span className="font-mono text-xs text-muted-foreground tabular-nums">{interviews.length}</span>
          </header>
          {interviews.length ? (
            <ul>
              {interviews.map((interview) => {
                const finished = interview.status === "COMPLETED" && interview.report;
                const active = interview.status === "ACTIVE";
                return (
                  <li key={interview.id} className="flex flex-col gap-4 border-b px-5 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{interview.jobTitle}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {trackLabel(interview.track as InterviewTrackValue)} · {levelLabel(interview.level as ExperienceLevelValue)} · {dateFormat.format(interview.completedAt ?? interview.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      {finished ? (
                        interview.report!.isBaseline ? (
                          <Badge variant="outline">Not scored</Badge>
                        ) : (
                          <p className="font-display text-2xl font-semibold tabular-nums">
                            {interview.report!.overallScore}
                            <span className="ml-1 font-mono text-xs font-normal text-muted-foreground">/100</span>
                          </p>
                        )
                      ) : (
                        <Badge variant={active ? "secondary" : "outline"}>{active ? "In progress" : "Not finished"}</Badge>
                      )}
                      {finished || active ? (
                        <Link href={`/interview/${interview.id}`} className={cn(buttonVariants({ variant: finished ? "outline" : "default", size: "sm" }), "px-3")}>
                          {finished ? "View report" : "Resume"}
                          <ArrowRightIcon data-icon="inline-end" />
                        </Link>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState message="You have not started an AI interview yet." href="/interview/new" action="Start an AI interview" />
          )}
        </section>

        <section aria-labelledby="peer-rooms-title">
          <header className="flex items-center gap-3 border-b px-5 py-4 sm:px-8 lg:px-12">
            <UsersIcon className="size-5 text-primary" aria-hidden="true" />
            <h2 id="peer-rooms-title" className="font-display text-xl font-semibold tracking-[-0.02em]">Peer rooms you created</h2>
            <span className="font-mono text-xs text-muted-foreground tabular-nums">{rooms.length}</span>
          </header>
          {rooms.length ? (
            <ul>
              {rooms.map((room) => (
                <li key={room.code} className="flex flex-col gap-4 border-b px-5 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {room.interview
                        ? `${trackLabel(room.interview.track as InterviewTrackValue)} · ${levelLabel(room.interview.level as ExperienceLevelValue)}`
                        : room.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      <span className="font-mono">{room.code}</span> · {room.endedAt ? `Ended ${dateFormat.format(room.endedAt)}` : `Created ${dateFormat.format(room.createdAt)}`}
                    </p>
                  </div>
                  {room.endedAt ? (
                    <Badge variant="outline" className="self-start sm:self-auto">Ended</Badge>
                  ) : (
                    <div className="flex shrink-0 items-start gap-2">
                      <Link href={`/join/${room.code}`} className={cn(buttonVariants({ size: "sm" }), "px-3")}>
                        Rejoin
                        <ArrowRightIcon data-icon="inline-end" />
                      </Link>
                      <EndRoomButton code={room.code} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState message="You have not created a peer room yet." href="/" action="Create a peer room" />
          )}
        </section>
      </div>
    </main>
  );
}

function EmptyState({ message, href, action }: { message: string; href: string; action: string }) {
  return (
    <div className="flex flex-col items-start gap-3 px-5 py-10 sm:px-8 lg:px-12">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Link href={href} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "px-3")}>
        {action}
        <ArrowRightIcon data-icon="inline-end" />
      </Link>
    </div>
  );
}
