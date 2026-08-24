import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("a changed role does not resume an unrelated active interview", async () => {
  const source = await readFile(new URL("../src/app/api/interviews/route.ts", import.meta.url), "utf8");

  assert.match(source, /track:\s*parsed\.data\.track/);
  assert.match(source, /level:\s*parsed\.data\.level/);
  assert.match(source, /jobTitle:\s*parsed\.data\.jobTitle/);
});

test("AI interview setup sends a required PDF resume", async () => {
  const source = await readFile(new URL("../src/components/interview-setup.tsx", import.meta.url), "utf8");

  assert.match(source, /type="file"/);
  assert.match(source, /application\/pdf/);
  assert.match(source, /FormData/);
  assert.match(source, /resume/);
});

test("AI interviews can present a multi-language coding workspace", async () => {
  const source = await readFile(new URL("../src/components/ai-interview-room.tsx", import.meta.url), "utf8");
  const editor = await readFile(new URL("../src/components/code-editor.tsx", import.meta.url), "utf8");

  assert.match(source, /CodeEditor/);
  assert.match(source, /codeLanguage/);
  assert.match(source, /questionType/);
  assert.match(editor, /Use plain text/);
  assert.match(editor, /Plain-text code answer/);
});
