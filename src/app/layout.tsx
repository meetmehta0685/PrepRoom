import type { Metadata } from "next";
import "@fontsource-variable/archivo";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/manrope";
import "@livekit/components-styles";

import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

export const metadata: Metadata = {
  title: "PrepRoom · AI and peer mock interviews",
  description: "Practise software-engineering interviews with an AI interviewer or a peer, then review focused feedback.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <template
          data-impeccable-contract="2c0f8e88"
          dangerouslySetInnerHTML={{
            __html: `<!--
THESIS: PrepRoom is an interview editing workspace where an answer visibly shapes the next question. It refuses decorative metaphor and the generic screenshot hero.
OWN-WORLD: Cool porcelain work surfaces, graphite transcript lanes, cobalt playheads, quiet waveform traces, moderate grotesk type, and precise 1px dividers.
STORY: Choose AI or peer practice, see the adaptive interview mechanism working, then begin or join a session.
FIRST VIEWPORT: A compact headline and action band sits above one full-width three-lane interview canvas. A cobalt playhead connects the candidate answer to the adaptive follow-up.
FORM: Interview edit suite, candidate seven, seed 2c0f8e88, approved comp interview-edit-b.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`,
          }}
        />
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
