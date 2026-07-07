import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageLoading } from "@/components/page-loading";
import { AdminTabs } from "./admin-tabs";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

async function AdminGuard({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect("/login?redirectTo=/admin");
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Admin <span className="text-gradient-brand">dashboard</span>
          </h1>
          <p className="mt-1 text-xs text-faint">
            Signed in as {session.user.email}
          </p>
        </div>
        <Link
          href="/"
          className="rounded-full border border-silver px-4 py-2 text-sm font-medium text-slate-ui transition-colors hover:border-aqua hover:text-aqua-deep"
        >
          Back to site
        </Link>
      </div>
      <AdminTabs />
      <div className="mt-8">{children}</div>
    </>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Suspense fallback={<PageLoading />}>
        <AdminGuard>{children}</AdminGuard>
      </Suspense>
    </div>
  );
}
