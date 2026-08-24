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
  const result = await createInterviewReport({
    track: "FULLSTACK",
    level: "ENTRY",
    jobTitle: "Software Engineer",
    turns: [
      { role: "INTERVIEWER", content: "How would you design authentication?" },
      { role: "CANDIDATE", content: "I would use short-lived sessions, secure cookies, CSRF protection, and server-side authorization checks." },
    ],
  });

  assert.equal(result.provider, "practice");
  assert.ok(result.report.overallScore >= 0 && result.report.overallScore <= 100);
  assert.ok(result.report.strengths.length > 0);
  assert.ok(result.report.nextSteps.length > 0);
});
