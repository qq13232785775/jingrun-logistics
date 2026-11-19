import Link from "next/link";
import { WaybillForm } from "@/components/waybill-form";

export const metadata = {
  title: "新建运单",
};

export default function NewWaybillPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
      <div>
        <Link href="/admin" className="text-sm text-sea hover:underline">
          返回运单列表
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">新建运单</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          先保存运单资料。保存后可以继续补录物流节点，客户用运单号就能查到。
        </p>
      </div>
      <section className="rounded-xl bg-white p-4 ring-1 ring-foreground/10 sm:p-5">
        <WaybillForm submitLabel="创建运单" />
      </section>
    </main>
  );
}
