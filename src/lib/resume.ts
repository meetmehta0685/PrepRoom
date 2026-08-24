import { createHash } from "node:crypto";

import { extractText, getDocumentProxy } from "unpdf";

export const MAX_RESUME_BYTES = 3_000_000;
export const MAX_RESUME_TEXT_LENGTH = 16_000;

export type ParsedResume = {
  name: string;
  text: string;
  fingerprint: string;
};

export async function parseResume(file: File): Promise<ParsedResume> {
  if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Upload your resume as a PDF.");
  }
  if (file.size === 0 || file.size > MAX_RESUME_BYTES) {
    throw new Error("Keep the resume PDF under 3 MB.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const signature = new TextDecoder("ascii").decode(bytes.slice(0, 5));
  if (signature !== "%PDF-") {
    throw new Error("The selected file is not a valid PDF.");
  }

  const document = await getDocumentProxy(bytes);
  if (document.numPages > 10) {
    throw new Error("Use a resume with 10 pages or fewer.");
  }

  const extracted = await extractText(document, { mergePages: true });
  const text = extracted.text
    .replaceAll("\u0000", " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, MAX_RESUME_TEXT_LENGTH);

  if (text.length < 100) {
    throw new Error("This PDF has too little readable text. Export the resume as a text-based PDF and try again.");
  }

  return {
    name: file.name.slice(0, 160),
    text,
    fingerprint: createHash("sha256").update(text).digest("hex"),
  };
}
