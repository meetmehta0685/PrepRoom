import assert from "node:assert/strict";
import test from "node:test";

import { createInterviewReport, createNextQuestion } from "../src/lib/ai-interviewer";
import { questionBank } from "../src/lib/interviews";

test("uses the next curated question when no AI key is configured", async () => {
  const result = await createNextQuestion({
    track: "BACKEND",
    level: "ENTRY",
    jobTitle: "Backend Engineer",
    answerCount: 1,
    turns: [
      { role: "INTERVIEWER", content: questionBank.BACKEND[0] },
      { role: "CANDIDATE", content: "I would accept an idempotency key and persist the first result." },
    ],
  });

  assert.equal(result.provider, "practice");
  assert.equal(result.question, questionBank.BACKEND[1]);
});

test("creates a bounded practice report when no AI key is configured", async () => {
  const candidateAnswer = "I would use short-lived sessions, secure cookies, CSRF protection, and server-side authorization checks.";
  const result = await createInterviewReport({
    track: "FULLSTACK",
    level: "ENTRY",
    jobTitle: "Software Engineer",
    turns: [
      { role: "INTERVIEWER", content: "How would you design authentication?" },
      { role: "CANDIDATE", content: candidateAnswer },
    ],
  });

  assert.equal(result.provider, "practice");
  assert.ok(result.report.overallScore >= 0 && result.report.overallScore <= 100);
  assert.ok(result.report.strengths.length > 0);
  assert.ok(result.report.nextSteps.length > 0);
  assert.equal(result.report.questionReviews.length, 1);
  assert.equal(result.report.questionReviews[0].candidateAnswer, candidateAnswer);
  assert.equal(result.report.questionReviews[0].question, "How would you design authentication?");
  assert.ok(result.report.questionReviews[0].benchmarkAnswer.length > 80);
  assert.ok(result.report.questionReviews[0].betterApproach.length > 40);
});

test("adds a coding question before a technical interview ends", async () => {
  const result = await createNextQuestion({
    track: "FRONTEND",
    level: "MID",
    jobTitle: "Frontend Engineer",
    answerCount: 3,
    turns: [
      { role: "INTERVIEWER", content: "Tell me about your frontend work.", questionType: "TEXT" },
      { role: "CANDIDATE", content: "I built a React design system.", questionType: "TEXT" },
      { role: "INTERVIEWER", content: "How did you test it?", questionType: "TEXT" },
      { role: "CANDIDATE", content: "With component and browser tests.", questionType: "TEXT" },
      { role: "INTERVIEWER", content: "How did you handle accessibility?", questionType: "TEXT" },
      { role: "CANDIDATE", content: "With keyboard and screen-reader checks.", questionType: "TEXT" },
    ],
  });

  assert.equal(result.questionType, "CODE");
  assert.equal(result.codeLanguage, "javascript");
  assert.match(result.question, /example/i);
  assert.match(result.question, /(class|function|input|output)/i);
});
