"use client";

import { useState } from "react";
import { useBranchData } from "@/components/app-provider";
import { Field, PrimaryButton, SecondaryButton, TextInput } from "@/components/ui";
import { addWaitlist, createReservation, seatReservation, seatWaitlist, updateReservation, updateWaitlist } from "@/lib/store";

export function ReservationsView() {
  const { branchId, reservations, waitlist, tables, refresh } = useBranchData();
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState("2");
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");
  const [waitGuest, setWaitGuest] = useState("");
  const [waitPhone, setWaitPhone] = useState("");
  const [waitParty, setWaitParty] = useState("2");
  const freeTables = tables.filter((table) => table.status === "available");

  function createBooking() {
    if (!guestName.trim() || !phone.trim() || !scheduledAt) return;
    createReservation({ branchId, guestName: guestName.trim(), phone: phone.trim(), partySize: Math.max(1, Number(partySize) || 1), scheduledAt: new Date(scheduledAt).toISOString(), notes: notes.trim() || undefined });
    setGuestName(""); setPhone(""); setPartySize("2"); setScheduledAt(""); setNotes(""); refresh();
  }

  function addGuestToWaitlist() {
    if (!waitGuest.trim() || !waitPhone.trim()) return;
    addWaitlist({ branchId, guestName: waitGuest.trim(), phone: waitPhone.trim(), partySize: Math.max(1, Number(waitParty) || 1) });
    setWaitGuest(""); setWaitPhone(""); setWaitParty("2"); refresh();
  }

  return (
    <div className="space-y-8">
      <header><p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Front desk</p><h2 className="mt-2 font-display text-4xl font-semibold">Reservations</h2><p className="mt-2 text-slate-600">Manage upcoming bookings and walk-in demand.</p></header>
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Panel title="New reservation">
          <div className="space-y-3">
            <Field label="Guest name"><TextInput value={guestName} onChange={setGuestName} /></Field>
            <Field label="Phone"><TextInput value={phone} onChange={setPhone} /></Field>
            <Field label="Party size"><TextInput type="number" value={partySize} onChange={setPartySize} /></Field>
            <Field label="Date and time"><TextInput type="datetime-local" value={scheduledAt} onChange={setScheduledAt} /></Field>
            <Field label="Notes"><TextInput value={notes} onChange={setNotes} placeholder="Occasion, accessibility…" /></Field>
            <PrimaryButton className="w-full" onClick={createBooking}>Create reservation</PrimaryButton>
          </div>
        </Panel>
        <Panel title="Bookings">
          <div className="space-y-3">
            {[...reservations].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)).map((reservation) => (
              <div key={reservation.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><p className="font-semibold">{reservation.guestName} · {reservation.partySize} guests</p><p className="mt-1 text-sm text-slate-500">{new Date(reservation.scheduledAt).toLocaleString()} · {reservation.phone}</p>{reservation.notes ? <p className="mt-1 text-xs text-slate-500">{reservation.notes}</p> : null}</div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold capitalize">{reservation.status.replace("_", " ")}</span>
                </div>
                {reservation.status === "booked" ? <div className="mt-3 flex flex-wrap gap-2">
                  <select defaultValue={reservation.tableId ?? ""} onChange={(event) => { if (event.target.value) { seatReservation(reservation.id, event.target.value); refresh(); } }} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"><option value="">Seat at table…</option>{freeTables.filter((table) => table.seats >= reservation.partySize).map((table) => <option key={table.id} value={table.id}>{table.label} ({table.seats})</option>)}</select>
                  <SecondaryButton onClick={() => { updateReservation(reservation.id, { status: "cancelled" }); refresh(); }}>Cancel</SecondaryButton>
                  <SecondaryButton onClick={() => { updateReservation(reservation.id, { status: "no_show" }); refresh(); }}>No show</SecondaryButton>
                </div> : null}
              </div>
            ))}
            {!reservations.length && <p className="text-sm text-slate-500">No reservations yet.</p>}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Panel title="Add walk-in">
          <div className="space-y-3">
            <Field label="Guest name"><TextInput value={waitGuest} onChange={setWaitGuest} /></Field>
            <Field label="Phone"><TextInput value={waitPhone} onChange={setWaitPhone} /></Field>
            <Field label="Party size"><TextInput type="number" value={waitParty} onChange={setWaitParty} /></Field>
            <PrimaryButton className="w-full" onClick={addGuestToWaitlist}>Join waitlist</PrimaryButton>
          </div>
        </Panel>
        <Panel title="Waitlist">
          <div className="space-y-3">
            {waitlist.filter((entry) => entry.status === "waiting").map((entry) => (
              <div key={entry.id} className="flex flex-col justify-between gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center">
                <div><p className="font-semibold">{entry.guestName} · {entry.partySize}</p><p className="text-sm text-slate-500">{entry.phone} · {Math.max(0, Math.floor((Date.now() - new Date(entry.createdAt).getTime()) / 60000))} min</p></div>
                <div className="flex gap-2">
                  <select defaultValue="" onChange={(event) => { if (event.target.value) { seatWaitlist(entry.id, event.target.value); refresh(); } }} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"><option value="">Seat…</option>{freeTables.filter((table) => table.seats >= entry.partySize).map((table) => <option key={table.id} value={table.id}>{table.label}</option>)}</select>
                  <SecondaryButton onClick={() => { updateWaitlist(entry.id, { status: "left" }); refresh(); }}>Left</SecondaryButton>
                </div>
              </div>
            ))}
            {!waitlist.some((entry) => entry.status === "waiting") && <p className="text-sm text-slate-500">Waitlist is clear.</p>}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft"><h3 className="font-display text-xl font-semibold">{title}</h3><div className="mt-4">{children}</div></section>;
}
