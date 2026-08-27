import { BracesIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-9 items-center justify-center rounded-[var(--radius)] border border-foreground bg-primary text-primary-foreground",
        className,
      )}
    >
      <BracesIcon />
    </span>
  );
}
