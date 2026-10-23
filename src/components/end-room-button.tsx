"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleStopIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function EndRoomButton({ code, redirectTo, size = "sm" }: { code: string; redirectTo?: string; size?: "sm" | "default" }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState("");

  async function endRoom() {
    setEnding(true);
    setError("");
    try {
      const response = await fetch(`/api/meetings/${code}/end`, { method: "POST" });
      const result = (await response.json()) as { ended?: boolean; error?: string };
      if (!response.ok || !result.ended) {
        setError(result.error ?? "The room could not be ended.");
        return;
      }
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    } catch {
      setError("The room could not be ended. Check your connection and try again.");
    } finally {
      setEnding(false);
      setConfirming(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {confirming ? (
        <div className="flex gap-2">
          <Button variant="outline" size={size} onClick={() => setConfirming(false)} disabled={ending}>Keep open</Button>
          <Button variant="destructive" size={size} onClick={endRoom} disabled={ending}>
            {ending ? "Ending room" : "End for everyone"}
          </Button>
        </div>
      ) : (
        <Button variant="outline" size={size} onClick={() => setConfirming(true)}>
          <CircleStopIcon data-icon="inline-start" />
          End room
        </Button>
      )}
      {error ? <p role="alert" className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
