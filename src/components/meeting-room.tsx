"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CopyIcon, RadioIcon } from "lucide-react";
import { LiveKitRoom, RoomAudioRenderer, VideoConference } from "@livekit/components-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type TokenResponse = { token: string; serverUrl: string };
type JoinError = { title: string; message: string };
type TokenErrorResponse = {
  code?: "ALREADY_IN_MEETING" | "PRESENCE_CHECK_FAILED";
  error?: string;
  setupRequired?: boolean;
};

export function MeetingRoom({ code, name, audio, video, microphoneId, cameraId, sessionLabel = "Study session", participantRole }: { code: string; name: string; audio: boolean; video: boolean; microphoneId?: string; cameraId?: string; sessionLabel?: string; participantRole?: string }) {
  const router = useRouter();
  const [connection, setConnection] = useState<TokenResponse>();
  const [error, setError] = useState<JoinError>();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function getToken() {
      const response = await fetch("/api/livekit-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, name }),
      });
      const result = (await response.json()) as TokenResponse & TokenErrorResponse;
      if (cancelled) return;
      if (!response.ok) {
        if (result.code === "ALREADY_IN_MEETING") {
          setError({
            title: "Already in a meeting",
            message: "This Google account is connected in another tab or device. Leave that meeting before joining here.",
          });
        } else {
          setError({
            title: result.setupRequired ? "Room setup is incomplete" : "Could not join the room",
            message: `${result.error ?? "The room could not connect."}${result.setupRequired ? " Add the values from .env.example, then restart the app." : ""}`,
          });
        }
        return;
      }
      setConnection(result);
    }
    void getToken();
    return () => { cancelled = true; };
  }, [code, name]);

  async function copyInvite() {
    await navigator.clipboard.writeText(`${window.location.origin}/join/${code}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[oklch(0.14_0.03_263)] px-5 text-white">
        <div className="w-full max-w-lg">
          <Alert className="bg-white text-foreground">
            <RadioIcon />
            <AlertTitle>{error.title}</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
          <Button variant="secondary" className="mt-4" onClick={() => router.push("/")}>Return home</Button>
        </div>
      </main>
    );
  }

  if (!connection) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[oklch(0.14_0.03_263)] text-white">
        <div className="flex items-center gap-3 text-sm text-white/70"><span className="size-2 animate-pulse rounded-full bg-[oklch(0.75_0.18_150)]" />Connecting to {code}</div>
      </main>
    );
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[oklch(0.14_0.03_263)] text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
        <div>
          <p className="text-sm font-semibold">{sessionLabel}</p>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-white/50">{participantRole ? `${participantRole} · ` : ""}{code}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={copyInvite}>
          <CopyIcon data-icon="inline-start" />
          {copied ? "Copied" : "Copy invite"}
        </Button>
      </header>
      <div className="min-h-0 flex-1" data-lk-theme="default">
        <LiveKitRoom
          token={connection.token}
          serverUrl={connection.serverUrl}
          connect
          audio={audio ? (microphoneId ? { deviceId: microphoneId } : true) : false}
          video={video ? (cameraId ? { deviceId: cameraId } : true) : false}
          onDisconnected={() => router.push("/")}
          className="h-full"
        >
          <VideoConference />
          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>
    </main>
  );
}
