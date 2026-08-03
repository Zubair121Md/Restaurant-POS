"use client";

import { useState } from "react";
import { useBranchData } from "@/components/app-provider";
import { Field, PrimaryButton, SecondaryButton, TextInput } from "@/components/ui";
import { createId, markAttendance, upsertStaff } from "@/lib/store";
import type { StaffMember, StaffRole } from "@/lib/types";

const roles: StaffRole[] = ["owner", "regional_manager", "branch_manager", "cashier", "waiter", "chef", "kitchen", "store_manager", "accountant", "procurement", "delivery_manager"];

export function StaffView() {
  const { branchId, staff, refresh } = useBranchData();
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<StaffRole>("waiter");
  const [hourlyRate, setHourlyRate] = useState("0");
  const today = new Date().toISOString().slice(0, 10);

  function edit(member: StaffMember) { setEditing(member); setName(member.name); setUsername(member.username); setRole(member.role); setHourlyRate(String(member.hourlyRate ?? 0)); }
  function save() {
    if (!name.trim() || !username.trim()) return;
    upsertStaff({ id: editing?.id ?? createId("staff"), branchId, name: name.trim(), username: username.trim(), role, hourlyRate: Number(hourlyRate) || 0, active: editing?.active ?? true, joinDate: editing?.joinDate ?? today, attendance: editing?.attendance ?? [] });
    setEditing(null); setName(""); setUsername(""); setHourlyRate("0"); refresh();
  }

  return <div className="space-y-8">
    <header><p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">People</p><h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">Staff</h2><p className="mt-2 text-slate-600">Maintain the branch roster, roles, pay rates, and attendance.</p></header>
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft"><h3 className="font-display text-2xl font-semibold">{editing ? "Edit staff member" : "Add staff member"}</h3><div className="mt-4 grid gap-4 md:grid-cols-4"><Field label="Name"><TextInput value={name} onChange={setName} /></Field><Field label="Username"><TextInput value={username} onChange={setUsername} /></Field><Field label="Role"><select value={role} onChange={(event) => setRole(event.target.value as StaffRole)} className="w-full rounded-xl border border-slate-200 px-4 py-3">{roles.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select></Field><Field label="Hourly rate"><TextInput type="number" value={hourlyRate} onChange={setHourlyRate} /></Field></div><div className="mt-4 flex gap-3"><PrimaryButton onClick={save}>{editing ? "Update staff" : "Add staff"}</PrimaryButton>{editing ? <SecondaryButton onClick={() => setEditing(null)}>Cancel</SecondaryButton> : null}</div></section>
    <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Name</th><th>Username</th><th>Role</th><th>Rate</th><th>Today</th><th className="px-4"></th></tr></thead><tbody className="divide-y divide-slate-100">{staff.map((member) => { const attendance = member.attendance.find((entry) => entry.date === today); return <tr key={member.id}><td className="px-4 py-3 font-semibold">{member.name}</td><td>{member.username}</td><td><span className="rounded-full bg-accentSoft px-2.5 py-1 text-xs font-semibold capitalize text-accent">{member.role.replaceAll("_", " ")}</span></td><td>{member.hourlyRate ?? 0}/hr</td><td>{attendance ? <span className="font-semibold capitalize text-emerald-700">{attendance.status}</span> : "Not marked"}</td><td className="px-4 py-3"><div className="flex justify-end gap-2"><SecondaryButton onClick={() => edit(member)}>Edit</SecondaryButton><SecondaryButton disabled={Boolean(attendance)} onClick={() => { markAttendance(member.id, { id: createId("attendance"), date: today, status: "present", checkIn: new Date().toISOString() }); refresh(); }}>Check in</SecondaryButton></div></td></tr>; })}</tbody></table></section>
  </div>;
}
