import Link from "next/link";
import { ArrowRightIcon, BarChart3Icon, CheckIcon, FileTextIcon, MicIcon } from "lucide-react";

import { auth } from "@/auth";
import { MeetingLauncher } from "@/components/meeting-launcher";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const aiSignals = ["Resume-led questions", "Voice or text answers", "Interview report"];

const proofItems = [
  {
    title: "Resume context",
    copy: "Questions use the experience and focus areas you bring to the session.",
    icon: FileTextIcon,
  },
  {
    title: "Voice or text",
    copy: "Answer out loud or type your response when you need a second pass.",
    icon: MicIcon,
  },
  {
    title: "Interview report",
    copy: "Finish with structured feedback and a clear next practice step.",
    icon: BarChart3Icon,
  },
];

export default async function Home() {
  const session = await auth();

  return (
    <main className="home-page">
      <div className="home-frame">
        <SiteHeader variant="landing" />
        <section className="home-hero" aria-labelledby="home-title">
          <div className="home-lead">
            <div>
              <h1 id="home-title" className="home-title">
                Practise the interview <span>before it counts.</span>
              </h1>
              <div className="home-lead-rule" aria-hidden="true" />
              <p className="home-lead-copy">
                Choose a realistic practice session with an AI interviewer or a peer interviewer, then use what you learn while it is still practice.
              </p>
            </div>

            <div className="home-lead-note">
              <p className="home-lead-note__label">Practice, with context</p>
              <p className="home-lead-note__copy">
                Bring the interview you are preparing for into the room: your role, your experience, and the kind of questions you need to rehearse.
              </p>
            </div>
          </div>

          <div className="home-paths" aria-labelledby="paths-title">
            <div className="home-paths-intro">
              <h2 id="paths-title">Choose your practice.</h2>
              <span className="home-paths-line" aria-hidden="true" />
            </div>

            <article className="home-path home-path--ai">
              <div className="home-path-header">
                <h3>AI interviewer</h3>
                <span className="home-path-type">Adaptive</span>
              </div>
              <p>
                Questions respond to your resume, target role, interview track, experience level, and earlier answers.
              </p>
              <ul className="home-path-list">
                {aiSignals.map((signal) => (
                  <li key={signal}>
                    <CheckIcon aria-hidden="true" />
                    <span>{signal}</span>
                  </li>
                ))}
              </ul>
              <Link href="/interview/new" className={cn(buttonVariants({ size: "lg" }), "home-action home-action--primary")}>
                Start an AI interview
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </article>

            <article className="home-path home-path--peer">
              <div className="home-path-header">
                <h3>Peer interviewer</h3>
                <span className="home-path-type">Live room</span>
              </div>
              <p>
                Open a private room and practise live with someone who can listen, probe, and ask the follow-up you did not expect.
              </p>
              <div className="home-peer-actions">
                <MeetingLauncher
                  signedIn={Boolean(session?.user)}
                  showJoin={false}
                  showHint
                  createLabel="Create a peer room"
                  createIcon="arrow"
                  createVariant="outline"
                  createClassName="home-action home-action--outline w-full justify-center border-primary bg-background text-primary hover:bg-accent hover:text-primary"
                  className="w-full max-w-none"
                />
                <Link href="/join" className="home-join-link">
                  Have a room code? Join a session
                  <ArrowRightIcon aria-hidden="true" />
                </Link>
              </div>
            </article>
          </div>
        </section>

        <section className="home-proof" aria-labelledby="proof-title">
          <div className="home-proof-intro">
            <h2 id="proof-title">A session built around you.</h2>
            <p>Bring the context in, answer naturally, and leave with something concrete to review.</p>
          </div>
          <div className="home-proof-grid">
            {proofItems.map(({ title, copy, icon: Icon }) => (
              <article key={title} className="home-proof-item">
                <Icon className="home-proof-icon" strokeWidth={1.6} aria-hidden="true" />
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer className="home-footer">
          <span className="home-footer-brand">PrepRoom</span>
          <p>AI and peer mock interviews. Private interview material.</p>
        </footer>
      </div>
    </main>
  );
}
