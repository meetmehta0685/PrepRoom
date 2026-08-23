import type { Metadata } from "next";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/manrope";
import "@fontsource-variable/newsreader";
import "@livekit/components-styles";

import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

export const metadata: Metadata = {
  title: "PrepRoom",
  description: "Live study rooms and mock interviews for placement preparation.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
