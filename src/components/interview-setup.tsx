"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, FileTextIcon } from "lucide-react";

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

  const selectedTrack = interviewTracks.find((item) => item.value === track)?.label ?? "Choose a track";
  const resumeStatus = interviewerType === "PEER"
    ? "Resume not needed"
    : resume
      ? "Resume added"
      : "Add resume PDF";
  const practicePlan = [
    interviewerType === "AI" ? "AI interviewer" : "Peer interviewer",
    selectedTrack,
    jobTitle.trim() || "Add a target role",
    levelLabel(level),
    resumeStatus,
  ].join(" · ");

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
    <section className="border-b bg-card">
      <div className="mx-auto w-full max-w-[82rem] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-11">
        <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h1 className="max-w-3xl text-balance font-display text-3xl font-semibold leading-[1.04] tracking-[-0.03em] sm:text-4xl">
            Practice starts with a plan that feels like yours.
          </h1>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            Choose a path, and we’ll shape one focused interview around it.
          </p>
        </div>

        <FieldGroup className="gap-5 sm:gap-6">
          <Field>
            <FieldLabel>Who will interview you?</FieldLabel>
            <div className="grid gap-3 sm:grid-cols-2">
              <ModeButton
                selected={interviewerType === "AI"}
                title="Practice with AI"
                description="Questions guided by your resume, role, and track"
                onClick={() => {
                  setInterviewerType("AI");
                  setError("");
                }}
              />
              <ModeButton
                selected={interviewerType === "PEER"}
                title="Invite a peer"
                description="Create a live interview and share its code"
                onClick={() => {
                  setInterviewerType("PEER");
                  setError("");
                }}
              />
            </div>
          </Field>

          <Field>
            <FieldLabel>Choose an interview track</FieldLabel>
            <div className="grid grid-cols-1 border-t sm:grid-cols-2 lg:grid-cols-3">
              {interviewTracks.map((item, index) => (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={track === item.value}
                  onClick={() => {
                    setTrack(item.value);
                    setError("");
                  }}
                  className={cn(
                    "min-h-[4.1rem] border-b px-4 py-3 text-left transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    index % 2 === 0 && "sm:max-lg:border-r",
                    index % 3 !== 2 && "lg:border-r",
                    track === item.value ? "bg-accent text-accent-foreground" : "bg-background hover:bg-muted",
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
              <Input
                id="job-title"
                value={jobTitle}
                onChange={(event) => {
                  setJobTitle(event.target.value);
                  setError("");
                }}
                maxLength={80}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="experience-level">Experience</FieldLabel>
              <Select
                value={level}
                onValueChange={(value) => {
                  if (value && experienceLevels.some((item) => item.value === value)) {
                    setLevel(value as ExperienceLevelValue);
                    setError("");
                  }
                }}
              >
                <SelectTrigger id="experience-level" className="w-full"><SelectValue>{levelLabel(level)}</SelectValue></SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {experienceLevels.map((item) => (
                      <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </div>

          {interviewerType === "AI" ? (
            <Field data-invalid={Boolean(error && !resume)}>
              <FieldLabel htmlFor="resume">Resume PDF</FieldLabel>
              <div className="border bg-background p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center border bg-secondary text-foreground">
                    <FileTextIcon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Input
                      id="resume"
                      type="file"
                      accept="application/pdf,.pdf"
                      required
                      aria-invalid={Boolean(error && !resume)}
                      onChange={(event) => {
                        setResume(event.target.files?.[0] ?? null);
                        setError("");
                      }}
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

          {error ? <FieldDescription role="alert" className="text-destructive">{error}</FieldDescription> : null}

          <div className="flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p aria-live="polite" aria-atomic="true" className="min-w-0 text-xs leading-5 text-muted-foreground">
              <span className="font-semibold text-foreground">Your practice</span>{" "}
              <span className="mx-2">·</span>{" "}
              <span>{practicePlan}</span>
            </p>
            <Button
              size="lg"
              className="h-11 w-full shrink-0 sm:w-auto"
              onClick={startInterview}
              disabled={starting || jobTitle.trim().length < 2 || (interviewerType === "AI" && !resume)}
            >
              {starting ? "Preparing interview" : interviewerType === "AI" ? "Start AI interview" : "Create peer interview"}
              {!starting ? <ArrowRightIcon data-icon="inline-end" /> : null}
            </Button>
          </div>
        </FieldGroup>
      </div>
    </section>
  );
}

function ModeButton({ selected, title, description, onClick }: { selected: boolean; title: string; description: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "min-h-[4.25rem] border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "border-primary bg-accent text-accent-foreground" : "bg-background hover:bg-muted",
      )}
    >
      <span className="block text-sm font-semibold">{title}</span>
      <span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span>
    </button>
  );
}
