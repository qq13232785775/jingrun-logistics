import { Suspense } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { Timeline } from "@/components/timeline";
import { TrackingSearch } from "@/components/tracking-search";
import { formatDateTime, formatWeight } from "@/lib/format";
import { getWaybillByTracking } from "@/lib/queries";

export const metadata = {
  title: "运单详情",
};

export default function TrackPage({ params }: { params: Promise<{ no: string }> }) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">运单查询</h1>
        <p className="mt-2 text-sm text-muted-foreground">换一个运单号可以在这里继续查。</p>
      </div>
      <TrackingSearch />
      <Suspense fallback={<p className="text-sm text-muted-foreground">正在查询运单…</p>}>
        <TrackingBody params={params} />
      </Suspense>
    </main>
  );
}

async function TrackingBody({ params }: { params: Promise<{ no: string }> }) {
  const { no } = await params;
  const normalized = no.trim().toUpperCase();
  const valid = /^[A-Z0-9][A-Z0-9-]{3,31}$/.test(normalized);
  const waybill = valid ? await getWaybillByTracking(normalized) : null;

  if (!waybill) {
    return (
      <section className="rounded-xl border border-dashed border-border bg-white px-5 py-8">
        <h2 className="text-lg font-semibold">未查询到运单</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          运单号{" "}
          <span className="font-mono text-foreground">{normalized || "（空）"}</span>{" "}
          不存在。请核对是否完整，或联系对接的景润业务员确认。
        </p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-sea hover:underline">
          返回查询首页
        </Link>
      </section>
    );
  }

  return (
    <article className="grid gap-4">
      <section className="rounded-xl bg-white px-5 py-5 ring-1 ring-foreground/10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">运单号</p>
            <p className="mt-1 font-mono text-xl tracking-wide">{waybill.trackingNumber}</p>
          </div>
          <StatusBadge status={waybill.status} className="px-2.5 py-1 text-sm" />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <Place label="起运地" value={waybill.origin} />
          <span className="hidden text-muted-foreground sm:block" aria-hidden>
            →
          </span>
          <Place label="目的地" value={waybill.destination} />
        </div>
        <dl className="mt-5 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2">
          <Fact label="预计到达" value={formatDateTime(waybill.eta)} />
          <Fact label="最近更新" value={formatDateTime(waybill.updatedAt)} />
          <Fact label="客户" value={waybill.customerName} />
          <Fact label="货物" value={waybill.cargoName} />
          <Fact label="件数" value={`${waybill.pieces} 件`} />
          <Fact label="重量" value={formatWeight(waybill.weightKg)} />
        </dl>
        {waybill.remark ? (
          <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-sm leading-6">
            <span className="font-medium">备注：</span>
            {waybill.remark}
          </p>
        ) : null}
      </section>

      <section className="rounded-xl bg-white px-5 py-5 ring-1 ring-foreground/10">
        <h2 className="text-base font-semibold">物流轨迹</h2>
        <p className="mt-1 text-sm text-muted-foreground">按时间倒序，最新节点在最上面。</p>
        <div className="mt-4">
          <Timeline nodes={waybill.nodes} />
        </div>
      </section>
    </article>
  );
}

function Place({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-medium">{value}</p>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}
