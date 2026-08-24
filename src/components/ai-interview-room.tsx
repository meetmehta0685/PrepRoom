"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, BotIcon, CheckIcon, Code2Icon, DownloadIcon, LightbulbIcon, MicIcon, MicOffIcon, MinusCircleIcon, RotateCcwIcon, Volume2Icon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CodeEditor } from "@/components/code-editor";
import { codeLanguageValues, type CodeLanguage, type QuestionType } from "@/lib/ai-interviewer";
import { MAX_RECORDING_MS, selectRecordingMimeType } from "@/lib/audio-recording";
import { levelLabel, trackLabel, type ExperienceLevelValue, type InterviewTrackValue } from "@/lib/interviews";
import { cn } from "@/lib/utils";

type InterviewMessage = {
  id: string;
  role: "INTERVIEWER" | "CANDIDATE";
  content: string;
  questionType: QuestionType;
  codeLanguage?: string | null;
};
type InterviewReport = {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  roleFitScore: number;
  resumeDepthScore: number;
  isBaseline?: boolean;
  summary: string;
  hiringSignal: string;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
  questionReviews: Array<{
    questionNumber: number;
    question: string;
    candidateAnswer: string;
    benchmarkAnswer: string;
    score: number;
    strengths: string[];
    gaps: string[];
    betterApproach: string;
    questionType: QuestionType;
    codeLanguage?: string | null;
  }>;
};

function resolveCodeLanguage(value?: string | null): CodeLanguage {
  return value && codeLanguageValues.includes(value as CodeLanguage) ? value as CodeLanguage : "javascript";
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
  const [codeLanguage, setCodeLanguage] = useState<CodeLanguage>(() => {
    const opening = [...interview.messages].reverse().find((message) => message.role === "INTERVIEWER");
    return resolveCodeLanguage(opening?.codeLanguage);
  });
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [practiceFallback, setPracticeFallback] = useState(interview.report?.isBaseline ?? false);
  const recorderRef = useRef<MediaRecorder | undefined>(undefined);
  const streamRef = useRef<MediaStream | undefined>(undefined);
  const recordingTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const questionsAnswered = messages.filter((message) => message.role === "CANDIDATE").length;
  const currentQuestion = useMemo(() => [...messages].reverse().find((message) => message.role === "INTERVIEWER"), [messages]);
  const isCodingQuestion = currentQuestion?.questionType === "CODE";

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function speakQuestion() {
    if (!currentQuestion || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQuestion.content);
    utterance.rate = 0.96;
    utterance.pitch = 0.96;
    window.speechSynthesis.speak(utterance);
  }

  function stopRecording() {
    if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
    setRecording(false);
  }

  async function toggleRecording() {
    if (recording) {
      stopRecording();
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || !("MediaRecorder" in window)) {
      setError("Audio recording is not supported in this browser. Type your answer instead.");
      return;
    }

    setError("");
    window.speechSynthesis?.cancel();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = selectRecordingMimeType((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
        audioBitsPerSecond: 64_000,
      });
      const chunks: Blob[] = [];
      streamRef.current = stream;
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onerror = () => {
        stream.getTracks().forEach((track) => track.stop());
        setRecording(false);
        setError("The microphone stopped recording. Try again or type your answer.");
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = undefined;
        setRecording(false);
        const audio = new Blob(chunks, { type: recorder.mimeType || mimeType || "audio/webm" });
        if (audio.size === 0) {
          setError("No audio was captured. Check the microphone and try again.");
          return;
        }

        setTranscribing(true);
        try {
          const form = new FormData();
          form.append("interviewId", interview.id);
          form.append("audio", audio, "answer.webm");
          const response = await fetch("/api/interviews/transcribe", { method: "POST", body: form });
          const result = (await response.json()) as { text?: string; error?: string };
          if (!response.ok || !result.text) {
            setError(result.error ?? "The recording could not be transcribed. Try again or type your answer.");
            return;
          }
          setAnswer((current) => [current.trim(), result.text].filter(Boolean).join(" "));
          setError("");
        } catch {
          setError("The recording could not be uploaded. Check your connection and try again.");
        } finally {
          setTranscribing(false);
        }
      };

      recorder.start(1_000);
      setRecording(true);
      recordingTimerRef.current = setTimeout(stopRecording, MAX_RECORDING_MS);
    } catch {
      setError("Microphone access is blocked. Allow microphone access or type your answer.");
    }
  }

  async function submitAnswer() {
    const submittedAnswer = answer.trim();
    if (submittedAnswer.length < 2) return;

    setSubmitting(true);
    setError("");
    setFeedback("");
    try {
      const response = await fetch(`/api/interviews/${interview.id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer: submittedAnswer,
          questionType: currentQuestion?.questionType ?? "TEXT",
          codeLanguage: isCodingQuestion ? codeLanguage : null,
        }),
      });
      const result = (await response.json()) as {
        completed?: boolean;
        feedback?: string;
        question?: InterviewMessage;
        report?: InterviewReport;
        provider?: "groq" | "practice";
        error?: string;
      };

      if (!response.ok) {
        setError(result.error ?? "The interviewer could not respond.");
        return;
      }

      const candidateMessage: InterviewMessage = {
        id: crypto.randomUUID(),
        role: "CANDIDATE",
        content: submittedAnswer,
        questionType: currentQuestion?.questionType ?? "TEXT",
        codeLanguage: isCodingQuestion ? codeLanguage : null,
      };
      setMessages((current) => result.question ? [...current, candidateMessage, result.question] : [...current, candidateMessage]);
      setAnswer("");
      if (result.question) setCodeLanguage(resolveCodeLanguage(result.question.codeLanguage));
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
    } catch {
      setError("The interviewer could not respond. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (report) {
    return <InterviewReportView interviewId={interview.id} report={report} track={interview.track} jobTitle={interview.jobTitle} practiceFallback={practiceFallback} />;
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[oklch(0.14_0.035_264)] text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8">
        <div>
          <p className="text-sm font-semibold">{interview.jobTitle}</p>
          <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-white/45">
            {trackLabel(interview.track)} · {levelLabel(interview.level)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isCodingQuestion ? <Badge className="border-white/10 bg-white/8 text-white"><Code2Icon data-icon="inline-start" />Coding question</Badge> : null}
          <Badge className="border-white/10 bg-white/8 text-white">Question {Math.min(questionsAnswered + 1, 5)} of 5</Badge>
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-73px)] w-full min-w-0 max-w-7xl lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative flex min-h-[430px] min-w-0 flex-col items-center justify-center overflow-hidden border-b border-white/10 px-6 py-14 text-center lg:border-b-0 lg:border-r">
          <div className="absolute size-[28rem] rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex size-28 items-center justify-center rounded-full border border-white/15 bg-white/8 shadow-2xl shadow-primary/30 backdrop-blur-xl">
            <BotIcon className="size-10 text-[oklch(0.82_0.13_65)]" />
            <span className="absolute inset-[-10px] rounded-full border border-[oklch(0.82_0.13_65)]/30" />
          </div>
          <div className="relative mt-8 flex h-8 items-center gap-1" aria-hidden="true">
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

        <section className="flex min-w-0 flex-col bg-background text-foreground">
          <div className="min-w-0 flex-1 px-6 py-8 sm:px-10 sm:py-10">
            <div className="mb-7 flex items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl font-medium tracking-[-0.03em]">{isCodingQuestion ? "Write working code." : "Think out loud."}</h1>
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

            {isCodingQuestion ? (
              <CodeEditor
                value={answer}
                language={codeLanguage}
                onChange={setAnswer}
                onLanguageChange={setCodeLanguage}
                disabled={submitting}
              />
            ) : (
              <textarea
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="Explain your assumptions, approach, trade-offs, and how you would verify the result..."
                className="min-h-[260px] w-full resize-y rounded-2xl border bg-card p-5 text-sm leading-7 shadow-sm outline-none transition-shadow placeholder:text-muted-foreground/65 focus-visible:ring-3 focus-visible:ring-ring/50 sm:min-h-[330px]"
                maxLength={6000}
                disabled={submitting}
              />
            )}

            {recording ? <p className="mt-3 text-sm font-medium text-destructive"><span className="mr-2 inline-block size-2 animate-pulse rounded-full bg-destructive" />Recording. Speak normally, then stop when you are done.</p> : null}
            {transcribing ? <p className="mt-3 text-sm text-muted-foreground">Transcribing your answer...</p> : null}
            {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
          </div>
          <div className="border-t bg-card px-6 py-4 sm:px-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {isCodingQuestion ? (
                <p className="text-xs leading-5 text-muted-foreground">Code runs only through AI review in this version. An isolated execution runner comes next.</p>
              ) : (
                <Button variant={recording ? "destructive" : "outline"} onClick={toggleRecording} disabled={submitting || transcribing}>
                  {recording ? <MicOffIcon data-icon="inline-start" /> : <MicIcon data-icon="inline-start" />}
                  {recording ? "Stop and transcribe" : transcribing ? "Transcribing answer" : "Answer with voice"}
                </Button>
              )}
              <Button size="lg" onClick={submitAnswer} disabled={submitting || recording || transcribing || answer.trim().length < 2}>
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

function InterviewReportView({ interviewId, report, track, jobTitle, practiceFallback }: { interviewId: string; report: InterviewReport; track: InterviewTrackValue; jobTitle: string; practiceFallback: boolean }) {
  const hasDetailedReviews = report.questionReviews?.length > 0;
  return (
    <main className="min-h-screen bg-[oklch(0.975_0.008_260)] px-5 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-3xl bg-[oklch(0.14_0.035_264)] px-6 py-8 text-white shadow-[0_18px_50px_-28px_oklch(0.14_0.035_264/0.8)] sm:px-10 sm:py-10">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="max-w-3xl text-balance font-display text-4xl font-medium tracking-[-0.04em] sm:text-5xl">Interview report for {jobTitle}</h1>
              <p className="mt-3 text-white/60">{trackLabel(track)} interview completed · {hasDetailedReviews ? `${report.questionReviews.length} answers reviewed` : "Summary report"}</p>
            </div>
            <div className="shrink-0">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-7xl font-medium tracking-[-0.04em] text-[oklch(0.82_0.13_65)] tabular-nums">{report.overallScore}</span>
                <span className="font-mono text-xs text-white/45">/ 100</span>
              </div>
              <p className="mt-1 text-sm text-white/60">Overall interview score</p>
            </div>
          </div>
        </section>

        {practiceFallback ? (
          <Alert className="mt-6">
            <BotIcon />
            <AlertTitle>Practice scoring</AlertTitle>
            <AlertDescription>AI scoring was unavailable, so this report uses PrepRoom&apos;s baseline rubric.</AlertDescription>
          </Alert>
        ) : null}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Score label="Technical" value={report.technicalScore} />
          <Score label="Communication" value={report.communicationScore} />
          <Score label="Problem solving" value={report.problemSolvingScore ?? 0} />
          <Score label="Role fit" value={report.roleFitScore ?? 0} />
          <Score label="Resume depth" value={report.resumeDepthScore ?? 0} />
        </div>

        <section className="mt-8 rounded-3xl bg-card p-6 shadow-[0_12px_36px_-28px_oklch(0.14_0.035_264/0.5)] sm:p-8">
          <h2 className="font-display text-2xl font-medium">Assessment</h2>
          <p className="mt-3 max-w-4xl text-base leading-7 text-muted-foreground">{report.summary}</p>
          <div className="mt-6 rounded-2xl bg-muted/60 p-5">
            <h3 className="text-sm font-semibold">Hiring signal</h3>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">{report.hiringSignal ?? "More evidence is needed before making a hiring recommendation."}</p>
          </div>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <ReportList title="What worked" items={report.strengths} tone="positive" />
            <ReportList title="Improve next" items={report.improvements} tone="improve" />
            <ReportList title="Practice plan" items={report.nextSteps} tone="improve" />
          </div>
          <details className="mt-8 rounded-2xl border px-5 py-4 text-sm">
            <summary className="cursor-pointer font-semibold">How scoring works</summary>
            <p className="mt-3 max-w-4xl leading-6 text-muted-foreground">Technical measures correctness and engineering depth. Communication measures clarity and structure. Problem solving measures assumptions, alternatives, and verification. Role fit measures evidence relevant to the target role. Resume depth measures ownership and detail when discussing listed experience. Scores below 60 need development, 60–74 show a developing foundation, 75–89 are strong, and 90+ are exceptional.</p>
          </details>
        </section>

        {hasDetailedReviews ? (
          <section className="mt-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-3xl font-medium tracking-[-0.03em]">Your answers, reviewed</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Compare exactly what you submitted with a strong reference answer. The benchmark is guidance, not the only valid response.</p>
              </div>
              <a href={`/api/interviews/${interviewId}/report`} className={cn(buttonVariants({ size: "lg" }), "shrink-0")}>
                <DownloadIcon data-icon="inline-start" />
                Download detailed PDF
              </a>
            </div>

            <div className="mt-7 flex flex-col gap-6">
              {report.questionReviews.map((review) => (
                <article key={review.questionNumber} className="overflow-hidden rounded-3xl bg-card shadow-[0_12px_36px_-28px_oklch(0.14_0.035_264/0.5)]">
                  <header className="flex flex-col gap-4 bg-muted/55 px-6 py-6 sm:flex-row sm:items-start sm:justify-between sm:px-8">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">Question {review.questionNumber}</Badge>
                        {review.questionType === "CODE" ? <Badge variant="outline"><Code2Icon data-icon="inline-start" />{review.codeLanguage ?? "Code"}</Badge> : null}
                      </div>
                      <h3 className="mt-4 max-w-4xl text-pretty font-display text-xl font-medium leading-snug sm:text-2xl">{review.question}</h3>
                    </div>
                    <div className="shrink-0 text-start sm:text-end">
                      <span className="font-display text-3xl font-medium tabular-nums">{review.score}</span>
                      <span className="text-xs text-muted-foreground">/100</span>
                      <p className="text-xs text-muted-foreground">Answer score</p>
                    </div>
                  </header>

                  <div className="px-6 py-7 sm:px-8 sm:py-8">
                    <div className="grid min-w-0 gap-8 lg:grid-cols-2">
                      <ReportAnswer title="Your answer" content={review.candidateAnswer} code={review.questionType === "CODE"} />
                      <ReportAnswer title="Benchmark answer" content={review.benchmarkAnswer} />
                    </div>
                    <Separator className="my-8" />
                    <div className="grid gap-8 md:grid-cols-2">
                      <ReportList title="What worked" items={review.strengths} tone="positive" headingLevel={4} />
                      <ReportList title="What was missing" items={review.gaps} tone="gap" headingLevel={4} />
                    </div>
                    <div className="mt-8 rounded-2xl bg-primary/6 p-5">
                      <h4 className="flex items-center gap-2 text-sm font-semibold"><LightbulbIcon className="text-primary" />A stronger approach</h4>
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground">{review.betterApproach}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <Alert className="mt-8">
            <AlertTitle>Detailed review unavailable</AlertTitle>
            <AlertDescription>This report was created before question-by-question reviews were added. Complete a new interview to receive the expanded report and PDF.</AlertDescription>
          </Alert>
        )}

        <div className="mt-10 flex flex-wrap gap-3 pb-6">
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
  const band = value >= 90 ? "Exceptional" : value >= 75 ? "Strong" : value >= 60 ? "Developing" : "Needs development";
  return (
    <div className="rounded-2xl bg-card p-5 shadow-[0_10px_30px_-28px_oklch(0.14_0.035_264/0.55)]">
      <div className="flex items-center justify-between text-sm"><span className="font-semibold">{label}</span><span className="font-mono text-xs text-muted-foreground">{value}/100</span></div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} /></div>
      <p className="mt-3 text-xs text-muted-foreground">{band}</p>
    </div>
  );
}

function ReportList({ title, items, tone = "positive", headingLevel = 3 }: { title: string; items: string[]; tone?: "positive" | "gap" | "improve"; headingLevel?: 3 | 4 }) {
  const Heading = headingLevel === 4 ? "h4" : "h3";
  const Icon = tone === "positive" ? CheckIcon : tone === "gap" ? MinusCircleIcon : ArrowRightIcon;
  return (
    <div>
      <Heading className="text-sm font-semibold">{title}</Heading>
      <ul className="mt-3 flex flex-col gap-3 text-sm leading-6 text-muted-foreground">
        {items.map((item) => <li key={item} className="flex gap-2"><Icon className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" /><span className="break-words">{item}</span></li>)}
      </ul>
    </div>
  );
}

function ReportAnswer({ title, content, code = false }: { title: string; content: string; code?: boolean }) {
  return (
    <div className="min-w-0">
      <h4 className="text-sm font-semibold">{title}</h4>
      <div aria-label={`${title} content`} tabIndex={0} className={cn("mt-3 whitespace-pre-wrap break-words rounded-2xl bg-muted/55 p-5 text-sm leading-7 text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:max-h-[28rem] lg:overflow-auto", code && "font-mono text-xs leading-6 text-foreground")}>
        {content}
      </div>
    </div>
  );
}
