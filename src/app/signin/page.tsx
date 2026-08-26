import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon, CircleAlertIcon, ShieldCheckIcon } from "lucide-react";

import { signIn } from "@/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { hasGoogleAuth } from "@/lib/config";
import { cn } from "@/lib/utils";

type SignInSearchParams = {
  callbackUrl?: string;
  error?: string;
};

export default async function SignInPage({ searchParams }: { searchParams: Promise<SignInSearchParams> }) {
  const params = await searchParams;
  const callbackUrl = normalizeCallbackUrl(params.callbackUrl);
  const destination = describeDestination(callbackUrl);

  return (
    <main className="landing-sheet signin-sheet min-h-screen overflow-x-hidden">
      <div className="landing-frame relative mx-auto min-h-screen w-full max-w-[96rem] border-x border-b">
        <span aria-hidden="true" className="punch-hole left-5 top-5" />
        <span aria-hidden="true" className="punch-hole right-5 top-5" />

        <header className="flex h-20 items-center justify-between border-b px-14 sm:px-16">
          <Link href="/" className="font-display text-3xl font-semibold uppercase leading-none focus-visible:outline-none">PrepRoom</Link>
          <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "px-3")}>
            <ArrowLeftIcon data-icon="inline-start" />
            Back
          </Link>
        </header>

        <div className="grid min-h-[calc(100vh-5rem)] lg:grid-cols-[0.47fr_0.53fr]">
          <section className="order-2 flex min-w-0 flex-col px-6 py-10 sm:px-10 sm:py-12 lg:order-1 lg:border-r lg:px-12 lg:py-14">
            <h1 className="max-w-[8ch] font-display text-[clamp(4.5rem,8vw,6rem)] font-semibold leading-[0.84] tracking-[-0.025em] text-balance">
              Candidate check-in.
            </h1>
            <div aria-hidden="true" className="mt-7 h-[3px] w-full max-w-md bg-foreground" />
            <p className="mt-7 max-w-[34rem] text-base leading-7 sm:text-lg">
              Sign in once. Your interview sessions and meeting access stay tied to your account.
            </p>

            <dl className="mt-12 grid max-w-xl border-y text-sm sm:grid-cols-2">
              <div className="border-b px-4 py-4 sm:border-b-0 sm:border-r">
                <dt className="font-mono text-[0.65rem] uppercase tracking-[0.14em]">Destination</dt>
                <dd className="mt-2 font-display text-2xl uppercase">{destination}</dd>
              </div>
              <div className="px-4 py-4">
                <dt className="font-mono text-[0.65rem] uppercase tracking-[0.14em]">Interviewer modes</dt>
                <dd className="mt-2 font-display text-2xl uppercase">AI or peer</dd>
              </div>
            </dl>

            <div className="mt-auto hidden items-end justify-between gap-8 pt-12 lg:flex">
              <div>
                <p className="font-display text-5xl leading-none">CK.</p>
                <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.14em]">Account / access</p>
              </div>
              <p className="max-w-48 font-note -rotate-2 text-right text-lg italic leading-5">One account. Both rehearsal modes.</p>
            </div>
          </section>

          <section aria-labelledby="signin-title" className="relative order-1 flex min-w-0 flex-col justify-center border-b px-6 py-10 sm:px-10 lg:order-2 lg:border-b-0 lg:px-14 lg:py-14">
            <span className="signin-tape-label absolute left-8 top-6 -rotate-2 px-5 py-2 font-mono text-[0.68rem] uppercase tracking-[0.12em] sm:left-12">
              Account required
            </span>

            <div className="mx-auto w-full max-w-xl">
              <div className="mode-code-frame relative flex h-48 items-center justify-center border-y sm:h-56">
                <span className="font-display text-[8rem] font-semibold leading-none tracking-[0.08em] sm:text-[10rem]">C01</span>
              </div>

              <div className="mt-9">
                <h2 id="signin-title" className="font-display text-4xl font-semibold uppercase leading-none sm:text-5xl">
                  Use your Google account
                </h2>
                <p className="mt-4 max-w-[44ch] text-base leading-6 text-muted-foreground">
                  Google confirms who you are. PrepRoom keeps your session access under that account.
                </p>
              </div>

              <div className="mt-7 flex flex-col gap-4">
                {params.error ? (
                  <Alert variant="destructive">
                    <CircleAlertIcon />
                    <AlertTitle>Google sign-in did not finish</AlertTitle>
                    <AlertDescription>Try again. If the problem continues, return to PrepRoom and restart the session.</AlertDescription>
                  </Alert>
                ) : null}

                {!hasGoogleAuth ? (
                  <Alert>
                    <CircleAlertIcon />
                    <AlertTitle>Google sign-in is not configured</AlertTitle>
                    <AlertDescription>Add the Google authentication credentials to the local environment, then restart the app.</AlertDescription>
                  </Alert>
                ) : null}

                <form
                  action={async () => {
                    "use server";
                    await signIn("google", { redirectTo: callbackUrl });
                  }}
                >
                  <Button type="submit" variant="ink" size="lg" className="h-12 w-full justify-between px-5" disabled={!hasGoogleAuth}>
                    <span className="flex items-center gap-2">
                      <GoogleIcon />
                      Continue with Google
                    </span>
                    <ArrowRightIcon data-icon="inline-end" />
                  </Button>
                </form>

                <p className="flex items-start gap-2 text-sm leading-5 text-muted-foreground">
                  <ShieldCheckIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-foreground" />
                  Your resume and answers remain private interview material.
                </p>
              </div>
            </div>
          </section>
        </div>

        <span aria-hidden="true" className="registration-mark bottom-3 left-3" />
        <span aria-hidden="true" className="registration-mark bottom-3 right-3" />
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
