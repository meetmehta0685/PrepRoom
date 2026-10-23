import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { audioExtension, isAcceptedAudioType, selectRecordingMimeType } from "../src/lib/audio-recording";

test("voice answers use recorded audio instead of browser speech recognition", async () => {
  const source = await readFile(new URL("../src/components/ai-interview-room.tsx", import.meta.url), "utf8");

  assert.doesNotMatch(source, /SpeechRecognition/);
  assert.match(source, /MediaRecorder/);
  assert.match(source, /\/api\/interviews\/transcribe/);
});

test("non-coding answers default to voice with a typed fallback while coding answers keep the editor", async () => {
  const room = await readFile(new URL("../src/components/ai-interview-room.tsx", import.meta.url), "utf8");
  const transcriptionRoute = await readFile(new URL("../src/app/api/interviews/transcribe/route.ts", import.meta.url), "utf8");

  assert.match(room, /useState<"voice" \| "text">\("voice"\)/);
  assert.match(room, /Type instead/);
  assert.match(room, /<textarea/);
  assert.match(room, /CodeEditor/);
  assert.match(room, /aria-live="polite"/);
  assert.match(room, /Clear transcript/);
  assert.doesNotMatch(transcriptionRoute, /type your answer/i);
});

test("a saved answer whose next step failed is resumed instead of answered again", async () => {
  const route = await readFile(new URL("../src/app/api/interviews/[id]/answer/route.ts", import.meta.url), "utf8");
  const room = await readFile(new URL("../src/components/ai-interview-room.tsx", import.meta.url), "utf8");

  assert.match(route, /continue: z\.literal\(true\)/);
  assert.match(route, /awaitingNextStep/);
  assert.match(route, /answerSaved/);
  assert.match(room, /Continue interview/);
});

test("selects an audio format supported by both browsers and Groq", () => {
  assert.equal(selectRecordingMimeType((mimeType) => mimeType === "audio/webm"), "audio/webm");
  assert.equal(audioExtension("audio/webm;codecs=opus"), "webm");
  assert.equal(audioExtension("audio/mp4"), "mp4");
  assert.equal(isAcceptedAudioType("audio/ogg;codecs=opus"), true);
  assert.equal(isAcceptedAudioType("audio/aac"), false);
});
