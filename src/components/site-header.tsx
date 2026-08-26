import Link from "next/link";
import { LogOutIcon } from "lucide-react";

import { auth, signOut } from "@/auth";
import { BrandMark } from "@/components/brand-mark";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function initials(name?: string | null) {
  return (name ?? "PrepRoom user")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export async function SiteHeader({ variant = "default" }: { variant?: "default" | "landing" }) {
  const session = await auth();
  const landing = variant === "landing";

  return (
    <header
      className={cn(
        "flex w-full items-center justify-between",
        landing ? "h-20 border-b px-14 sm:px-16" : "mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-10",
      )}
    >
      <Link href="/" className="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        {landing ? null : <BrandMark />}
        <span className={cn(landing ? "font-display text-3xl font-semibold uppercase leading-none" : "text-base font-semibold tracking-tight")}>PrepRoom</span>
      </Link>

      {session?.user ? (
        <div className="flex items-center gap-3">
          <div className={cn("hidden text-right sm:block", landing && "font-mono uppercase tracking-[0.1em]")}>
            <p className="text-sm font-medium">{session.user.name}</p>
            <p className="text-xs text-muted-foreground">{landing ? "Run sheet ready" : "Ready to practise"}</p>
          </div>
          <Avatar>
            {session.user.image ? <AvatarImage src={session.user.image} alt="" /> : null}
            <AvatarFallback>{initials(session.user.name)}</AvatarFallback>
          </Avatar>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button type="submit" variant="ghost" size="icon" aria-label="Sign out">
              <LogOutIcon />
            </Button>
          </form>
        </div>
      ) : (
        <Link href="/signin" className={cn(buttonVariants({ variant: "outline" }), "h-9 px-4")}>
          Sign in
        </Link>
      )}
    </header>
  );
}
