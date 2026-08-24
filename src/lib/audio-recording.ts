export const MAX_RECORDING_MS = 120_000;
export const MAX_AUDIO_BYTES = 3_500_000;

const recordingMimeTypes = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
  "audio/ogg",
] as const;

export function selectRecordingMimeType(isSupported: (mimeType: string) => boolean) {
  return recordingMimeTypes.find((mimeType) => isSupported(mimeType));
}

export function audioExtension(mimeType: string) {
  const baseType = mimeType.split(";", 1)[0];
  if (baseType === "audio/mp4") return "mp4";
  if (baseType === "audio/ogg") return "ogg";
  if (baseType === "audio/wav") return "wav";
  return "webm";
}

export function isAcceptedAudioType(mimeType: string) {
  return ["audio/webm", "audio/mp4", "audio/ogg", "audio/wav"].includes(mimeType.split(";", 1)[0]);
}
