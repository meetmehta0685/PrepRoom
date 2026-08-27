"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, BotIcon, FileTextIcon, UsersIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { experienceLevels, interviewTracks, levelLabel, type ExperienceLevelValue, type InterviewModeValue, type InterviewTrackValue } from "@/lib/interviews";
import { cn } from "@/lib/utils";

export function InterviewSetup() {
  const router = useRouter();
  const [interviewerType, setInterviewerType] = useState<InterviewModeValue>("AI");
  const [track, setTrack] = useState<InterviewTrackValue>("FULLSTACK");
  const [level, setLevel] = useState<ExperienceLevelValue>("ENTRY");
  const [jobTitle, setJobTitle] = useState("Software Engineer");
  const [resume, setResume] = useState<File | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  async function startInterview() {
    if (interviewerType === "AI" && !resume) {
      setError("Upload your resume PDF to start the AI interview.");
      return;
    }

    setStarting(true);
    setError("");
    const form = new FormData();
    form.append("interviewerType", interviewerType);
    form.append("track", track);
    form.append("level", level);
    form.append("jobTitle", jobTitle);
    if (interviewerType === "AI" && resume) form.append("resume", resume);

    try {
      const response = await fetch("/api/interviews", { method: "POST", body: form });
      const result = (await response.json()) as { destination?: string; error?: string };
      if (!response.ok || !result.destination) {
        setError(result.error ?? "The interview could not be started.");
        return;
      }
      router.push(result.destination);
    } catch {
      setError("The interview could not be started. Check your connection and try again.");
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="grid border-b lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[0.78fr_1.22fr]">
      <aside className="relative overflow-hidden bg-foreground px-6 py-10 text-background sm:px-10 sm:py-12 lg:border-r lg:px-12 lg:py-14">
        <h1 className="max-w-md text-balance font-display text-4xl font-semibold leading-[1.02] tracking-[-0.03em] sm:text-5xl">
          Choose who sits across from you.
        </h1>
        <p className="mt-6 max-w-sm text-sm leading-6 text-background/70">
          Use the same focused interview structure with an AI interviewer or a peer you invite.
        </p>

        <div className="mt-14 grid grid-cols-[1fr_auto_1fr] items-center gap-3" aria-hidden="true">
          <Seat label="You" detail="Candidate" active />
          <div className="h-px w-8 bg-background/30 sm:w-12" />
          <Seat
            label={interviewerType === "AI" ? "AI" : "Peer"}
            detail="Interviewer"
            icon={interviewerType === "AI" ? <BotIcon /> : <UsersIcon />}
            active
          />
        </div>
        <div className="mt-10 flex gap-1" aria-hidden="true">
          {Array.from({ length: 18 }, (_, index) => (
            <span
              key={index}
              className="w-1 bg-accent"
              style={{ height: `${8 + ((index * 7) % 24)}px`, opacity: 0.35 + ((index * 3) % 7) / 10 }}
            />
          ))}
        </div>
        <p className="mt-12 max-w-xs text-sm leading-6 text-background/70">Pick the interviewer who will make this practice useful.</p>
      </aside>

      <section className="bg-background px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
        <FieldGroup className="gap-7">
          <Field>
            <FieldLabel>Interviewer</FieldLabel>
            <div className="grid gap-3 sm:grid-cols-2">
              <ModeButton
                selected={interviewerType === "AI"}
                icon={<BotIcon />}
                title="Practice with AI"
                description="Resume-guided questions, a coding round, and feedback"
                onClick={() => setInterviewerType("AI")}
              />
              <ModeButton
                selected={interviewerType === "PEER"}
                icon={<UsersIcon />}
                title="Invite a peer"
                description="Create a live room and share the interview code"
                onClick={() => setInterviewerType("PEER")}
              />
            </div>
          </Field>

          <Field>
            <FieldLabel>Interview track</FieldLabel>
            <div className="grid gap-2 sm:grid-cols-2">
              {interviewTracks.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={track === item.value}
                  onClick={() => setTrack(item.value)}
                  className={cn(
                    "border px-4 py-3 text-left transition-colors focus-visible:outline-none",
                    track === item.value ? "bg-accent" : "bg-background hover:bg-muted",
                  )}
                >
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.description}</span>
                </button>
              ))}
            </div>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="job-title">Target role</FieldLabel>
              <Input id="job-title" value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} maxLength={80} />
            </Field>
            <Field>
              <FieldLabel>Experience</FieldLabel>
              <Select value={level} onValueChange={(value) => value && setLevel(value as ExperienceLevelValue)}>
                <SelectTrigger className="w-full"><SelectValue>{levelLabel(level)}</SelectValue></SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {experienceLevels.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </div>

          {interviewerType === "AI" ? (
            <Field data-invalid={Boolean(error && !resume)}>
              <FieldLabel htmlFor="resume">Resume PDF</FieldLabel>
              <div className="border bg-background p-4">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center border bg-secondary text-foreground">
                    <FileTextIcon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Input
                      id="resume"
                      type="file"
                      accept="application/pdf,.pdf"
                      required
                      aria-invalid={Boolean(error && !resume)}
                      onChange={(event) => setResume(event.target.files?.[0] ?? null)}
                    />
                    <FieldDescription className="mt-2">
                      The AI reads this PDF to ask about your projects and experience. The original file is not retained. Maximum 3 MB.
                    </FieldDescription>
                    {resume ? <p className="mt-2 truncate text-xs font-medium text-foreground">Selected: {resume.name}</p> : null}
                  </div>
                </div>
              </div>
            </Field>
          ) : null}

          {error ? <FieldDescription className="text-destructive">{error}</FieldDescription> : null}

          <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-muted-foreground">
              {interviewerType === "AI" ? "If AI is temporarily unavailable, the interview continues with curated practice questions." : "Your peer joins as the interviewer from the shared code."}
            </p>
            <Button size="lg" className="h-11 shrink-0" onClick={startInterview} disabled={starting || jobTitle.trim().length < 2 || (interviewerType === "AI" && !resume)}>
              {starting ? "Preparing interview" : interviewerType === "AI" ? "Start AI interview" : "Create peer interview"}
              {!starting ? <ArrowRightIcon data-icon="inline-end" /> : null}
            </Button>
          </div>
        </FieldGroup>
      </section>
    </div>
  );
}

function ModeButton({ selected, icon, title, description, onClick }: { selected: boolean; icon: React.ReactNode; title: string; description: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex gap-3 border p-4 text-left transition-colors focus-visible:outline-none",
        selected ? "bg-accent text-accent-foreground" : "bg-background hover:bg-muted",
      )}
    >
      <span className={cn("mt-0.5 flex size-9 shrink-0 items-center justify-center border", selected ? "bg-foreground text-background" : "bg-secondary text-foreground")}>{icon}</span>
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}

function Seat({ label, detail, icon, active }: { label: string; detail: string; icon?: React.ReactNode; active?: boolean }) {
  return (
    <div className="border border-background/30 p-4">
      <div className={cn("flex size-10 items-center justify-center rounded-full bg-background/10 text-sm font-semibold", active && "ring-2 ring-accent")}>
        {icon ?? label.slice(0, 2).toUpperCase()}
      </div>
      <p className="mt-6 text-sm font-semibold">{label}</p>
      <p className="mt-0.5 text-[0.68rem] text-background/55">{detail}</p>
    </div>
  );
}
