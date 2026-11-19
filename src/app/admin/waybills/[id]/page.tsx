import { Suspense } from "react";
import Link from "next/link";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { NodeForm } from "@/components/node-form";
import { Notice } from "@/components/notice";
import { StatusBadge } from "@/components/status-badge";
import { WaybillForm } from "@/components/waybill-form";
import { removeNode, removeWaybill } from "@/lib/actions";
import { formatDateTime, nowStamp } from "@/lib/format";
import { getWaybillById } from "@/lib/queries";

export const metadata = {
  title: "编辑运单",
};

export default function EditWaybillPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
      <Suspense fallback={<p className="text-sm text-muted-foreground">正在读取运单…</p>}>
        <Editor params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Editor({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const { id: rawId } = await params;
  const { notice } = await searchParams;
  const id = Number(rawId);
  const waybill = Number.isInteger(id) && id > 0 ? await getWaybillById(id) : null;

  if (!waybill) {
    return (
      <section className="rounded-xl border border-dashed border-border bg-white px-5 py-8">
        <h1 className="text-lg font-semibold">找不到这票运单</h1>
        <p className="mt-2 text-sm text-muted-foreground">它可能已被删除，或链接里的编号不正确。</p>
        <Link href="/admin" className="mt-4 inline-block text-sm font-medium text-sea hover:underline">
          返回运单列表
        </Link>
      </section>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin" className="text-sm text-sea hover:underline">
            返回运单列表
          </Link>
          <h1 className="mt-2 font-mono text-2xl font-semibold tracking-wide">{waybill.trackingNumber}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {waybill.origin} → {waybill.destination}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <StatusBadge status={waybill.status} className="px-2.5 py-1 text-sm" />
          <Link href={`/track/${waybill.trackingNumber}`} className="text-sm text-sea hover:underline">
            打开客户查询页
          </Link>
        </div>
      </div>

      <Notice code={typeof notice === "string" ? notice : ""} />

      <p className="text-xs text-muted-foreground">
        创建于 {formatDateTime(waybill.createdAt)} · 最近更新 {formatDateTime(waybill.updatedAt)}
        {waybill.customerPhone ? ` · 电话 ${waybill.customerPhone}` : ""}
      </p>

      <section className="rounded-xl bg-white p-4 ring-1 ring-foreground/10 sm:p-5">
        <h2 className="text-base font-semibold">运单资料</h2>
        <div className="mt-4">
          <WaybillForm waybill={waybill} submitLabel="保存运单" />
        </div>
      </section>

      <section id="nodes" className="grid gap-3 rounded-xl bg-white p-4 ring-1 ring-foreground/10 sm:p-5">
        <div>
          <h2 className="text-base font-semibold">物流节点</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            添加或修改节点后，客户查询页的轨迹会一起更新。运单当前状态会改成时间最新的那条节点。
          </p>
        </div>
        <div className="rounded-lg bg-muted/70 p-3">
          <h3 className="text-sm font-medium">添加节点</h3>
          <div className="mt-3">
            <NodeForm waybillId={waybill.id} submitLabel="添加节点" defaultTime={nowStamp()} />
          </div>
        </div>
        {waybill.nodes.length === 0 ? (
          <p className="text-sm text-muted-foreground">还没有节点。</p>
        ) : (
          <ul className="grid gap-3">
            {waybill.nodes.map((node) => (
              <li key={node.id} className="rounded-lg border border-border p-3">
                <NodeForm waybillId={waybill.id} node={node} submitLabel="保存这条节点" />
                <div className="mt-3 border-t border-border pt-3">
                  <ConfirmSubmit
                    action={removeNode}
                    message="确定删除这条物流节点？客户查询页会同步去掉它。"
                    label="删除节点"
                    hidden={{ nodeId: node.id }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-red-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-red-800">删除运单</h2>
        <p className="mt-1 text-sm text-muted-foreground">删除后，客户用这个运单号将查询不到，节点也会一并去掉。</p>
        <div className="mt-3">
          <ConfirmSubmit
            action={removeWaybill}
            message="确定删除整票运单？此操作不能撤销。"
            label="删除运单"
            hidden={{ id: waybill.id }}
          />
        </div>
      </section>
    </>
  );
}
