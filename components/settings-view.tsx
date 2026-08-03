"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Field, PrimaryButton, SecondaryButton, TextInput } from "@/components/ui";
import { loadStore, resetInstall, updateSettings } from "@/lib/store";
import type { PosStore } from "@/lib/types";

export function SettingsView() {
  const router = useRouter();
  const [store, setStore] = useState<PosStore | null>(null);
  const [currency, setCurrency] = useState("USD");
  const [taxRate, setTaxRate] = useState("8");
  const [tipEnabled, setTipEnabled] = useState(true);

  useEffect(() => {
    const next = loadStore();
    setStore(next);
    if (next) {
      setCurrency(next.settings.currency);
      setTaxRate(String(Math.round(next.settings.taxRate * 100)));
      setTipEnabled(next.settings.tipEnabled);
    }
  }, []);

  function save() {
    updateSettings({
      currency: currency.trim().toUpperCase() || "USD",
      taxRate: (Number(taxRate) || 0) / 100,
      tipEnabled
    });
    setStore(loadStore());
  }

  function hardReset() {
    if (!window.confirm("Reset Restaurant POS and erase local data?")) return;
    resetInstall();
    router.replace("/setup");
  }

  if (!store) return <p className="text-slate-500">Loading settings…</p>;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Venue</p>
        <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">Settings</h2>
        <p className="mt-2 text-slate-600">Business profile, tax, tips, and local data controls.</p>
      </div>

      <section className="grid gap-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft lg:grid-cols-2">
        <div className="space-y-3">
          <h3 className="font-display text-2xl font-semibold">Business</h3>
          <Info label="Name" value={store.install.restaurantName} />
          <Info label="Type" value={store.install.businessType} />
          <Info label="Admin" value={store.install.username} />
          <Info label="Provider" value={store.install.provider} />
          <Info label="Installed" value={new Date(store.install.installedAt).toLocaleString()} />
        </div>

        <div className="space-y-4">
          <h3 className="font-display text-2xl font-semibold">Checkout</h3>
          <Field label="Currency code">
            <TextInput value={currency} onChange={setCurrency} placeholder="USD" />
          </Field>
          <Field label="Tax rate (%)">
            <TextInput value={taxRate} onChange={setTaxRate} placeholder="8" />
          </Field>
          <label className="flex items-center gap-3 text-sm font-semibold">
            <input
              type="checkbox"
              checked={tipEnabled}
              onChange={(event) => setTipEnabled(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Enable tip entry at checkout
          </label>
          <PrimaryButton onClick={save}>Save settings</PrimaryButton>
        </div>
      </section>

      <section className="rounded-3xl border border-danger/20 bg-white p-6 shadow-soft">
        <h3 className="font-display text-2xl font-semibold text-danger">Danger zone</h3>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Clearing setup removes menu, tables, orders, and session data stored in this browser.
        </p>
        <SecondaryButton className="mt-4 border-danger/30 text-danger hover:bg-red-50" onClick={hardReset}>
          Reset Restaurant POS
        </SecondaryButton>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 font-semibold capitalize">{value}</p>
    </div>
  );
}
