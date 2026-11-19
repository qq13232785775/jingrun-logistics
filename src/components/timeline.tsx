import { StatusBadge } from "@/components/status-badge";
import { formatDateTime } from "@/lib/format";
import type { LogisticsNode } from "@/lib/types";

export function Timeline({ nodes }: { nodes: LogisticsNode[] }) {
  if (nodes.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-muted/60 px-4 py-6 text-sm text-muted-foreground">
        还没有物流节点。在管理后台补录后，会按时间出现在这里。
      </p>
    );
  }

  return (
    <ol aria-label="物流轨迹" className="space-y-0">
      {nodes.map((node, index) => (
        <li key={node.id} className="relative pb-6 pl-8 last:pb-0">
          {index < nodes.length - 1 ? (
            <span className="absolute top-3 bottom-0 left-[7px] w-px bg-border" />
          ) : null}
          <span
            className={
              index === 0
                ? "absolute top-1.5 left-0 size-3.5 rounded-full border-2 border-sea bg-sea"
                : "absolute top-1.5 left-0 size-3.5 rounded-full border-2 border-navy bg-white"
            }
          />
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <time className="text-sm font-medium tabular-nums" dateTime={node.eventTime}>
              {formatDateTime(node.eventTime)}
            </time>
            <StatusBadge status={node.status} />
          </div>
          <p className="mt-1 text-sm font-medium">{node.location}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{node.note}</p>
        </li>
      ))}
    </ol>
  );
}
