import { Suspense } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { TrackingSearch } from "@/components/tracking-search";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { getSampleBoard } from "@/lib/queries";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:py-10">
      <section className="rounded-xl bg-white px-5 py-6 ring-1 ring-foreground/10 sm:px-8 sm:py-8">
        <p className="text-sm text-sea">跨境电商货运代理</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">运单查询</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          输入运单号，查看当前运输状态、预计到达时间，以及按时间排列的物流节点。每一站都有时间、地点和简短说明。
        </p>
        <div className="mt-5 max-w-2xl">
          <TrackingSearch />
        </div>
      </section>

      <section className="grid gap-3">
        <div>
          <h2 className="text-lg font-semibold">可直接查询的示例运单</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            这些单号随系统预置。点进去即可看到状态、预计到达和轨迹。
          </p>
        </div>
        <Suspense fallback={<p className="text-sm text-muted-foreground">正在读取示例运单…</p>}>
          <SampleBoard />
        </Suspense>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Info
          title="按运单号查询"
          body="客户只需要运单号。查不到时会明确提示，不会显示空白页。"
        />
        <Info
          title="轨迹按时间排列"
          body="揽收、出库、干线、到港、清关和派送按节点记录，最新一条在最上面。"
        />
        <Info
          title="后台可以维护"
          body="管理后台可以新建运单、修改资料并补录节点，保存后查询页会显示最新内容。"
        />
      </section>
    </main>
  );
}

function Info({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl bg-white px-4 py-4 ring-1 ring-foreground/10">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}

async function SampleBoard() {
  const samples = await getSampleBoard();
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {samples.map((sample) => (
        <Link key={sample.trackingNumber} href={`/track/${sample.trackingNumber}`} className="block">
          <Card className="h-full transition-colors hover:bg-muted/40">
            <CardHeader>
              <CardTitle className="font-mono text-sm tracking-wide">{sample.trackingNumber}</CardTitle>
              <CardDescription>
                {sample.origin} → {sample.destination}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {sample.missing ? (
                <p className="text-sm text-muted-foreground">当前库中没有这个运单号。</p>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={sample.status} />
                    <span className="text-xs text-muted-foreground">
                      预计 {formatDateTime(sample.eta)}
                    </span>
                  </div>
                  <p className="text-sm">{sample.cargoName}</p>
                </>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
