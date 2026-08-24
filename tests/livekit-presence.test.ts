import assert from "node:assert/strict";
import test from "node:test";

import { findActiveParticipantRoom, type LiveKitPresenceService } from "../src/lib/livekit-presence";

function createService(participantsByRoom: Record<string, string[]>) {
  const checkedRooms: string[] = [];
  const service: LiveKitPresenceService = {
    async listRooms() {
      return Object.keys(participantsByRoom).map((name) => ({ name }));
    },
    async listParticipants(roomName) {
      checkedRooms.push(roomName);
      return participantsByRoom[roomName].map((identity) => ({ identity }));
    },
  };

  return { service, checkedRooms };
}

test("returns the room containing the signed-in user", async () => {
  const { service } = createService({
    "study-one": ["someone-else"],
    "study-two": ["user-123"],
  });

  assert.equal(await findActiveParticipantRoom(service, "user-123"), "study-two");
});

test("returns undefined when the user is not connected", async () => {
  const { service } = createService({ "study-one": ["someone-else"] });

  assert.equal(await findActiveParticipantRoom(service, "user-123"), undefined);
});

test("stops checking rooms after finding the user", async () => {
  const { service, checkedRooms } = createService({
    "study-one": ["user-123"],
    "study-two": ["someone-else"],
  });

  await findActiveParticipantRoom(service, "user-123");

  assert.deepEqual(checkedRooms, ["study-one"]);
});
