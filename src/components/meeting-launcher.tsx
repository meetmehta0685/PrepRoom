"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, PlusIcon } from "lucide-react";
import type { VariantProps } from "class-variance-authority";

import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function MeetingLauncher({
  signedIn,
  showCreate = true,
  showJoin = true,
  showHint = true,
  createLabel = "Create a room",
  createIcon = "plus",
  createVariant = "default",
  createClassName,
  className,
  appearance = "default",
}: {
  signedIn: boolean;
  showCreate?: boolean;
  showJoin?: boolean;
  showHint?: boolean;
  createLabel?: string;
  createIcon?: "plus" | "arrow";
  createVariant?: VariantProps<typeof buttonVariants>["variant"];
  createClassName?: string;
  className?: string;
  appearance?: "default" | "run-sheet";
}) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  async function createMeeting() {
    if (!signedIn) {
      router.push("/signin?callbackUrl=/");
      return;
    }

    setCreating(true);
    setError("");
    const response = await fetch("/api/meetings", { method: "POST" });
    const result = (await response.json()) as { code?: string; error?: string };
    setCreating(false);

    if (!response.ok || !result.code) {
      setError(result.error ?? "The room could not be created.");
      return;
    }

    router.push(`/join/${result.code}`);
  }

  function joinMeeting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = code.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
    if (normalized.length < 6) {
      setError("Enter a valid room code.");
      return;
    }

    if (!signedIn) {
      router.push(`/signin?callbackUrl=${encodeURIComponent(`/join/${normalized}`)}`);
      return;
    }

    router.push(`/join/${normalized}`);
  }

  return (
    <div className={cn("flex max-w-xl flex-col gap-4", className)}>
      <div className="flex flex-col gap-3 sm:flex-row">
        {showCreate ? (
          <Button
            size="lg"
            variant={createVariant}
            className={cn("h-12 px-5", !showJoin && "w-full justify-center", createClassName)}
            onClick={createMeeting}
            disabled={creating}
          >
            {createIcon === "plus" ? <PlusIcon data-icon="inline-start" /> : null}
            {creating ? "Creating room" : createLabel}
            {createIcon === "arrow" ? <ArrowRightIcon data-icon="inline-end" /> : null}
          </Button>
        ) : null}
        {showJoin ? (
          <form onSubmit={joinMeeting} className="flex min-w-0 flex-1 gap-2">
            <FieldGroup>
              <Field data-invalid={Boolean(error)}>
                <FieldLabel htmlFor="room-code" className="sr-only">Room code</FieldLabel>
                <div className="flex gap-2">
                  <Input
                    id="room-code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    placeholder="Enter room code"
                    aria-invalid={Boolean(error)}
                    className="h-12 min-w-0 bg-card px-4 font-mono uppercase tracking-wider"
                  />
                  <Button
                    type="submit"
                    variant={appearance === "run-sheet" ? "accent" : "outline"}
                    size="icon-lg"
                    className="size-12 shrink-0"
                    aria-label="Join room"
                  >
                    <ArrowRightIcon />
                  </Button>
                </div>
                {error ? <FieldDescription className="text-destructive">{error}</FieldDescription> : null}
              </Field>
            </FieldGroup>
          </form>
        ) : null}
      </div>
      {showCreate && showHint ? (
        <p className="text-sm text-muted-foreground">
          {signedIn ? "Your room opens with camera and microphone controls." : "Sign in with Google to create or join a room."}
        </p>
      ) : null}
      {error && !showJoin ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
