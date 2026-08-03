"use client";

import { useEffect, useState } from "react";
import { PrimaryButton, SecondaryButton, TextInput, Field } from "@/components/ui";
import { addMenuItemDraft, formatMoney, loadStore, toggleMenuAvailability } from "@/lib/store";
import type { PosStore } from "@/lib/types";

export function MenuView() {
  const [store, setStore] = useState<PosStore | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("8");
  const [categoryId, setCategoryId] = useState("");

  function refresh() {
    const next = loadStore();
    setStore(next);
    if (next && !categoryId) setCategoryId(next.categories[0]?.id ?? "");
  }

  useEffect(() => {
    refresh();
  }, []);

  function addItem() {
    if (!store || !name.trim() || !categoryId) return;
    addMenuItemDraft(categoryId, name.trim(), Number(price) || 0);
    setName("");
    setPrice("8");
    refresh();
  }

  if (!store) return <p className="text-slate-500">Loading menu…</p>;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Catalog</p>
        <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">Menu</h2>
        <p className="mt-2 text-slate-600">Manage categories, pricing, and item availability.</p>
      </div>

      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft">
        <h3 className="font-display text-2xl font-semibold">Add item</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
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
              {store.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="flex items-end">
            <PrimaryButton onClick={addItem} className="w-full py-3">
              Add to menu
            </PrimaryButton>
          </div>
        </div>
      </section>

      {store.categories.map((category) => {
        const items = store.menu.filter((item) => item.categoryId === category.id);
        return (
          <section key={category.id}>
            <h3 className="mb-4 font-display text-2xl font-semibold">{category.name}</h3>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <div key={item.id} className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.description || "No description"}</p>
                    </div>
                    <p className="font-bold text-accent">{formatMoney(item.price, store.settings.currency)}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
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
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
