"use client";

import { useState } from "react";
import { useBranchData } from "@/components/app-provider";
import { Field, PrimaryButton, StatCard, TextInput } from "@/components/ui";
import { computeKpis, getTodayBounds } from "@/lib/analytics";
import { addExpense, createId, formatMoney } from "@/lib/store";

export function AccountingView() {
  const { store, branchId, ledger, session, refresh } = useBranchData();
  const [category, setCategory] = useState("Operations"); const [amount, setAmount] = useState(""); const [note, setNote] = useState("");
  if (!store) return <p className="text-slate-500">Loading accounting…</p>;
  const kpis = computeKpis(store, branchId); const currency = store.settings.currency; const { start, end } = getTodayBounds();
  const today = ledger.filter((entry) => entry.createdAt >= start && entry.createdAt < end);
  const total = (type: "sale" | "purchase" | "expense") => today.filter((entry) => entry.type === type).reduce((sum, entry) => sum + entry.amount, 0);

  return <div className="space-y-8">
    <header><p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Finance</p><h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">Accounting</h2><p className="mt-2 text-slate-600">Today’s profit view, ledger activity, and operating expenses.</p></header>
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><StatCard label="Revenue today" value={formatMoney(kpis.revenueToday, currency)} /><StatCard label="Gross margin" value={formatMoney(kpis.grossMargin, currency)} hint={`${kpis.foodCostPct.toFixed(1)}% food cost`} /><StatCard label="Net profit" value={formatMoney(kpis.netProfit, currency)} /><StatCard label="Expenses" value={formatMoney(total("expense"), currency)} /></section>
    <section className="rounded-3xl border border-slate-200 bg-white p-6"><h3 className="font-display text-2xl font-semibold">Add expense</h3><div className="mt-4 grid gap-4 md:grid-cols-3"><Field label="Category"><TextInput value={category} onChange={setCategory} /></Field><Field label="Amount"><TextInput type="number" value={amount} onChange={setAmount} /></Field><Field label="Note"><TextInput value={note} onChange={setNote} /></Field></div><PrimaryButton className="mt-4" onClick={() => { const value = Number(amount); if (!value) return; addExpense({ id: createId("expense"), branchId, category, amount: value, note }, session?.username); setAmount(""); setNote(""); refresh(); }}>Record expense</PrimaryButton></section>
    <section className="grid gap-4 md:grid-cols-3"><StatCard label="Sales" value={formatMoney(total("sale"), currency)} /><StatCard label="Purchases" value={formatMoney(total("purchase"), currency)} /><StatCard label="Operating expenses" value={formatMoney(total("expense"), currency)} /></section>
    <section><h3 className="mb-3 font-display text-2xl font-semibold">Ledger</h3><div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Date</th><th>Type</th><th>Category</th><th>Note</th><th className="px-4 text-right">Amount</th></tr></thead><tbody className="divide-y divide-slate-100">{ledger.map((entry) => <tr key={entry.id}><td className="px-4 py-3">{new Date(entry.createdAt).toLocaleString()}</td><td className="capitalize">{entry.type}</td><td className="font-semibold">{entry.category}</td><td className="text-slate-500">{entry.note ?? "—"}</td><td className="px-4 text-right font-semibold">{formatMoney(entry.amount, currency)}</td></tr>)}</tbody></table></div></section>
  </div>;
}
