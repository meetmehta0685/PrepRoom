"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CopyIcon, RadioIcon } from "lucide-react";
import {
  Chat,
  ConnectionStateToast,
  ControlBar,
  LayoutContextProvider,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  TrackLoop,
  useCreateLayoutContext,
  useGridLayout,
  useTracks,
} from "@livekit/components-react";
import { getTrackReferenceId, type WidgetState } from "@livekit/components-core";
import { RoomEvent, Track } from "livekit-client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EndRoomButton } from "@/components/end-room-button";

type TokenResponse = { token: string; serverUrl: string };
type JoinError = { title: string; message: string };
type TokenErrorResponse = {
  code?: "ALREADY_IN_MEETING" | "PRESENCE_CHECK_FAILED";
  error?: string;
  setupRequired?: boolean;
};

export function MeetingRoom({ code, name, audio, video, microphoneId, cameraId, sessionLabel = "Study session", participantRole, canEnd = false }: { code: string; name: string; audio: boolean; video: boolean; microphoneId?: string; cameraId?: string; sessionLabel?: string; participantRole?: string; canEnd?: boolean }) {
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
        <div className="flex items-start gap-2">
          <Button variant="outline" size="sm" onClick={copyInvite}>
            <CopyIcon data-icon="inline-start" />
            {copied ? "Copied" : "Copy invite"}
          </Button>
          {canEnd ? <EndRoomButton code={code} redirectTo="/interviews" /> : null}
        </div>
      </header>
      <div className="rehearsal-room min-h-0 flex-1 bg-foreground" data-lk-theme="default">
        <LiveKitRoom
          token={connection.token}
          serverUrl={connection.serverUrl}
          connect
          audio={audio ? (microphoneId ? { deviceId: microphoneId } : true) : false}
          video={video ? (cameraId ? { deviceId: cameraId } : true) : false}
          onDisconnected={() => router.push(canEnd ? "/interviews" : "/")}
          className="h-full"
        >
          <SafeVideoConference />
        </LiveKitRoom>
      </div>
    </main>
  );
}

/**
 * LiveKit's VideoConference paginator can race when a camera publication is
 * replaced by its placeholder. Render the live track list directly so a
 * camera toggle cannot leave the visual-stability array out of sync.
 */
function SafeVideoConference() {
  const gridRef = useRef<HTMLDivElement>(null!);
  const [widgetState, setWidgetState] = useState<WidgetState>({ showChat: false, unreadMessages: 0, showSettings: false });
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { updateOnlyOn: [RoomEvent.ActiveSpeakersChanged], onlySubscribed: false },
  );
  const layoutContext = useCreateLayoutContext();
  useGridLayout(gridRef, tracks.length);

  const pinnedTrack = layoutContext.pin.state?.[0];
  const focusedTrack = pinnedTrack
    ? tracks.find(
        (track) =>
          track.participant.identity === pinnedTrack.participant.identity &&
          track.source === pinnedTrack.source,
      )
    : undefined;

  return (
    <div className="lk-video-conference">
      <LayoutContextProvider value={layoutContext} onWidgetChange={setWidgetState}>
        <div className="lk-video-conference-inner">
          {focusedTrack ? (
            <div className="lk-focus-layout-wrapper">
              <div className="lk-focus-layout">
                <div className="lk-carousel" data-lk-orientation="vertical">
                  {tracks
                    .filter(
                      (track) =>
                        track.participant.identity !== focusedTrack.participant.identity ||
                        track.source !== focusedTrack.source,
                    )
                    .map((track) => (
                      <ParticipantTile trackRef={track} key={getTrackReferenceId(track)} />
                    ))}
                </div>
                <ParticipantTile trackRef={focusedTrack} />
              </div>
            </div>
          ) : (
            <div className="lk-grid-layout-wrapper">
              <div ref={gridRef} className="lk-grid-layout">
                <TrackLoop tracks={tracks}>
                  <ParticipantTile />
                </TrackLoop>
              </div>
            </div>
          )}
          <ControlBar controls={{ chat: true, settings: false }} />
        </div>
        <Chat style={{ display: widgetState.showChat ? "grid" : "none" }} />
      </LayoutContextProvider>
      <ConnectionStateToast />
      <RoomAudioRenderer />
    </div>
  );
}
