"use client";

import { useState } from "react";
import { useBranchData } from "@/components/app-provider";
import { Field, PrimaryButton, SecondaryButton, TextInput } from "@/components/ui";
import { addFeedback, createId, formatMoney, resolveFeedback, upsertCustomer } from "@/lib/store";
import type { Customer } from "@/lib/types";

export function CustomersView() {
  const { store, customers, feedback, refresh } = useBranchData();
  const [editing, setEditing] = useState<Customer | null>(null);
  const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [email, setEmail] = useState("");
  const [customerId, setCustomerId] = useState(""); const [rating, setRating] = useState("5"); const [comment, setComment] = useState("");
  if (!store) return <p className="text-slate-500">Loading customers…</p>;

  function edit(customer: Customer) { setEditing(customer); setName(customer.name); setPhone(customer.phone); setEmail(customer.email ?? ""); }
  function save() { if (!name.trim() || !phone.trim()) return; upsertCustomer({ id: editing?.id ?? createId("customer"), name: name.trim(), phone: phone.trim(), email: email.trim() || undefined, visits: editing?.visits ?? 0, totalSpend: editing?.totalSpend ?? 0, loyaltyPoints: editing?.loyaltyPoints ?? 0, tags: editing?.tags ?? [] }); setEditing(null); setName(""); setPhone(""); setEmail(""); refresh(); }

  return <div className="space-y-8">
    <header><p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Relationships</p><h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">Customers</h2><p className="mt-2 text-slate-600">Track customer value, loyalty, and service feedback.</p></header>
    <section className="rounded-3xl border border-slate-200 bg-white p-6"><h3 className="font-display text-2xl font-semibold">{editing ? "Edit customer" : "Add customer"}</h3><div className="mt-4 grid gap-4 md:grid-cols-3"><Field label="Name"><TextInput value={name} onChange={setName} /></Field><Field label="Phone"><TextInput value={phone} onChange={setPhone} /></Field><Field label="Email"><TextInput value={email} onChange={setEmail} /></Field></div><div className="mt-4 flex gap-3"><PrimaryButton onClick={save}>{editing ? "Update customer" : "Add customer"}</PrimaryButton>{editing ? <SecondaryButton onClick={() => setEditing(null)}>Cancel</SecondaryButton> : null}</div></section>
    <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Customer</th><th>Visits</th><th>Total spend</th><th>Points</th><th>Last visit</th><th className="px-4"></th></tr></thead><tbody className="divide-y divide-slate-100">{customers.map((customer) => <tr key={customer.id}><td className="px-4 py-3"><p className="font-semibold">{customer.name}</p><p className="text-xs text-slate-500">{customer.phone}</p></td><td>{customer.visits}</td><td>{formatMoney(customer.totalSpend, store.settings.currency)}</td><td className="font-semibold text-accent">{customer.loyaltyPoints}</td><td>{customer.lastVisitAt ? new Date(customer.lastVisitAt).toLocaleDateString() : "—"}</td><td className="px-4 text-right"><SecondaryButton onClick={() => edit(customer)}>Edit</SecondaryButton></td></tr>)}</tbody></table></section>
    <section className="grid gap-6 lg:grid-cols-[1fr_2fr]"><div className="rounded-3xl border border-slate-200 bg-white p-6"><h3 className="font-display text-2xl font-semibold">Add feedback</h3><div className="mt-4 space-y-4"><Field label="Customer"><select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3"><option value="">Anonymous</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></Field><Field label="Rating"><select value={rating} onChange={(e) => setRating(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3">{[1,2,3,4,5].map((value) => <option key={value}>{value}</option>)}</select></Field><Field label="Comment"><TextInput value={comment} onChange={setComment} /></Field><PrimaryButton onClick={() => { addFeedback({ id: createId("feedback"), customerId: customerId || undefined, rating: Number(rating) as 1|2|3|4|5, comment }); setComment(""); refresh(); }}>Save feedback</PrimaryButton></div></div>
      <div><h3 className="mb-3 font-display text-2xl font-semibold">Feedback</h3><div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">{feedback.map((entry) => <div key={entry.id} className="flex items-start justify-between gap-4 p-4"><div><p className="font-semibold">{entry.rating}/5 · {customers.find((customer) => customer.id === entry.customerId)?.name ?? "Anonymous"}</p><p className="mt-1 text-sm text-slate-600">{entry.comment || "No comment"}</p></div>{entry.status === "open" ? <SecondaryButton onClick={() => { resolveFeedback(entry.id); refresh(); }}>Resolve</SecondaryButton> : <span className="text-sm font-semibold text-emerald-700">Resolved</span>}</div>)}</div></div>
    </section>
  </div>;
}
