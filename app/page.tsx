"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession, isInstalled } from "@/lib/store";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (!isInstalled()) {
      router.replace("/setup");
      return;
    }
    if (!getSession()) {
      router.replace("/login");
      return;
    }
    router.replace("/dashboard");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface text-slate-500">
      Loading Restaurant POS…
    </main>
  );
}
