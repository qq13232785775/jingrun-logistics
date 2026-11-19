import { Suspense } from "react";
import Link from "next/link";
import { Notice } from "@/components/notice";
import { StatusBadge } from "@/components/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { selectClassName } from "@/components/field";
import { formatDateTime } from "@/lib/format";
import { listWaybills } from "@/lib/queries";
import { isStatus, STATUSES } from "@/lib/statuses";
import type { Waybill } from "@/lib/types";

export const metadata = {
  title: "运单列表",
};

export default function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; notice?: string }>;
}) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">运单列表</h1>
          <p className="mt-1 text-sm text-muted-foreground">按运单号、客户、货物或路线查找，进入后可改资料和物流节点。</p>
        </div>
        <Link href="/admin/waybills/new" className={cn(buttonVariants(), "h-9 px-3")}>
          新建运单
        </Link>
      </div>
      <Suspense fallback={<p className="text-sm text-muted-foreground">正在读取运单…</p>}>
        <WaybillList searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function WaybillList({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; notice?: string }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const rawStatus = typeof params.status === "string" ? params.status : "";
  const status = isStatus(rawStatus) ? rawStatus : "";
  const notice = typeof params.notice === "string" ? params.notice : "";
  const rows = await listWaybills({ q, status });

  return (
    <>
      <Notice code={notice} />
      <form action="/admin" className="grid gap-3 rounded-xl bg-white p-4 ring-1 ring-foreground/10 md:grid-cols-[1fr_12rem_auto] md:items-end">
        <div className="grid gap-1.5">
          <Label htmlFor="q">搜索</Label>
          <Input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="运单号、客户、货物、起运地或目的地"
            className="h-9 bg-white"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="status">状态</Label>
          <select id="status" name="status" defaultValue={status} className={selectClassName}>
            <option value="">全部状态</option>
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="h-9 px-4">
            筛选
          </Button>
          <Link href="/admin" className={cn(buttonVariants({ variant: "outline" }), "h-9 px-4")}>
            清空
          </Link>
        </div>
      </form>

      <p className="text-sm text-muted-foreground">
        {q || status ? `筛选结果 ${rows.length} 票` : `共 ${rows.length} 票`}
      </p>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white px-4 py-8 text-sm">
          <p>{q || status ? "没有符合条件的运单。" : "还没有运单。"}</p>
          <Link
            href={q || status ? "/admin" : "/admin/waybills/new"}
            className="mt-3 inline-block font-medium text-sea hover:underline"
          >
            {q || status ? "清空筛选" : "新建第一票运单"}
          </Link>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-xl bg-white ring-1 ring-foreground/10 md:block">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-border text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">运单号</th>
                  <th className="px-3 py-2 font-medium">客户 / 货物</th>
                  <th className="px-3 py-2 font-medium">路线</th>
                  <th className="px-3 py-2 font-medium">状态</th>
                  <th className="px-3 py-2 font-medium">预计到达</th>
                  <th className="px-3 py-2 font-medium">更新</th>
                  <th className="px-3 py-2 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-3 font-mono text-xs">{row.trackingNumber}</td>
                    <td className="px-3 py-3">
                      <div>{row.customerName}</div>
                      <div className="text-xs text-muted-foreground">{row.cargoName}</div>
                    </td>
                    <td className="px-3 py-3">
                      {row.origin} → {row.destination}
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">{formatDateTime(row.eta)}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">
                      {formatDateTime(row.updatedAt)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <RowLinks row={row} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="grid gap-3 md:hidden">
            {rows.map((row) => (
              <li key={row.id} className="rounded-xl bg-white p-4 ring-1 ring-foreground/10">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-mono text-sm">{row.trackingNumber}</p>
                  <StatusBadge status={row.status} />
                </div>
                <p className="mt-2 text-sm">
                  {row.origin} → {row.destination}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {row.customerName} · {row.cargoName}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">预计 {formatDateTime(row.eta)}</p>
                <div className="mt-3">
                  <RowLinks row={row} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

function RowLinks({ row }: { row: Waybill }) {
  return (
    <div className="flex gap-3 text-sm">
      <Link href={`/admin/waybills/${row.id}`} className="font-medium text-sea hover:underline">
        编辑
      </Link>
      <Link href={`/track/${row.trackingNumber}`} className="text-muted-foreground hover:underline">
        查询页
      </Link>
    </div>
  );
}
