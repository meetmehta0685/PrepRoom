"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, BotIcon, CheckIcon, MicIcon, MicOffIcon, RotateCcwIcon, Volume2Icon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { levelLabel, trackLabel, type ExperienceLevelValue, type InterviewTrackValue } from "@/lib/interviews";
import { cn } from "@/lib/utils";

type InterviewMessage = { id: string; role: "INTERVIEWER" | "CANDIDATE"; content: string };
type InterviewReport = {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
};

type RecognitionResult = { 0: { transcript: string }; isFinal: boolean };
type RecognitionEvent = { results: ArrayLike<RecognitionResult> };
type RecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
};
type RecognitionConstructor = new () => RecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  }
}

export function AiInterviewRoom({ interview }: {
  interview: {
    id: string;
    track: InterviewTrackValue;
    level: ExperienceLevelValue;
    jobTitle: string;
    messages: InterviewMessage[];
    report?: InterviewReport | null;
  };
}) {
  const [messages, setMessages] = useState(interview.messages);
  const [report, setReport] = useState(interview.report ?? undefined);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [listening, setListening] = useState(false);
  const [practiceFallback, setPracticeFallback] = useState(false);
  const recognitionRef = useRef<RecognitionInstance | undefined>(undefined);

  const questionsAnswered = messages.filter((message) => message.role === "CANDIDATE").length;
  const currentQuestion = useMemo(() => [...messages].reverse().find((message) => message.role === "INTERVIEWER"), [messages]);

  function speakQuestion() {
    if (!currentQuestion || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQuestion.content);
    utterance.rate = 0.96;
    utterance.pitch = 0.96;
    window.speechSynthesis.speak(utterance);
  }

  function toggleListening() {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      setError("Voice input is not supported in this browser. Type your answer instead.");
      return;
    }

    setError("");
    const recognition = new Recognition();
    const existingAnswer = answer.trim();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const spoken = Array.from(event.results).map((result) => result[0].transcript).join(" ");
      setAnswer([existingAnswer, spoken].filter(Boolean).join(" "));
    };
    recognition.onerror = () => {
      setError("Voice input stopped. You can continue by typing.");
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  async function submitAnswer() {
    const submittedAnswer = answer.trim();
    if (submittedAnswer.length < 2) return;

    recognitionRef.current?.stop();
    setSubmitting(true);
    setError("");
    setFeedback("");
    const response = await fetch(`/api/interviews/${interview.id}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer: submittedAnswer }),
    });
    const result = (await response.json()) as {
      completed?: boolean;
      feedback?: string;
      question?: InterviewMessage;
      report?: InterviewReport;
      provider?: "groq" | "practice";
      error?: string;
    };
    setSubmitting(false);

    if (!response.ok) {
      setError(result.error ?? "The interviewer could not respond.");
      return;
    }

    const candidateMessage: InterviewMessage = { id: crypto.randomUUID(), role: "CANDIDATE", content: submittedAnswer };
    setMessages((current) => result.question ? [...current, candidateMessage, result.question] : [...current, candidateMessage]);
    setAnswer("");
    setPracticeFallback(result.provider === "practice");
    if (result.completed && result.report) {
      setReport(result.report);
    } else {
      setFeedback(result.feedback ?? "Answer saved.");
      window.setTimeout(() => {
        if (result.question && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(new SpeechSynthesisUtterance(result.question.content));
        }
      }, 250);
    }
  }

  if (report) {
    return <InterviewReportView report={report} track={interview.track} jobTitle={interview.jobTitle} practiceFallback={practiceFallback} />;
  }

  return (
    <main className="min-h-screen bg-[oklch(0.14_0.035_264)] text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8">
        <div>
          <p className="text-sm font-semibold">{interview.jobTitle}</p>
          <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-white/45">
            {trackLabel(interview.track)} · {levelLabel(interview.level)}
          </p>
        </div>
        <Badge className="border-white/10 bg-white/8 text-white">Question {Math.min(questionsAnswered + 1, 5)} of 5</Badge>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-73px)] w-full max-w-7xl lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative flex min-h-[430px] flex-col items-center justify-center overflow-hidden border-b border-white/10 px-6 py-14 text-center lg:border-b-0 lg:border-r">
          <div className="absolute size-[28rem] rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex size-28 items-center justify-center rounded-full border border-white/15 bg-white/8 shadow-2xl shadow-primary/30 backdrop-blur-xl">
            <BotIcon className="size-10 text-[oklch(0.82_0.13_65)]" />
            <span className="absolute inset-[-10px] rounded-full border border-[oklch(0.82_0.13_65)]/30" />
          </div>
          <p className="relative mt-6 font-mono text-xs uppercase tracking-[0.2em] text-white/45">AI interviewer</p>
          <div className="relative mt-6 flex h-8 items-center gap-1" aria-hidden="true">
            {Array.from({ length: 22 }, (_, index) => (
              <span key={index} className="w-1 rounded-full bg-[oklch(0.82_0.13_65)]" style={{ height: `${8 + ((index * 11) % 24)}px`, opacity: 0.35 + ((index * 5) % 6) / 10 }} />
            ))}
          </div>
          <p className="relative mt-8 max-w-xl font-display text-2xl leading-snug tracking-[-0.02em] sm:text-3xl">
            {currentQuestion?.content}
          </p>
          <Button variant="secondary" className="relative mt-7" onClick={speakQuestion}>
            <Volume2Icon data-icon="inline-start" />
            Read question aloud
          </Button>
        </section>

        <section className="flex flex-col bg-background text-foreground">
          <div className="flex-1 px-6 py-8 sm:px-10 sm:py-10">
            <div className="mb-7 flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Your answer</p>
                <h1 className="mt-2 font-display text-3xl font-medium tracking-[-0.03em]">Think out loud.</h1>
              </div>
              <span className="text-xs text-muted-foreground">{answer.trim() ? answer.trim().split(/\s+/).length : 0} words</span>
            </div>

            {feedback ? (
              <Alert className="mb-5 border-primary/20 bg-primary/5">
                <CheckIcon />
                <AlertTitle>Previous answer saved</AlertTitle>
                <AlertDescription>{feedback}</AlertDescription>
              </Alert>
            ) : null}

            <textarea
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Explain your assumptions, approach, trade-offs, and how you would verify the result..."
              className="min-h-[260px] w-full resize-y rounded-2xl border bg-card p-5 text-sm leading-7 shadow-sm outline-none transition-shadow placeholder:text-muted-foreground/65 focus-visible:ring-3 focus-visible:ring-ring/50 sm:min-h-[330px]"
              maxLength={6000}
              disabled={submitting}
            />

            {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
          </div>
          <div className="border-t bg-card px-6 py-4 sm:px-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button variant={listening ? "destructive" : "outline"} onClick={toggleListening} disabled={submitting}>
                {listening ? <MicOffIcon data-icon="inline-start" /> : <MicIcon data-icon="inline-start" />}
                {listening ? "Stop listening" : "Answer with voice"}
              </Button>
              <Button size="lg" onClick={submitAnswer} disabled={submitting || answer.trim().length < 2}>
                {submitting ? (questionsAnswered === 4 ? "Preparing report" : "Preparing next question") : questionsAnswered === 4 ? "Finish interview" : "Submit answer"}
                {!submitting ? <ArrowRightIcon data-icon="inline-end" /> : null}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function InterviewReportView({ report, track, jobTitle, practiceFallback }: { report: InterviewReport; track: InterviewTrackValue; jobTitle: string; practiceFallback: boolean }) {
  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-5 border-b pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Interview report</p>
            <h1 className="mt-3 font-display text-4xl font-medium tracking-[-0.04em] sm:text-5xl">{jobTitle}</h1>
            <p className="mt-3 text-muted-foreground">{trackLabel(track)} interview completed</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-7xl font-medium tracking-[-0.06em] text-primary">{report.overallScore}</span>
            <span className="font-mono text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>

        {practiceFallback ? (
          <Alert className="mt-6 border-[oklch(0.78_0.13_65)]/40 bg-[oklch(0.95_0.04_75)]">
            <BotIcon />
            <AlertTitle>Practice scoring</AlertTitle>
            <AlertDescription>Connect the free Groq model to replace this baseline report with answer-specific AI feedback.</AlertDescription>
          </Alert>
        ) : null}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Score label="Technical" value={report.technicalScore} />
          <Score label="Communication" value={report.communicationScore} />
        </div>

        <section className="mt-8 rounded-3xl border bg-card p-6 sm:p-8">
          <h2 className="font-display text-2xl font-medium">Assessment</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">{report.summary}</p>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <ReportList title="What worked" items={report.strengths} />
            <ReportList title="Improve next" items={report.improvements} />
            <ReportList title="Practice plan" items={report.nextSteps} />
          </div>
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/interview/new" className={cn(buttonVariants({ size: "lg" }))}>
            <RotateCcwIcon data-icon="inline-start" />
            Start another interview
          </Link>
          <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>Return home</Link>
        </div>
      </div>
    </main>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between text-sm"><span className="font-semibold">{label}</span><span className="font-mono text-xs text-muted-foreground">{value}/100</span></div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} /></div>
    </div>
  );
}

function ReportList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
        {items.map((item) => <li key={item} className="border-l-2 border-primary/30 pl-3">{item}</li>)}
      </ul>
    </div>
  );
}
