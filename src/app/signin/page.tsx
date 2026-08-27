import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon, CircleAlertIcon, ShieldCheckIcon } from "lucide-react";

import { signIn } from "@/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { hasGoogleAuth } from "@/lib/config";
import { cn } from "@/lib/utils";

type SignInSearchParams = { callbackUrl?: string; error?: string };

export default async function SignInPage({ searchParams }: { searchParams: Promise<SignInSearchParams> }) {
  const params = await searchParams;
  const callbackUrl = normalizeCallbackUrl(params.callbackUrl);
  const destination = describeDestination(callbackUrl);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto min-h-screen w-full max-w-[90rem] border-x bg-card">
        <header className="flex h-16 items-center justify-between border-b px-5 sm:px-8">
          <Link href="/" className="font-display text-xl font-semibold tracking-[-0.02em]">PrepRoom</Link>
          <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "px-3")}><ArrowLeftIcon data-icon="inline-start" />Back</Link>
        </header>

        <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[0.9fr_1.1fr]">
          <section className="flex flex-col border-b px-5 py-10 sm:px-8 sm:py-14 lg:border-b-0 lg:border-r lg:px-12">
            <div>
              <h1 className="max-w-[12ch] text-balance font-display text-[clamp(2.8rem,5vw,5rem)] font-semibold leading-[0.98] tracking-[-0.035em]">Pick up where you left off.</h1>
              <p className="mt-5 max-w-[52ch] text-base leading-7 text-muted-foreground sm:text-lg">Sign in once. Your interview sessions and meeting access stay tied to your account.</p>
            </div>

            <dl className="mt-10 grid border-y text-sm sm:grid-cols-2 lg:mt-auto">
              <div className="border-b px-4 py-5 sm:border-b-0 sm:border-r"><dt className="text-muted-foreground">Continue to</dt><dd className="mt-1 font-semibold">{destination}</dd></div>
              <div className="px-4 py-5"><dt className="text-muted-foreground">Practice modes</dt><dd className="mt-1 font-semibold">AI or peer interviewer</dd></div>
            </dl>
          </section>

          <section aria-labelledby="signin-title" className="flex items-center px-5 py-10 sm:px-8 lg:px-14">
            <div className="w-full max-w-xl">
              <h2 id="signin-title" className="font-display text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">Continue with Google</h2>
              <p className="mt-3 max-w-[48ch] leading-7 text-muted-foreground">Google confirms who you are. PrepRoom keeps your session access under that account.</p>

              <div className="mt-7 flex flex-col gap-4">
                {params.error ? <Alert variant="destructive"><CircleAlertIcon /><AlertTitle>Google sign-in did not finish</AlertTitle><AlertDescription>Try again. If the problem continues, return to PrepRoom and restart the session.</AlertDescription></Alert> : null}
                {!hasGoogleAuth ? <Alert><CircleAlertIcon /><AlertTitle>Google sign-in is not configured</AlertTitle><AlertDescription>Add the Google authentication credentials to the local environment, then restart the app.</AlertDescription></Alert> : null}
                <form action={async () => { "use server"; await signIn("google", { redirectTo: callbackUrl }); }}>
                  <Button type="submit" size="lg" className="h-12 w-full justify-between px-5" disabled={!hasGoogleAuth}>
                    <span className="flex items-center gap-2"><GoogleIcon />Continue with Google</span><ArrowRightIcon data-icon="inline-end" />
                  </Button>
                </form>
                <p className="flex items-start gap-2 text-sm leading-5 text-muted-foreground"><ShieldCheckIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />Your resume and answers remain private interview material.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function normalizeCallbackUrl(value?: string) {
  if (!value?.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function describeDestination(callbackUrl: string) {
  if (callbackUrl.startsWith("/interview/new")) return "AI interview setup";
  if (callbackUrl.startsWith("/join/") || callbackUrl.startsWith("/room/")) return "Peer interview room";
  return "PrepRoom home";
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
