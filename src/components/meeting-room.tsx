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
      <main className="landing-sheet landing-frame flex min-h-screen items-center justify-center px-5">
        <div className="w-full max-w-lg">
          <Alert className="border-foreground bg-background text-foreground">
            <RadioIcon />
            <AlertTitle>{error.title}</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/")}>Return home</Button>
        </div>
      </main>
    );
  }

  if (!connection) {
    return (
      <main className="landing-sheet landing-frame flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 border px-5 py-4 font-mono text-[0.68rem] uppercase tracking-[0.16em]"><span className="size-2 animate-pulse rounded-full bg-accent outline outline-1 outline-foreground" />Connecting to {code}</div>
      </main>
    );
  }

  return (
    <main className="landing-sheet flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <header className="flex h-20 shrink-0 items-center justify-between border-b px-5 sm:px-8">
        <div>
          <p className="font-display text-2xl font-semibold uppercase leading-none">{sessionLabel}</p>
          <p className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.15em] text-muted-foreground">{participantRole ? `${participantRole} · ` : ""}{code}</p>
        </div>
        <Button variant="outline" size="sm" onClick={copyInvite}>
          <CopyIcon data-icon="inline-start" />
          {copied ? "Copied" : "Copy invite"}
        </Button>
      </header>
      <div className="rehearsal-room min-h-0 flex-1 bg-foreground" data-lk-theme="default">
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
