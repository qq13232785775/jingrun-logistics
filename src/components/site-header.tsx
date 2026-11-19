"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "运单查询" },
  { href: "/admin", label: "管理后台" },
];

export function SiteHeader() {
  return (
    <Suspense fallback={<SiteHeaderShell />}>
      <SiteHeaderNav />
    </Suspense>
  );
}

function SiteHeaderNav() {
  const pathname = usePathname();
  return <SiteHeaderShell pathname={pathname} />;
}

function SiteHeaderShell({ pathname = "" }: { pathname?: string }) {
  return (
    <header className="bg-navy text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="min-w-0">
          <span className="block text-[10px] tracking-[0.22em] text-white/55">
            JINGRUN LOGISTICS
          </span>
          <span className="block text-base font-semibold tracking-wide sm:text-lg">
            景润跨境物流
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-1 text-sm">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/" || pathname.startsWith("/track")
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-white/80 hover:bg-white/10 hover:text-white",
                  active && "bg-white/10 text-white",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="h-1 bg-sea" />
    </header>
  );
}
