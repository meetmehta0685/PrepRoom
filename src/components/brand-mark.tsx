import { BracesIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm",
        className,
      )}
    >
      <BracesIcon />
    </span>
  );
}
