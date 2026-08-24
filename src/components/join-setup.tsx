"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MicIcon, MicOffIcon, VideoIcon, VideoOffIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type DeviceOption = { deviceId: string; label: string };

export function JoinSetup({ code, initialName, sessionTitle = "Study session" }: { code: string; initialName: string; sessionTitle?: string }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [name, setName] = useState(initialName);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [cameraId, setCameraId] = useState("");
  const [micId, setMicId] = useState("");
  const [cameras, setCameras] = useState<DeviceOption[]>([]);
  const [microphones, setMicrophones] = useState<DeviceOption[]>([]);
  const [permissionError, setPermissionError] = useState("");

  useEffect(() => {
    let stream: MediaStream | undefined;
    let cancelled = false;

    async function prepareMedia() {
      if (!cameraOn && !micOn) {
        if (videoRef.current) videoRef.current.srcObject = null;
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: cameraOn ? { deviceId: cameraId ? { exact: cameraId } : undefined } : false,
          audio: micOn ? { deviceId: micId ? { exact: micId } : undefined } : false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        if (videoRef.current) videoRef.current.srcObject = stream;
        const devices = await navigator.mediaDevices.enumerateDevices();
        setCameras(devices.filter((device) => device.kind === "videoinput").map((device, index) => ({ deviceId: device.deviceId, label: device.label || `Camera ${index + 1}` })));
        setMicrophones(devices.filter((device) => device.kind === "audioinput").map((device, index) => ({ deviceId: device.deviceId, label: device.label || `Microphone ${index + 1}` })));
        setPermissionError("");
      } catch {
        setPermissionError("Camera or microphone access is blocked. You can still join with both turned off.");
        setCameraOn(false);
        setMicOn(false);
      }
    }

    void prepareMedia();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [cameraId, cameraOn, micId, micOn]);

  function joinRoom() {
    if (!name.trim()) return;
    const query = new URLSearchParams({
      name: name.trim(),
      audio: micOn ? "1" : "0",
      video: cameraOn ? "1" : "0",
    });
    if (cameraId) query.set("camera", cameraId);
    if (micId) query.set("microphone", micId);
    router.push(`/room/${code}?${query.toString()}`);
  }

  return (
    <Card className="w-full max-w-5xl overflow-hidden shadow-xl shadow-primary/5">
      <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative min-h-[360px] bg-[oklch(0.18_0.035_263)] p-4 lg:min-h-[570px]">
          <video ref={videoRef} autoPlay muted playsInline className={cn("size-full rounded-2xl object-cover", !cameraOn && "invisible")} />
          {!cameraOn ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex size-24 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
                {name.trim().slice(0, 2).toUpperCase() || "PR"}
              </div>
            </div>
          ) : null}
          <div className="absolute inset-x-0 bottom-8 flex justify-center gap-3">
            <Button
              variant={micOn ? "secondary" : "destructive"}
              size="icon-lg"
              className="size-12 rounded-full"
              onClick={() => setMicOn((value) => !value)}
              aria-label={micOn ? "Turn microphone off" : "Turn microphone on"}
            >
              {micOn ? <MicIcon /> : <MicOffIcon />}
            </Button>
            <Button
              variant={cameraOn ? "secondary" : "destructive"}
              size="icon-lg"
              className="size-12 rounded-full"
              onClick={() => setCameraOn((value) => !value)}
              aria-label={cameraOn ? "Turn camera off" : "Turn camera on"}
            >
              {cameraOn ? <VideoIcon /> : <VideoOffIcon />}
            </Button>
          </div>
        </div>

        <div className="flex flex-col">
          <CardHeader>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-primary">Room {code}</p>
            <CardTitle className="font-display text-3xl font-medium">{sessionTitle}</CardTitle>
            <CardDescription>Check your name and devices before entering.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="display-name">Display name</FieldLabel>
                <Input id="display-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={60} />
              </Field>
              <Field>
                <FieldLabel>Camera</FieldLabel>
                <Select value={cameraId} onValueChange={(value) => setCameraId(value ?? "")} disabled={!cameraOn || cameras.length === 0}>
                  <SelectTrigger className="w-full"><SelectValue placeholder={cameras.length ? "Choose camera" : "Default camera"} /></SelectTrigger>
                  <SelectContent><SelectGroup>{cameras.map((device) => <SelectItem key={device.deviceId} value={device.deviceId}>{device.label}</SelectItem>)}</SelectGroup></SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Microphone</FieldLabel>
                <Select value={micId} onValueChange={(value) => setMicId(value ?? "")} disabled={!micOn || microphones.length === 0}>
                  <SelectTrigger className="w-full"><SelectValue placeholder={microphones.length ? "Choose microphone" : "Default microphone"} /></SelectTrigger>
                  <SelectContent><SelectGroup>{microphones.map((device) => <SelectItem key={device.deviceId} value={device.deviceId}>{device.label}</SelectItem>)}</SelectGroup></SelectContent>
                </Select>
              </Field>
              {permissionError ? <p className="text-sm leading-5 text-destructive">{permissionError}</p> : null}
            </FieldGroup>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-2 border-t bg-muted/50 py-4">
            <Button size="lg" className="h-11" onClick={joinRoom} disabled={!name.trim()}>Join room</Button>
            <Button variant="ghost" onClick={() => router.push("/")}>Cancel</Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}
