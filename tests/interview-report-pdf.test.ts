import assert from "node:assert/strict";
import test from "node:test";

import { extractText } from "unpdf";

import { createInterviewReportPdf } from "../src/lib/interview-report-pdf";

test("creates a detailed multi-page PDF with candidate and benchmark answers", async () => {
  const pdf = await createInterviewReportPdf({
    jobTitle: "Backend Engineer",
    track: "Backend",
    level: "Entry level",
    completedAt: new Date("2026-08-24T12:00:00.000Z"),
    overallScore: 74,
    technicalScore: 76,
    communicationScore: 72,
    problemSolvingScore: 75,
    roleFitScore: 74,
    resumeDepthScore: 70,
    summary: "The candidate showed a sound foundation and should make trade-offs more explicit.",
    hiringSignal: "Proceed after stronger evidence on production debugging and system ownership.",
    strengths: ["Clear authentication fundamentals"],
    improvements: ["Quantify production outcomes"],
    nextSteps: ["Practise one system-design interview"],
    questionReviews: [{
      questionNumber: 1,
      question: "How would you design authentication for a separate API service?",
      candidateAnswer: "José would use secure cookies and short-lived server sessions for the résumé project.",
      benchmarkAnswer: "Use an authorization-code flow, secure session cookies, server-side authorization, CSRF defenses, key rotation, and auditable revocation.",
      score: 76,
      strengths: ["Selected secure cookie storage"],
      gaps: ["Did not cover revocation or key rotation"],
      betterApproach: "Define trust boundaries first, then cover identity, session lifecycle, authorization, abuse controls, and observability.",
      questionType: "TEXT",
      codeLanguage: null,
    }],
  });

  assert.equal(Buffer.from(pdf).subarray(0, 5).toString(), "%PDF-");
  const extracted = await extractText(pdf, { mergePages: true });
  assert.ok(extracted.totalPages >= 2);
  assert.match(extracted.text, /Your answer/i);
  assert.match(extracted.text, /short-lived server sessions/);
  assert.match(extracted.text, /José/);
  assert.match(extracted.text, /résumé/);
  assert.match(extracted.text, /Benchmark answer/i);
  assert.match(extracted.text, /key rotation/);
});
