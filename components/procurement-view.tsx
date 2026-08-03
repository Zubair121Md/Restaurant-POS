"use client";

import { useState } from "react";
import { useBranchData } from "@/components/app-provider";
import { Field, PrimaryButton, SecondaryButton, TextInput } from "@/components/ui";
import { completeTransfer, createId, createPurchaseOrder, createTransfer, receivePurchaseOrder, upsertVendor } from "@/lib/store";

export function ProcurementView() {
  const { store, branchId, vendors, ingredients, purchaseOrders, transfers, session, refresh } = useBranchData();
  const [vendorName, setVendorName] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [ingredientId, setIngredientId] = useState("");
  const [qty, setQty] = useState("1");
  const [unitCost, setUnitCost] = useState("0");
  const [toBranchId, setToBranchId] = useState("");
  if (!store) return <p className="text-slate-500">Loading procurement…</p>;
  const selectedVendor = vendorId || vendors[0]?.id || "";
  const selectedIngredient = ingredientId || ingredients[0]?.id || "";
  const targetBranch = toBranchId || store.branches.find((branch) => branch.id !== branchId)?.id || "";
  const actor = session?.username ?? "system";

  return <div className="space-y-8">
    <header><p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Supply chain</p><h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">Procurement</h2><p className="mt-2 text-slate-600">Manage vendors, purchase orders, and branch transfers.</p></header>
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-slate-200 bg-white p-6"><h3 className="font-display text-2xl font-semibold">Vendors</h3><div className="mt-4 flex gap-3"><div className="flex-1"><TextInput value={vendorName} onChange={setVendorName} placeholder="Vendor name" /></div><PrimaryButton onClick={() => { if (!vendorName.trim()) return; upsertVendor({ id: createId("vendor"), name: vendorName.trim(), products: [], rating: 0, creditLimit: 0, paymentTermsDays: 0 }); setVendorName(""); refresh(); }}>Add vendor</PrimaryButton></div><div className="mt-4 divide-y divide-slate-100">{vendors.map((vendor) => <div key={vendor.id} className="flex justify-between py-3 text-sm"><span className="font-semibold">{vendor.name}</span><span className="text-slate-500">{vendor.paymentTermsDays} day terms · {vendor.rating}/5</span></div>)}</div></div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6"><h3 className="font-display text-2xl font-semibold">Create purchase order</h3><div className="mt-4 grid gap-3"><Field label="Vendor"><select value={selectedVendor} onChange={(e) => setVendorId(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3">{vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}</select></Field><Field label="Ingredient"><select value={selectedIngredient} onChange={(e) => setIngredientId(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3">{ingredients.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field><div className="grid grid-cols-2 gap-3"><Field label="Quantity"><TextInput type="number" value={qty} onChange={setQty} /></Field><Field label="Unit cost"><TextInput type="number" value={unitCost} onChange={setUnitCost} /></Field></div><PrimaryButton onClick={() => { if (!selectedVendor || !selectedIngredient) return; createPurchaseOrder({ id: createId("po"), branchId, vendorId: selectedVendor, items: [{ ingredientId: selectedIngredient, qty: Number(qty) || 0, unitCost: Number(unitCost) || 0 }] }); refresh(); }}>Create PO</PrimaryButton></div></div>
    </section>
    <section><h3 className="mb-3 font-display text-2xl font-semibold">Purchase orders</h3><div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">{purchaseOrders.map((po) => <div key={po.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"><div><p className="font-semibold">{po.id}</p><p className="text-sm text-slate-500">{vendors.find((vendor) => vendor.id === po.vendorId)?.name} · {po.items.length} line(s)</p></div><div className="flex items-center gap-3"><span className="text-sm font-semibold capitalize">{po.status}</span>{po.status !== "received" && po.status !== "cancelled" ? <SecondaryButton onClick={() => { receivePurchaseOrder(po.id, actor); refresh(); }}>Receive</SecondaryButton> : null}</div></div>)}</div></section>
    <section className="rounded-3xl border border-slate-200 bg-white p-6"><h3 className="font-display text-2xl font-semibold">Inter-branch transfer</h3><div className="mt-4 grid gap-4 md:grid-cols-3"><Field label="Ingredient"><select value={selectedIngredient} onChange={(e) => setIngredientId(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3">{ingredients.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field><Field label="Destination"><select value={targetBranch} onChange={(e) => setToBranchId(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3">{store.branches.filter((branch) => branch.id !== branchId).map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></Field><Field label="Quantity"><TextInput type="number" value={qty} onChange={setQty} /></Field></div><PrimaryButton className="mt-4" onClick={() => { if (!targetBranch || !selectedIngredient) return; createTransfer({ id: createId("transfer"), fromBranchId: branchId, toBranchId: targetBranch, ingredientId: selectedIngredient, qty: Number(qty) || 0 }); refresh(); }}>Create transfer</PrimaryButton>
      <div className="mt-5 divide-y divide-slate-100">{transfers.map((transfer) => <div key={transfer.id} className="flex items-center justify-between py-3 text-sm"><span>{store.branches.find((b) => b.id === transfer.fromBranchId)?.name} → {store.branches.find((b) => b.id === transfer.toBranchId)?.name} · {transfer.qty}</span><div className="flex items-center gap-3"><span className="capitalize">{transfer.status}</span>{transfer.status === "pending" ? <SecondaryButton onClick={() => { completeTransfer(transfer.id, actor); refresh(); }}>Complete</SecondaryButton> : null}</div></div>)}</div>
    </section>
  </div>;
}
