import { z } from "zod";

import { hasGroq } from "@/lib/config";
import { levelLabel, questionBank, trackLabel, type ExperienceLevelValue, type InterviewTrackValue } from "@/lib/interviews";

type ConversationTurn = { role: "INTERVIEWER" | "CANDIDATE"; content: string };

const nextQuestionSchema = z.object({
  feedback: z.string().trim().min(1).max(500),
  question: z.string().trim().min(1).max(800),
});

const reportSchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  technicalScore: z.number().int().min(0).max(100),
  communicationScore: z.number().int().min(0).max(100),
  summary: z.string().trim().min(1).max(1200),
  strengths: z.array(z.string().trim().min(1).max(240)).min(1).max(4),
  improvements: z.array(z.string().trim().min(1).max(240)).min(1).max(4),
  nextSteps: z.array(z.string().trim().min(1).max(240)).min(1).max(4),
});

export type InterviewReportData = z.infer<typeof reportSchema>;

async function groqJson<T>(messages: Array<{ role: "system" | "user" | "assistant"; content: string }>, schema: z.ZodType<T>) {
  if (!hasGroq) return undefined;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      messages,
      response_format: { type: "json_object" },
      reasoning_effort: "low",
      temperature: 0.3,
      max_completion_tokens: 900,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq returned an empty response");
  return schema.parse(JSON.parse(content));
}

function transcript(turns: ConversationTurn[]) {
  return turns.map((turn) => `${turn.role === "CANDIDATE" ? "Candidate" : "Interviewer"}: ${turn.content}`).join("\n\n");
}

export async function createNextQuestion({
  track,
  level,
  jobTitle,
  turns,
  answerCount,
}: {
  track: InterviewTrackValue;
  level: ExperienceLevelValue;
  jobTitle: string;
  turns: ConversationTurn[];
  answerCount: number;
}) {
  const fallbackQuestion = questionBank[track][Math.min(answerCount, questionBank[track].length - 1)];

  try {
    const generated = await groqJson(
      [
        {
          role: "system",
          content: `You are a concise software-engineering interviewer. Assess the latest answer, then ask one focused follow-up or the next question for a ${levelLabel(level)} ${jobTitle} interview in the ${trackLabel(track)} track. Do not reveal an ideal answer. Return JSON with exactly two string fields: feedback and question.`,
        },
        { role: "user", content: transcript(turns) },
      ],
      nextQuestionSchema,
    );
    if (generated) return { ...generated, provider: "groq" as const };
  } catch (error) {
    console.error("AI interviewer question failed", error);
  }

  return {
    feedback: "Answer saved. I will use it in your final report.",
    question: fallbackQuestion,
    provider: "practice" as const,
  };
}

export async function createInterviewReport({
  track,
  level,
  jobTitle,
  turns,
}: {
  track: InterviewTrackValue;
  level: ExperienceLevelValue;
  jobTitle: string;
  turns: ConversationTurn[];
}) {
  try {
    const generated = await groqJson(
      [
        {
          role: "system",
          content: `Evaluate this ${levelLabel(level)} ${jobTitle} interview in the ${trackLabel(track)} track. Be candid and specific. Score only what the transcript supports. Return JSON with integer scores from 0 to 100 for overallScore, technicalScore, and communicationScore, plus summary and arrays named strengths, improvements, and nextSteps. Each array must have 2 or 3 short items.`,
        },
        { role: "user", content: transcript(turns) },
      ],
      reportSchema,
    );
    if (generated) return { report: generated, provider: "groq" as const };
  } catch (error) {
    console.error("AI interview report failed", error);
  }

  const answers = turns.filter((turn) => turn.role === "CANDIDATE").map((turn) => turn.content.trim());
  const averageWords = answers.reduce((total, answer) => total + answer.split(/\s+/).length, 0) / Math.max(answers.length, 1);
  const communicationScore = Math.max(45, Math.min(78, Math.round(48 + averageWords / 3)));
  const technicalScore = Math.max(45, Math.min(72, Math.round(44 + averageWords / 4)));

  return {
    provider: "practice" as const,
    report: {
      overallScore: Math.round((technicalScore + communicationScore) / 2),
      technicalScore,
      communicationScore,
      summary: "Your practice interview is complete. Connect the free Groq model to receive answer-specific scoring and detailed feedback.",
      strengths: ["Completed the full interview", "Explained your thinking in your own words"],
      improvements: ["Use one concrete example in each answer", "State trade-offs before choosing an approach"],
      nextSteps: ["Repeat this track with the AI model connected", "Review each answer and add measurable details"],
    },
  };
}
