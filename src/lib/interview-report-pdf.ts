import { readFile } from "node:fs/promises";
import { join } from "node:path";

import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, PDFName, PDFString, rgb, type PDFFont, type PDFPage } from "pdf-lib";

export type PdfQuestionReview = {
  questionNumber: number;
  question: string;
  candidateAnswer: string;
  benchmarkAnswer: string;
  score: number;
  strengths: string[];
  gaps: string[];
  betterApproach: string;
  questionType: "TEXT" | "CODE";
  codeLanguage: string | null;
};

export type InterviewReportPdfInput = {
  jobTitle: string;
  track: string;
  level: string;
  completedAt: Date;
  isBaseline: boolean;
  questionSources: { ai: number; practice: number };
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  roleFitScore: number;
  resumeDepthScore: number;
  summary: string;
  hiringSignal: string;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
  questionReviews: PdfQuestionReview[];
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const COLORS = {
  ink: rgb(0.08, 0.1, 0.16),
  muted: rgb(0.36, 0.39, 0.46),
  primary: rgb(0.18, 0.35, 0.87),
  pale: rgb(0.94, 0.96, 1),
  line: rgb(0.87, 0.89, 0.93),
  white: rgb(1, 1, 1),
};

const reportFontPath = join(process.cwd(), "node_modules", "next", "dist", "compiled", "@vercel", "og", "Geist-Regular.ttf");
let reportFontPromise: Promise<Buffer> | undefined;

function loadReportFont() {
  reportFontPromise ??= readFile(reportFontPath);
  return reportFontPromise;
}

function pdfSafe(value: string) {
  return value;
}

function wrapLine(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = pdfSafe(text).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
      continue;
    }
    if (line) lines.push(line);
    if (font.widthOfTextAtSize(word, size) <= maxWidth) {
      line = word;
      continue;
    }
    let chunk = "";
    for (const character of word) {
      if (font.widthOfTextAtSize(chunk + character, size) > maxWidth && chunk) {
        lines.push(chunk);
        chunk = character;
      } else {
        chunk += character;
      }
    }
    line = chunk;
  }
  if (line) lines.push(line);
  return lines;
}

export async function createInterviewReportPdf(input: InterviewReportPdfInput) {
  const document = await PDFDocument.create();
  document.registerFontkit(fontkit);
  const fontBytes = await loadReportFont();
  const regular = await document.embedFont(fontBytes, { subset: true });
  const bold = regular;
  document.catalog.set(PDFName.of("Lang"), PDFString.of("en-US"));
  let page: PDFPage = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const addPage = () => {
    page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
    return page;
  };
  const ensureSpace = (height: number) => {
    if (y - height < 54) addPage();
  };
  const line = (gap = 18) => {
    page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 1, color: COLORS.line });
    y -= gap;
  };
  const heading = (text: string, size = 18) => {
    const lineHeight = size * 1.25;
    const lines = wrapLine(text, bold, size, CONTENT_WIDTH);
    ensureSpace(lines.length * lineHeight + 12);
    for (const wrappedLine of lines) {
      page.drawText(wrappedLine, { x: MARGIN, y: y - size, size, font: bold, color: COLORS.ink });
      y -= lineHeight;
    }
    y -= 10;
  };
  const label = (text: string, color = COLORS.primary) => {
    ensureSpace(20);
    page.drawText(pdfSafe(text.toUpperCase()), { x: MARGIN, y: y - 9, size: 8.5, font: bold, color });
    y -= 18;
  };
  const paragraph = (text: string, options: { size?: number; color?: ReturnType<typeof rgb>; indent?: number; gap?: number } = {}) => {
    const size = options.size ?? 10.5;
    const lineHeight = size * 1.48;
    const x = MARGIN + (options.indent ?? 0);
    const width = CONTENT_WIDTH - (options.indent ?? 0);
    const sourceLines = text.split(/\r?\n/);
    for (const sourceLine of sourceLines) {
      const wrapped = wrapLine(sourceLine, regular, size, width);
      for (const wrappedLine of wrapped) {
        ensureSpace(lineHeight);
        page.drawText(wrappedLine, { x, y: y - size, size, font: regular, color: options.color ?? COLORS.muted });
        y -= lineHeight;
      }
      if (!sourceLine.trim()) y -= lineHeight / 2;
    }
    y -= options.gap ?? 8;
  };
  const bullets = (items: string[]) => {
    for (const item of items) {
      ensureSpace(24);
      page.drawCircle({ x: MARGIN + 3, y: y - 5, size: 2, color: COLORS.primary });
      paragraph(item, { indent: 13, gap: 3 });
    }
    y -= 5;
  };

  page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 224, width: PAGE_WIDTH, height: 224, color: COLORS.ink });
  page.drawText("PREPROOM", { x: MARGIN, y: PAGE_HEIGHT - 66, size: 10, font: bold, color: rgb(0.77, 0.81, 1) });
  page.drawText("Interview report", { x: MARGIN, y: PAGE_HEIGHT - 112, size: 30, font: bold, color: COLORS.white });
  page.drawText(pdfSafe(input.jobTitle), { x: MARGIN, y: PAGE_HEIGHT - 143, size: 15, font: regular, color: rgb(0.86, 0.88, 0.94) });
  page.drawText(pdfSafe(`${input.track} - ${input.level}`), { x: MARGIN, y: PAGE_HEIGHT - 171, size: 9.5, font: regular, color: rgb(0.68, 0.71, 0.8) });
  if (input.isBaseline) {
    page.drawText("Not scored", { x: PAGE_WIDTH - MARGIN - 112, y: PAGE_HEIGHT - 128, size: 20, font: bold, color: rgb(0.72, 0.78, 1) });
  } else {
    page.drawText(String(input.overallScore), { x: PAGE_WIDTH - MARGIN - 76, y: PAGE_HEIGHT - 135, size: 46, font: bold, color: rgb(0.72, 0.78, 1) });
    page.drawText("/ 100", { x: PAGE_WIDTH - MARGIN - 27, y: PAGE_HEIGHT - 135, size: 10, font: regular, color: rgb(0.68, 0.71, 0.8) });
  }
  y = PAGE_HEIGHT - 258;

  heading("Evaluation overview", 20);
  paragraph(input.summary, { size: 11.5, color: COLORS.ink, gap: 14 });
  label("Interview sources", COLORS.muted);
  const questionSources = input.questionSources.practice > 0
    ? `${input.questionSources.ai} AI-generated and ${input.questionSources.practice} curated practice questions`
    : `${input.questionSources.ai} AI-generated questions`;
  paragraph(`Questions: ${questionSources}. Evaluation: ${input.isBaseline ? "not scored because AI evaluation was unavailable" : "AI-reviewed"}.`, { size: 10.5, color: COLORS.ink, gap: 16 });
  label("Hiring signal", COLORS.muted);
  paragraph(input.hiringSignal, { size: 10.5, color: COLORS.ink, gap: 16 });

  if (!input.isBaseline) {
    const scores = [
      ["Technical", input.technicalScore],
      ["Communication", input.communicationScore],
      ["Problem solving", input.problemSolvingScore],
      ["Role fit", input.roleFitScore],
      ["Resume depth", input.resumeDepthScore],
    ] as const;
    ensureSpace(132);
    for (const [name, score] of scores) {
      page.drawText(name, { x: MARGIN, y: y - 9, size: 9.5, font: bold, color: COLORS.ink });
      page.drawText(`${score}/100`, { x: PAGE_WIDTH - MARGIN - 38, y: y - 9, size: 8.5, font: regular, color: COLORS.muted });
      page.drawRectangle({ x: MARGIN + 118, y: y - 8, width: CONTENT_WIDTH - 174, height: 6, color: COLORS.line });
      page.drawRectangle({ x: MARGIN + 118, y: y - 8, width: (CONTENT_WIDTH - 174) * Math.max(0, Math.min(score, 100)) / 100, height: 6, color: COLORS.primary });
      y -= 25;
    }
    y -= 8;
  }
  ensureSpace(250);
  line();
  heading("What to carry forward", 17);
  if (input.strengths.length) {
    label("Strengths");
    bullets(input.strengths);
  }
  label("Priority improvements");
  bullets(input.improvements);
  label("Practice plan");
  bullets(input.nextSteps);

  for (const review of input.questionReviews) {
    addPage();
    page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 92, width: PAGE_WIDTH, height: 92, color: COLORS.pale });
    page.drawText(`QUESTION ${review.questionNumber}`, { x: MARGIN, y: PAGE_HEIGHT - 47, size: 9, font: bold, color: COLORS.primary });
    page.drawText(input.isBaseline ? "Not scored" : `${review.score}/100`, { x: PAGE_WIDTH - MARGIN - (input.isBaseline ? 72 : 48), y: PAGE_HEIGHT - 55, size: input.isBaseline ? 11 : 17, font: bold, color: COLORS.ink });
    y = PAGE_HEIGHT - 116;
    heading(review.question, 17);
    if (review.questionType === "CODE") {
      label(`Coding answer${review.codeLanguage ? ` - ${review.codeLanguage}` : ""}`, COLORS.muted);
    } else {
      label("Your answer", COLORS.muted);
    }
    paragraph(review.candidateAnswer, { size: review.questionType === "CODE" ? 9 : 10.5, color: COLORS.ink, gap: 12 });
    line();
    label("Benchmark answer");
    paragraph(review.benchmarkAnswer, { color: COLORS.ink, gap: 12 });
    if (review.strengths.length) {
      label("What worked", COLORS.muted);
      bullets(review.strengths);
    }
    label("What was missing", COLORS.muted);
    bullets(review.gaps);
    label("A stronger approach");
    paragraph(review.betterApproach, { color: COLORS.ink });
  }

  const pages = document.getPages();
  pages.forEach((currentPage, index) => {
    currentPage.drawLine({ start: { x: MARGIN, y: 36 }, end: { x: PAGE_WIDTH - MARGIN, y: 36 }, thickness: 0.6, color: COLORS.line });
    currentPage.drawText(`PrepRoom interview report  |  ${index + 1} of ${pages.length}`, { x: MARGIN, y: 20, size: 7.5, font: regular, color: COLORS.muted });
  });

  document.setTitle(`PrepRoom interview report - ${input.jobTitle}`);
  document.setAuthor("PrepRoom");
  document.setSubject("Detailed mock interview evaluation");
  document.setCreationDate(input.completedAt);
  return document.save();
}
