import { CodeXmlIcon, MicIcon, MonitorUpIcon, VideoIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function RoomPreview() {
  return (
    <div className="room-preview relative mx-auto w-full max-w-[620px] lg:mr-0">
      <div className="overflow-hidden rounded-[1.75rem] border bg-[oklch(0.19_0.045_263)] p-3 shadow-2xl shadow-primary/15 sm:p-4">
        <div className="mb-3 flex items-center justify-between px-1 text-white/70">
          <div className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.18em]">
            <span className="size-2 rounded-full bg-[oklch(0.75_0.18_150)]" />
            DSA mock interview
          </div>
          <span className="font-mono text-xs">21:42</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1.15fr_0.85fr]">
          <div className="grid grid-cols-2 gap-2">
            <ParticipantTile name="Meet" role="Interviewer" initials="MM" tone="blue" />
            <ParticipantTile name="Rahul" role="Candidate" initials="RS" tone="orange" />
          </div>
          <div className="rounded-2xl bg-white p-4 text-foreground">
            <div className="mb-4 flex items-center justify-between">
              <Badge variant="secondary">Problem</Badge>
              <CodeXmlIcon className="text-primary" />
            </div>
            <p className="font-display text-2xl font-medium leading-none">Two Sum</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Return the indices of two numbers that add up to the target.
            </p>
            <div className="mt-5 rounded-xl bg-[oklch(0.18_0.035_263)] p-3 font-mono text-[0.65rem] leading-5 text-white/75">
              <span className="text-[oklch(0.78_0.14_63)]">function</span> twoSum(nums, target) {"{"}
              <br />
              &nbsp;&nbsp;// explain your approach
              <br />
              {"}"}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-center gap-2">
          {[MicIcon, VideoIcon, MonitorUpIcon].map((Icon, index) => (
            <span key={index} className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white">
              <Icon />
            </span>
          ))}
        </div>
      </div>
      <div className="absolute -bottom-5 -left-3 rounded-2xl border bg-card px-4 py-3 shadow-lg sm:-left-7">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">Room code</p>
        <p className="mt-1 font-mono text-sm font-semibold tracking-widest">PRP-K8M</p>
      </div>
    </div>
  );
}

function ParticipantTile({ name, role, initials, tone }: { name: string; role: string; initials: string; tone: "blue" | "orange" }) {
  const background = tone === "blue" ? "bg-[oklch(0.47_0.16_264)]" : "bg-[oklch(0.72_0.13_62)]";
  return (
    <div className="relative flex min-h-44 flex-col items-center justify-center overflow-hidden rounded-2xl bg-white/8 text-white">
      <div className={`flex size-16 items-center justify-center rounded-full ${background} text-lg font-semibold`}>
        {initials}
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-black/20 px-3 py-2 backdrop-blur-sm">
        <p className="text-xs font-semibold">{name}</p>
        <p className="text-[0.65rem] text-white/60">{role}</p>
      </div>
    </div>
  );
}
