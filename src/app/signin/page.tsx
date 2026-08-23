import Link from "next/link";
import { ArrowLeftIcon, CircleAlertIcon, DatabaseIcon, RadioIcon } from "lucide-react";

import { signIn } from "@/auth";
import { BrandMark } from "@/components/brand-mark";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hasDatabase, hasGoogleAuth, hasLiveKit } from "@/lib/config";
import { cn } from "@/lib/utils";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl = "/" } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-5")}>
          <ArrowLeftIcon data-icon="inline-start" />
          Back
        </Link>

        <Card className="shadow-xl shadow-primary/5">
          <CardHeader>
            <BrandMark className="mb-3" />
            <CardTitle className="font-display text-3xl font-medium">Enter your PrepRoom</CardTitle>
            <CardDescription>
              Use your Google account so meeting links and host controls stay tied to you.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {!hasGoogleAuth ? (
              <Alert>
                <CircleAlertIcon />
                <AlertTitle>Google sign-in needs credentials</AlertTitle>
                <AlertDescription>
                  Add AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, and AUTH_SECRET to .env.local, then restart the app.
                </AlertDescription>
              </Alert>
            ) : null}

            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: callbackUrl });
              }}
            >
              <Button type="submit" size="lg" className="h-11 w-full" disabled={!hasGoogleAuth}>
                <GoogleIcon />
                Continue with Google
              </Button>
            </form>

            <div className="flex flex-col gap-2 rounded-xl bg-muted p-3 text-sm">
              <SetupStatus ready={hasDatabase} icon={DatabaseIcon} label="Neon database" />
              <SetupStatus ready={hasLiveKit} icon={RadioIcon} label="LiveKit Cloud" />
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function SetupStatus({ ready, icon: Icon, label }: { ready: boolean; icon: typeof DatabaseIcon; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon /> {label}
      </span>
      <Badge variant={ready ? "default" : "secondary"}>{ready ? "Ready" : "Setup needed"}</Badge>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg data-icon="inline-start" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M21.6 12.23c0-.71-.06-1.4-.19-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z" />
      <path fill="currentColor" opacity=".75" d="M12 22c2.7 0 4.98-.9 6.64-2.43l-3.24-2.54c-.9.6-2.05.96-3.4.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
      <path fill="currentColor" opacity=".5" d="M6.39 13.86a6 6 0 0 1 0-3.72V7.52H3.04a10 10 0 0 0 0 8.96l3.35-2.62Z" />
      <path fill="currentColor" opacity=".9" d="M12 6.01c1.47 0 2.79.5 3.82 1.5l2.88-2.88A9.65 9.65 0 0 0 12 2a10 10 0 0 0-8.96 5.52l3.35 2.62C7.18 7.77 9.39 6 12 6Z" />
    </svg>
  );
}
