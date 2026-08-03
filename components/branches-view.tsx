"use client";

import Link from "next/link";
import { useApp } from "@/components/app-provider";
import { PrimaryButton, StatCard } from "@/components/ui";
import { computeKpis } from "@/lib/analytics";
import { formatMoney } from "@/lib/store";

export function BranchesView() {
  const { store, branchId, setBranch } = useApp();
  if (!store) return <p className="text-slate-500">Loading branches…</p>;
  return <div className="space-y-8">
    <header><p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Locations</p><h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">Branches</h2><p className="mt-2 text-slate-600">Compare today’s performance and switch your active location.</p></header>
    <div className="grid gap-5 lg:grid-cols-2">{store.branches.map((branch) => { const kpis = computeKpis(store, branch.id); const active = branch.id === branchId; return <section key={branch.id} className={`rounded-3xl border bg-white p-6 ${active ? "border-accent ring-1 ring-accent" : "border-slate-200"}`}><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{branch.code}</p><h3 className="mt-1 font-display text-2xl font-semibold">{branch.name}</h3><p className="mt-1 text-sm text-slate-500">{branch.address}</p></div>{active ? <span className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold text-accent">Active</span> : <PrimaryButton onClick={() => setBranch(branch.id)}>Switch</PrimaryButton>}</div><div className="mt-5 grid grid-cols-2 gap-3"><StatCard label="Revenue today" value={formatMoney(kpis.revenueToday, store.settings.currency)} /><StatCard label="Orders today" value={String(kpis.ordersToday)} /></div></section>; })}</div>
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><h3 className="font-semibold">Moving stock between branches?</h3><p className="mt-1 text-sm text-slate-600">Create and complete inter-branch inventory transfers from Procurement.</p><Link href="/procurement" className="mt-3 inline-block text-sm font-semibold text-accent hover:underline">Open procurement →</Link></section>
  </div>;
}
