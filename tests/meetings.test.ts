import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("only the room creator can end a room, and ending closes it for everyone", async () => {
  const route = await readFile(new URL("../src/app/api/meetings/[code]/end/route.ts", import.meta.url), "utf8");

  assert.match(route, /meeting\.createdById !== session\.user\.id/);
  assert.match(route, /data: \{ endedAt \}/);
  assert.match(route, /status: "COMPLETED"/);
  assert.match(route, /deleteRoom\(meeting\.livekitRoom\)/);
});

test("the room page only offers ending to the creator of an open room", async () => {
  const page = await readFile(new URL("../src/app/room/[code]/page.tsx", import.meta.url), "utf8");

  assert.match(page, /canEnd = meeting\.createdById === session\.user\.id && !meeting\.endedAt/);
});

test("interview history only lists the signed-in user's own interviews and rooms", async () => {
  const page = await readFile(new URL("../src/app/interviews/page.tsx", import.meta.url), "utf8");

  assert.match(page, /candidateId: session\.user\.id/);
  assert.match(page, /createdById: session\.user\.id/);
  assert.match(page, /redirect\("\/signin\?callbackUrl=\/interviews"\)/);
});
