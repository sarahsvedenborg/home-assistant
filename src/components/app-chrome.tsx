"use client";

import { usePathname } from "next/navigation";

import { SiteHeader } from "@/components/site-header";

const HEADERLESS_PATHS = ["/login", "/studio", "/test-route"];

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showHeader = !HEADERLESS_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  return (
    <>
      {showHeader ? (
        <div className="appHeaderShell">
          <SiteHeader />
        </div>
      ) : null}
      {children}
    </>
  );
}
