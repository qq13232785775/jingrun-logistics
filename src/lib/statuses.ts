export const STATUSES = [
  "已揽收",
  "已出库",
  "国际运输中",
  "已到港",
  "清关中",
  "清关完成",
  "派送中",
  "已签收",
  "异常",
] as const;

export type Status = (typeof STATUSES)[number];

export function isStatus(value: string): value is Status {
  return (STATUSES as readonly string[]).includes(value);
}

const STATUS_CLASS: Record<string, string> = {
  已揽收: "bg-slate-100 text-slate-700",
  已出库: "bg-sky-50 text-sky-800",
  国际运输中: "bg-blue-50 text-blue-800",
  已到港: "bg-indigo-50 text-indigo-800",
  清关中: "bg-amber-50 text-amber-900",
  清关完成: "bg-teal-50 text-teal-800",
  派送中: "bg-cyan-50 text-cyan-900",
  已签收: "bg-emerald-50 text-emerald-800",
  异常: "bg-red-50 text-red-700",
};

export function statusClassName(status: string) {
  return STATUS_CLASS[status] ?? "bg-muted text-foreground";
}
