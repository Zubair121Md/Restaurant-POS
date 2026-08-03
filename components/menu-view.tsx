"use client";

import { useState } from "react";
import { useBranchData } from "@/components/app-provider";
import { PrimaryButton, SecondaryButton, TextInput, Field } from "@/components/ui";
import { createId, formatMoney, toggleMenuAvailability, upsertMenuItem } from "@/lib/store";
import type { KitchenStation } from "@/lib/types";

export function MenuView() {
  const { store, categories, menu, refresh } = useBranchData();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("8");
  const [categoryId, setCategoryId] = useState("");
  const [station, setStation] = useState<KitchenStation>("general");
  const [prepMinutes, setPrepMinutes] = useState("10");

  function addItem() {
    const selectedCategory = categoryId || categories[0]?.id;
    if (!store || !name.trim() || !selectedCategory) return;
    upsertMenuItem({
      id: createId("item"), categoryId: selectedCategory, name: name.trim(), description: "",
      price: Number(price) || 0, available: true, station, prepMinutes: Number(prepMinutes) || 0,
      costPrice: 0, isActive: true
    });
    setName("");
    setPrice("8");
    setPrepMinutes("10");
    refresh();
  }

  if (!store) return <p className="text-slate-500">Loading menu…</p>;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Catalog</p>
        <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">Menu</h2>
        <p className="mt-2 text-slate-600">Manage pricing, preparation, margins, and availability.</p>
      </div>

      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft">
        <h3 className="font-display text-2xl font-semibold">Add item</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <Field label="Name">
            <TextInput value={name} onChange={setName} placeholder="Item name" />
          </Field>
          <Field label="Price">
            <TextInput value={price} onChange={setPrice} placeholder="0.00" />
          </Field>
          <Field label="Category">
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium outline-none focus:border-accent"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Station">
            <select value={station} onChange={(event) => setStation(event.target.value as KitchenStation)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium outline-none focus:border-accent">
              {["general", "grill", "fry", "salad", "bar", "dessert"].map((value) => <option key={value}>{value}</option>)}
            </select>
          </Field>
          <Field label="Prep minutes">
            <TextInput value={prepMinutes} onChange={setPrepMinutes} type="number" />
          </Field>
          <div className="flex items-end">
            <PrimaryButton onClick={addItem} className="w-full py-3">
              Add to menu
            </PrimaryButton>
          </div>
        </div>
      </section>

      {categories.map((category) => {
        const items = menu.filter((item) => item.categoryId === category.id);
        return (
          <section key={category.id}>
            <h3 className="mb-4 font-display text-2xl font-semibold">{category.name}</h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Item</th><th>Station</th><th>Prep</th><th>Cost</th><th>Price</th><th>Margin</th><th className="px-4 text-right">Availability</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3"><p className="font-semibold text-ink">{item.name}</p><p className="text-xs text-slate-500">{item.description || "No description"}</p></td>
                  <td className="capitalize">{item.station}</td><td>{item.prepMinutes} min</td>
                  <td>{formatMoney(item.costPrice ?? 0, store.settings.currency)}</td>
                  <td className="font-semibold text-accent">{formatMoney(item.price, store.settings.currency)}</td>
                  <td>{item.price ? (((item.price - (item.costPrice ?? 0)) / item.price) * 100).toFixed(1) : "0.0"}%</td>
                  <td className="px-4 py-3"><div className="flex items-center justify-end gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.available ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {item.available ? "Available" : "Sold out"}
                    </span>
                    <SecondaryButton
                      onClick={() => {
                        toggleMenuAvailability(item.id);
                        refresh();
                      }}
                    >
                      Toggle
                    </SecondaryButton>
                  </div></td>
                </tr>
              ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
