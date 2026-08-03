"use client";

import { useState } from "react";
import { useBranchData } from "@/components/app-provider";
import { Field, PrimaryButton, SecondaryButton, TextInput } from "@/components/ui";
import { adjustStock, formatMoney, recordWastage } from "@/lib/store";

export function InventoryView() {
  const { store, ingredients, movements, session, refresh } = useBranchData();
  const [ingredientId, setIngredientId] = useState("");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  if (!store) return <p className="text-slate-500">Loading inventory…</p>;
  const selectedId = ingredientId || ingredients[0]?.id || "";

  function submit(kind: "adjust" | "waste") {
    const amount = Number(qty);
    if (!selectedId || !amount) return;
    if (kind === "adjust") adjustStock(selectedId, amount, note || "Manual adjustment", session?.username ?? "system");
    else recordWastage(selectedId, Math.abs(amount), note || "Recorded wastage", session?.username ?? "system");
    setQty(""); setNote(""); refresh();
  }

  return <div className="space-y-8">
    <header><p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Stock control</p><h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">Inventory</h2><p className="mt-2 text-slate-600">Track stock, expiry risk, adjustments, and waste.</p></header>
    <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full min-w-[820px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Ingredient</th><th>Quantity</th><th>Reorder</th><th>Expiry</th><th>Value</th><th className="px-4">Status</th></tr></thead>
      <tbody className="divide-y divide-slate-100">{ingredients.map((item) => { const expiryDays = item.expiryDate ? (new Date(item.expiryDate).getTime() - Date.now()) / 86400000 : Infinity; const low = item.stockQty <= item.reorderLevel; const expiring = expiryDays <= 3; return <tr key={item.id}><td className="px-4 py-3 font-semibold">{item.name}</td><td>{item.stockQty} {item.unit}</td><td>{item.reorderLevel} {item.unit}</td><td>{item.expiryDate ?? "—"}</td><td>{formatMoney(item.stockQty * item.costPerUnit, store.settings.currency)}</td><td className="px-4">{low || expiring ? <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">{low ? "Low" : "Expiring"}</span> : <span className="text-emerald-700">Healthy</span>}</td></tr>; })}</tbody></table>
    </section>
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
      <h3 className="font-display text-2xl font-semibold">Stock action</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-3"><Field label="Ingredient"><select value={selectedId} onChange={(event) => setIngredientId(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3">{ingredients.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field><Field label="Quantity"><TextInput type="number" value={qty} onChange={setQty} placeholder="Use negative to subtract" /></Field><Field label="Note"><TextInput value={note} onChange={setNote} placeholder="Reason" /></Field></div>
      <div className="mt-4 flex gap-3"><PrimaryButton onClick={() => submit("adjust")}>Adjust stock</PrimaryButton><SecondaryButton onClick={() => submit("waste")}>Record wastage</SecondaryButton></div>
    </section>
    <section><h3 className="mb-3 font-display text-2xl font-semibold">Recent movements</h3><div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">{[...movements].reverse().slice(0, 12).map((movement) => <div key={movement.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm"><div><p className="font-semibold capitalize">{movement.type.replace("_", " ")}</p><p className="text-slate-500">{ingredients.find((item) => item.id === movement.ingredientId)?.name ?? "Ingredient"} · {movement.note}</p></div><div className="text-right"><p className={movement.qty < 0 ? "font-semibold text-red-600" : "font-semibold text-accent"}>{movement.qty > 0 ? "+" : ""}{movement.qty}</p><p className="text-xs text-slate-500">{new Date(movement.createdAt).toLocaleString()}</p></div></div>)}</div></section>
  </div>;
}
