"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { useBranchData } from "@/components/app-provider";
import { Field, PrimaryButton, TextInput } from "@/components/ui";
import { addWaitlist, createOrder, seatReservation, seatWaitlist } from "@/lib/store";
import type { DiningTable, TableStatus } from "@/lib/types";

const STATUS_STYLE: Record<string, string> = {
  available: "border-emerald-200 bg-emerald-50 text-emerald-800",
  occupied: "border-amber-200 bg-amber-50 text-amber-900",
  reserved: "border-sky-200 bg-sky-50 text-sky-900",
  billing: "border-violet-200 bg-violet-50 text-violet-900",
  dirty: "border-slate-300 bg-slate-100 text-slate-600"
};

export function TablesView() {
  const router = useRouter();
  const { branch, branchId, tables, orders, reservations, waitlist, session, refresh } = useBranchData();
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState("2");
  const today = new Date().toDateString();
  const todaysReservations = reservations.filter((item) => new Date(item.scheduledAt).toDateString() === today && !["cancelled", "completed", "no_show"].includes(item.status));
  const waiting = waitlist.filter((item) => item.status === "waiting");
  const freeTables = tables.filter((table) => table.status === "available");
  const zones = [...new Set(tables.map((table) => table.zone))];

  function openTable(table: DiningTable) {
    if (table.activeOrderId && ["occupied", "billing"].includes(table.status)) {
      router.push(`/orders/${table.activeOrderId}`);
      return;
    }
    if (table.status !== "available" || !session) return;
    const result = createOrder({ branchId, tableId: table.id, createdBy: session.username, waiterId: session.staffId, type: "dine_in" });
    if (result) {
      refresh();
      router.push(`/orders/${result.order.id}`);
    }
  }

  function joinWaitlist() {
    if (!guestName.trim() || !phone.trim()) return;
    addWaitlist({ branchId, guestName: guestName.trim(), phone: phone.trim(), partySize: Math.max(1, Number(partySize) || 1) });
    setGuestName(""); setPhone(""); setPartySize("2"); refresh();
  }

  function turnover(tableId: string) {
    return orders.filter((order) => order.tableId === tableId && order.status === "paid" && new Date(order.updatedAt).toDateString() === today).length;
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Live floor</p>
        <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">{branch?.name ?? "Tables"}</h2>
        <p className="mt-2 text-slate-600">Open a free table or resume an occupied ticket.</p>
      </header>
      <div className="flex flex-wrap gap-2">
        {(["available", "occupied", "reserved", "billing", "dirty"] as TableStatus[]).map((status) => <span key={status} className={clsx("rounded-full border px-3 py-1 text-xs font-semibold capitalize", STATUS_STYLE[status])}>{status}</span>)}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          {zones.map((zone) => (
            <section key={zone}>
              <h3 className="mb-4 font-display text-2xl font-semibold">{zone}</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tables.filter((table) => table.zone === zone).map((table) => (
                  <button key={table.id} type="button" onClick={() => openTable(table)} className={clsx("rounded-3xl border p-5 text-left transition", STATUS_STYLE[table.status] ?? STATUS_STYLE.dirty, (table.status === "available" || table.activeOrderId) && "hover:-translate-y-0.5 hover:shadow-soft")}>
                    <div className="flex items-start justify-between gap-3"><p className="font-display text-3xl font-semibold">{table.label}</p><span className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold capitalize">{table.status}</span></div>
                    <p className="mt-4 text-sm font-medium">{table.seats} seats · {turnover(table.id)} turns today</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wider opacity-70">{table.activeOrderId ? "Open ticket" : table.status === "available" ? "Tap to seat" : "Not available"}</p>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="space-y-5">
          <Panel title="Today’s reservations">
            {todaysReservations.length ? todaysReservations.map((reservation) => (
              <div key={reservation.id} className="rounded-2xl bg-slate-50 p-3">
                <p className="font-semibold">{reservation.guestName} · {reservation.partySize}</p>
                <p className="text-xs text-slate-500">{new Date(reservation.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {reservation.phone}</p>
                <select aria-label={`Table for ${reservation.guestName}`} defaultValue={reservation.tableId ?? ""} onChange={(event) => { if (event.target.value) { seatReservation(reservation.id, event.target.value); refresh(); } }} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm">
                  <option value="">Seat at table…</option>
                  {freeTables.filter((table) => table.seats >= reservation.partySize).map((table) => <option key={table.id} value={table.id}>{table.label} ({table.seats})</option>)}
                </select>
              </div>
            )) : <p className="text-sm text-slate-500">No arrivals scheduled today.</p>}
          </Panel>

          <Panel title="Waitlist">
            <div className="space-y-3">
              <Field label="Guest name"><TextInput value={guestName} onChange={setGuestName} placeholder="Guest name" /></Field>
              <Field label="Phone"><TextInput value={phone} onChange={setPhone} placeholder="Phone" /></Field>
              <Field label="Party size"><TextInput type="number" value={partySize} onChange={setPartySize} /></Field>
              <PrimaryButton className="w-full" onClick={joinWaitlist}>Add to waitlist</PrimaryButton>
            </div>
            <div className="mt-4 space-y-3">
              {waiting.map((entry) => (
                <div key={entry.id} className="rounded-2xl bg-slate-50 p-3">
                  <p className="font-semibold">{entry.guestName} · {entry.partySize}</p>
                  <p className="text-xs text-slate-500">{Math.max(0, Math.floor((Date.now() - new Date(entry.createdAt).getTime()) / 60000))} min waiting</p>
                  <select aria-label={`Seat ${entry.guestName}`} defaultValue="" onChange={(event) => { if (event.target.value) { seatWaitlist(entry.id, event.target.value); refresh(); } }} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm">
                    <option value="">Seat at table…</option>
                    {freeTables.filter((table) => table.seats >= entry.partySize).map((table) => <option key={table.id} value={table.id}>{table.label} ({table.seats})</option>)}
                  </select>
                </div>
              ))}
              {!waiting.length && <p className="text-sm text-slate-500">Waitlist is clear.</p>}
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft"><h3 className="font-display text-xl font-semibold">{title}</h3><div className="mt-4">{children}</div></section>;
}
