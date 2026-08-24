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

test("selects an audio format supported by both browsers and Groq", () => {
  assert.equal(selectRecordingMimeType((mimeType) => mimeType === "audio/webm"), "audio/webm");
  assert.equal(audioExtension("audio/webm;codecs=opus"), "webm");
  assert.equal(audioExtension("audio/mp4"), "mp4");
  assert.equal(isAcceptedAudioType("audio/ogg;codecs=opus"), true);
  assert.equal(isAcceptedAudioType("audio/aac"), false);
});
