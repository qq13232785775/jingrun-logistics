import { statusClassName } from "@/lib/statuses";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        statusClassName(status),
        className,
      )}
    >
      {status}
    </span>
  );
}
