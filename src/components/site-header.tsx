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
        landing ? "h-16 border-b px-5 sm:px-8 lg:px-12" : "mx-auto max-w-7xl border-b px-5 py-4 sm:px-8 lg:px-10",
      )}
    >
      <Link href="/" className="flex items-center gap-3 rounded-[var(--radius)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35">
        {landing ? null : <BrandMark />}
        <span className={cn(landing ? "font-display text-xl font-semibold tracking-[-0.02em]" : "text-base font-semibold tracking-tight")}>PrepRoom</span>
      </Link>

      {session?.user ? (
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">{session.user.name}</p>
            <p className="text-xs text-muted-foreground">Ready to practise</p>
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
