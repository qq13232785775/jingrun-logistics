export function formatDateTime(value: string) {
  if (!value) return "待定";
  const matched = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(value);
  if (!matched) return value;
  const [, year, month, day, hour, minute] = matched;
  if (hour && minute) return `${year}年${month}月${day}日 ${hour}:${minute}`;
  return `${year}年${month}月${day}日`;
}

export function formatWeight(kg: number) {
  const rounded = Math.round(kg * 100) / 100;
  return `${rounded.toLocaleString("zh-CN", { maximumFractionDigits: 2 })} kg`;
}

export function nowStamp() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const hour = read("hour") === "24" ? "00" : read("hour");
  return `${read("year")}-${read("month")}-${read("day")}T${hour.padStart(2, "0")}:${read("minute").padStart(2, "0")}`;
}

export function noticeText(code: string) {
  switch (code) {
    case "saved":
      return "运单已保存。";
    case "node":
      return "物流节点已更新，客户查询页会显示最新轨迹。";
    case "deleted":
      return "运单已删除。";
    default:
      return "";
  }
}
