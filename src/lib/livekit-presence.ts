type RoomSummary = { name: string };
type ParticipantSummary = { identity: string };

export type LiveKitPresenceService = {
  listRooms(): Promise<RoomSummary[]>;
  listParticipants(roomName: string): Promise<ParticipantSummary[]>;
};

export async function findActiveParticipantRoom(
  service: LiveKitPresenceService,
  identity: string,
) {
  const rooms = await service.listRooms();

  for (const room of rooms) {
    const participants = await service.listParticipants(room.name);
    if (participants.some((participant) => participant.identity === identity)) {
      return room.name;
    }
  }

  return undefined;
}
