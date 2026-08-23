import { auth } from "@/auth";
import { MeetingLauncher } from "@/components/meeting-launcher";
import { SiteHeader } from "@/components/site-header";

export default async function JoinLandingPage() {
  const session = await auth();

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center px-5 py-20 text-center sm:px-8 sm:py-28">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">Join a PrepRoom</p>
        <h1 className="mt-4 font-display text-4xl font-medium tracking-[-0.035em] sm:text-5xl">
          Enter your room code
        </h1>
        <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
          A room link includes a short code. Paste that code below to open the camera and microphone setup.
        </p>
        <div className="mt-8 w-full max-w-xl text-left">
          <MeetingLauncher signedIn={Boolean(session?.user)} />
        </div>
      </section>
    </main>
  );
}
