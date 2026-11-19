import { noticeText } from "@/lib/format";

export function Notice({ code }: { code?: string }) {
  const text = noticeText(code ?? "");
  if (!text) return null;
  return (
    <p className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-900">
      {text}
    </p>
  );
}
