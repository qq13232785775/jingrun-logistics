"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-3 px-4 py-16">
      <h1 className="text-xl font-semibold">页面暂时无法打开</h1>
      <p className="text-sm leading-6 text-muted-foreground">
        查询或保存时出了问题。请重试；如果刚刚改过运单，刷新后再看一次。
      </p>
      <div>
        <Button type="button" onClick={() => reset()} className="h-10 px-4">
          重试
        </Button>
      </div>
    </main>
  );
}
