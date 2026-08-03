"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/app-provider";
import { Field, PrimaryButton, SecondaryButton, TextInput } from "@/components/ui";
import { resetInstall, updateSettings } from "@/lib/store";
import { COMPANY, DEMO } from "@/lib/brand";

export function SettingsView() {
  const router = useRouter();
  const { store, refresh } = useApp();
  const [currency, setCurrency] = useState(store?.settings.currency ?? "USD");
  const [taxRate, setTaxRate] = useState(String((store?.settings.taxRate ?? 0.08) * 100));
  const [gstRate, setGstRate] = useState(String((store?.settings.gstRate ?? 0) * 100));
  const [serviceChargeRate, setServiceChargeRate] = useState(String((store?.settings.serviceChargeRate ?? 0) * 100));
  const [maxDiscountPercent, setMaxDiscountPercent] = useState(String(store?.settings.maxDiscountPercent ?? 20));
  const [gstEnabled, setGstEnabled] = useState(store?.settings.gstEnabled ?? false);
  const [allowDiscounts, setAllowDiscounts] = useState(store?.settings.allowDiscounts ?? true);
  const [offlineMode, setOfflineMode] = useState(store?.settings.offlineMode ?? true);
  const initialized = useRef(false);

  useEffect(() => {
    if (!store || initialized.current) return;
    initialized.current = true;
    setCurrency(store.settings.currency);
    setTaxRate(String(store.settings.taxRate * 100));
    setGstRate(String(store.settings.gstRate * 100));
    setServiceChargeRate(String(store.settings.serviceChargeRate * 100));
    setMaxDiscountPercent(String(store.settings.maxDiscountPercent));
    setGstEnabled(store.settings.gstEnabled);
    setAllowDiscounts(store.settings.allowDiscounts);
    setOfflineMode(store.settings.offlineMode);
  }, [store]);

  function save() {
    updateSettings({
      currency: currency.trim().toUpperCase() || "USD",
      taxRate: (Number(taxRate) || 0) / 100,
      gstEnabled,
      gstRate: (Number(gstRate) || 0) / 100,
      serviceChargeRate: (Number(serviceChargeRate) || 0) / 100,
      allowDiscounts,
      maxDiscountPercent: Number(maxDiscountPercent) || 0,
      offlineMode
    });
    refresh();
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
        <p className="mt-2 text-slate-600">Business profile, checkout rules, and local data controls.</p>
      </div>

      <section className="grid gap-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft lg:grid-cols-2">
        <div className="space-y-3">
          <h3 className="font-display text-2xl font-semibold">Business</h3>
          <Info label="Name" value={store.install.restaurantName} />
          <Info label="Operator" value={COMPANY.legalName} />
          <Info label="Environment" value={DEMO.notice} />
          <Info label="Type" value={store.install.businessType} />
          <Info label="Admin" value={store.install.username} />
          <Info label="Provider" value={store.install.provider} />
          <Info label="Installed" value={new Date(store.install.installedAt).toLocaleString()} />
          <Info label="Active branch" value={store.branches.find((branch) => branch.id === store.activeBranchId)?.name ?? "Unknown"} />
        </div>

        <div className="space-y-4">
          <h3 className="font-display text-2xl font-semibold">Tax & checkout</h3>
          <Field label="Currency code">
            <TextInput value={currency} onChange={setCurrency} placeholder="INR" />
          </Field>
          <Field label="Tax rate (%)">
            <TextInput value={taxRate} onChange={setTaxRate} placeholder="5" />
          </Field>
          <Field label="GST rate (%)"><TextInput value={gstRate} onChange={setGstRate} /></Field>
          <Field label="Service charge (%)"><TextInput value={serviceChargeRate} onChange={setServiceChargeRate} /></Field>
          <Field label="Maximum discount (%)"><TextInput value={maxDiscountPercent} onChange={setMaxDiscountPercent} /></Field>
          <Toggle label="Enable GST" checked={gstEnabled} onChange={setGstEnabled} />
          <Toggle label="Allow discounts" checked={allowDiscounts} onChange={setAllowDiscounts} />
          <Toggle label="Enable offline mode" checked={offlineMode} onChange={setOfflineMode} />
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

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 rounded border-slate-300" />{label}</label>;
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 font-semibold capitalize">{value}</p>
    </div>
  );
}
