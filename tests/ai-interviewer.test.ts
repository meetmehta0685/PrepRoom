import assert from "node:assert/strict";
import test from "node:test";

import {
  candidateSafeAnswerFeedback,
  countInterviewQuestionSources,
  createInterviewReport,
  createNextQuestion,
  getCodingQuestion,
  getCuratedQuestionBank,
  selectCuratedQuestion,
  validateGeneratedReport,
} from "../src/lib/ai-interviewer";
import { questionBank } from "../src/lib/interviews";

test("uses an unused curated question when no AI key is configured", async () => {
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
  assert.ok(getCuratedQuestionBank("BACKEND", "Backend Engineer").includes(result.question));
  assert.notEqual(result.question, questionBank.BACKEND[0]);
});

test("fallback questions shuffle without repeating asked questions", () => {
  const first = selectCuratedQuestion({
    track: "FULLSTACK",
    jobTitle: "Frontend Engineer",
    askedQuestions: [],
    random: () => 0,
  });
  const second = selectCuratedQuestion({
    track: "FULLSTACK",
    jobTitle: "Frontend Engineer",
    askedQuestions: [first],
    random: () => 0,
  });

  assert.notEqual(first, second);
});

test("full-stack coding questions change with the target role", () => {
  const frontendQuestion = getCodingQuestion("FULLSTACK", "Frontend Engineer");
  const backendQuestion = getCodingQuestion("FULLSTACK", "Backend Engineer");
  const mobileQuestion = getCodingQuestion("FULLSTACK", "Mobile Engineer");

  assert.notEqual(frontendQuestion, backendQuestion);
  assert.notEqual(backendQuestion, mobileQuestion);
  assert.match(frontendQuestion, /component|browser|render/i);
  assert.match(backendQuestion, /event|request|API/i);
  assert.match(mobileQuestion, /offline|mobile|sync/i);
});

test("creates an unscored practice report when AI evaluation is unavailable", async () => {
  const candidateAnswer = "banana";
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
  assert.equal(result.report.overallScore, 0);
  assert.equal(result.report.technicalScore, 0);
  assert.equal(result.report.communicationScore, 0);
  assert.equal(result.report.problemSolvingScore, 0);
  assert.equal(result.report.roleFitScore, 0);
  assert.equal(result.report.resumeDepthScore, 0);
  assert.deepEqual(result.report.strengths, []);
  assert.ok(result.report.nextSteps.length > 0);
  assert.equal(result.report.questionReviews.length, 1);
  assert.equal(result.report.questionReviews[0].candidateAnswer, candidateAnswer);
  assert.equal(result.report.questionReviews[0].question, "How would you design authentication?");
  assert.ok(result.report.questionReviews[0].benchmarkAnswer.length > 80);
  assert.ok(result.report.questionReviews[0].betterApproach.length > 40);
  assert.equal(result.report.questionReviews[0].score, 0);
  assert.deepEqual(result.report.questionReviews[0].strengths, []);
});

test("accepts an honest AI evaluation with no strengths", () => {
  const result = validateGeneratedReport({
    overallScore: 12,
    technicalScore: 8,
    communicationScore: 20,
    problemSolvingScore: 10,
    roleFitScore: 12,
    resumeDepthScore: 10,
    summary: "The answers did not address the questions.",
    hiringSignal: "The interview does not provide enough evidence to proceed.",
    strengths: [],
    improvements: ["Answer the question directly"],
    nextSteps: ["Practise explaining one project"],
    questionReviews: [{
      questionNumber: 1,
      benchmarkAnswer: "A strong answer would define the requirements and explain a concrete design.",
      score: 8,
      strengths: [],
      gaps: ["The answer was unrelated"],
      betterApproach: "Restate the question, choose an approach, and explain how to verify it.",
    }],
  });

  assert.deepEqual(result.strengths, []);
  assert.deepEqual(result.questionReviews[0].strengths, []);
});

test("counts AI and curated questions cumulatively", () => {
  const sources = countInterviewQuestionSources({
    track: "BACKEND",
    jobTitle: "Backend Engineer",
    turns: [
      { role: "INTERVIEWER", content: "How did you make your API idempotent?" },
      { role: "CANDIDATE", content: "I used a request key." },
      { role: "INTERVIEWER", content: questionBank.BACKEND[1] },
    ],
  });

  assert.deepEqual(sources, { ai: 1, practice: 1 });
});

test("uses a fixed candidate-safe answer confirmation", () => {
  assert.equal(candidateSafeAnswerFeedback, "Answer saved. The next question is ready.");
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
