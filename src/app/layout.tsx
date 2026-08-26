import type { Metadata } from "next";
import "@fontsource-variable/league-gothic";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/manrope";
import "@fontsource-variable/newsreader";
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
          data-impeccable-contract="606cfba7"
          dangerouslySetInnerHTML={{
            __html: `<!--
THESIS: PrepRoom is a rehearsal run sheet where candidates choose an interviewer and see the next question change. It refuses the floating SaaS dashboard hero.
OWN-WORLD: Bone paper, carbon rules, electric-blue actions, chartreuse tape, condensed cue type, grease-pencil notes, square controls.
STORY: Understand AI and peer practice as equal modes, see the adaptive interview sequence, then start or join a session.
FIRST VIEWPORT: A large promise fills the left rail. Equal AI and peer cue fields fill the right. The primary actions sit at the bottom of each cue and a five-step run spans below.
FORM: Rehearsal run sheet, candidate seven, seed 606cfba7.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`,
          }}
        />
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
