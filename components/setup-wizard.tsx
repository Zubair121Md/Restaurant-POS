"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ChefHat, Coffee, Database, HardDrive, Store } from "lucide-react";
import clsx from "clsx";
import { Field, OptionCard, PrimaryButton, SecondaryButton, StepIndicator, TextInput } from "@/components/ui";
import { businessTypes, canFinish, copy, isStepValid, languages, providers } from "@/lib/i18n";
import { isProviderConfigured } from "@/lib/providers";
import { completeInstall, defaultInstall, loadDemoWorkspace, resetInstall } from "@/lib/store";
import { COMPANY, DEMO } from "@/lib/brand";
import type { DataProvider, InstallState, Language } from "@/lib/types";

const TOTAL_STEPS = 4;
const STEP_LABEL_KEYS = ["stepLanguage", "stepBusiness", "stepCredentials", "stepProvider"] as const;

export function SetupWizard() {
  const router = useRouter();
  const [form, setForm] = useState<InstallState>(defaultInstall);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const t = copy[form.language];
  const stepLabels = STEP_LABEL_KEYS.map((key) => t[key]);
  const providerConfigured = useMemo(() => isProviderConfigured(form.provider), [form.provider]);
  const stepValid = isStepValid(step, form);

  function update<K extends keyof InstallState>(key: K, value: InstallState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function next() {
    if (!stepValid) return;
    setStep((current) => Math.min(current + 1, TOTAL_STEPS - 1));
  }

  function back() {
    setStep((current) => Math.max(current - 1, 0));
  }

  function finish() {
    if (!canFinish(form)) return;
    setSubmitting(true);
    completeInstall(form);
    window.setTimeout(() => {
      setSubmitting(false);
      setDone(true);
    }, 500);
  }

  function loadDemo() {
    setSubmitting(true);
    loadDemoWorkspace();
    window.setTimeout(() => {
      setSubmitting(false);
      router.push("/dashboard");
    }, 400);
  }

  function openDashboard() {
    router.push("/dashboard");
  }

  function restart() {
    resetInstall();
    setForm((current) => ({ ...defaultInstall, language: current.language }));
    setDone(false);
    setStep(0);
  }

  if (done) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-surface px-4 py-10 text-ink sm:px-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.16),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.08),_transparent_35%)]" />
        <div className="relative mx-auto w-full max-w-2xl rounded-3xl border border-slate-200/80 bg-white p-8 shadow-soft sm:p-10">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accentSoft text-accent">
            <Check className="h-8 w-8" />
          </span>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-accent">{t.brand}</p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">{t.installed}</h2>
          <p className="mt-3 text-slate-600">
            {form.restaurantName} · {form.businessType === "restaurant" ? t.restaurant : t.cafe}
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Metric label="Provider" value={form.provider} />
            <Metric label="Status" value={providerConfigured ? t.ready : t.missing} />
            <Metric label="Admin" value={form.username} />
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <PrimaryButton onClick={openDashboard} className="flex-1 py-3">
              {t.openPanel}
              <ArrowRight className="h-4 w-4" />
            </PrimaryButton>
            <SecondaryButton onClick={restart}>{t.restart}</SecondaryButton>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-surface px-4 py-8 text-ink sm:px-6 lg:py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.14),_transparent_42%),linear-gradient(180deg,_rgba(255,255,255,0.4),_transparent_30%)]" />
      <div className="relative mx-auto w-full max-w-3xl">
        <header className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-teal-200">
            <ChefHat className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{COMPANY.legalName}</p>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{t.appTitle}</h1>
            <p className="mt-1 text-sm text-slate-600">{t.appSubtitle}</p>
          </div>
        </header>

        <div className="mt-6 rounded-3xl border border-accent/20 bg-accentSoft/60 p-5">
          <p className="text-sm font-semibold text-ink">Spice Garden test workspace</p>
          <p className="mt-1 text-sm text-slate-600">
            Load a full demo with 3 Bengaluru branches, live tickets, kitchen KOTs, inventory, vendors, CRM, and accounting — built by {COMPANY.legalName}.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Login after load: <span className="font-semibold text-ink">{DEMO.username}</span> / <span className="font-semibold text-ink">{DEMO.password}</span>
          </p>
          <PrimaryButton onClick={loadDemo} disabled={submitting} className="mt-4">
            {submitting ? "Loading demo…" : "Launch Spice Garden demo"}
          </PrimaryButton>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-soft sm:p-8">
          <StepIndicator steps={TOTAL_STEPS} current={step} labels={stepLabels} />

          <div className="mt-8">
            {step === 0 ? <StepLanguage form={form} t={t} onSelect={(value) => update("language", value)} /> : null}
            {step === 1 ? <StepBusiness form={form} t={t} onBusiness={update} /> : null}
            {step === 2 ? <StepCredentials form={form} t={t} onChange={update} /> : null}
            {step === 3 ? (
              <StepProvider form={form} t={t} providerConfigured={providerConfigured} onSelect={(value) => update("provider", value)} />
            ) : null}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <SecondaryButton onClick={back} disabled={step === 0}>
              <ArrowLeft className="h-4 w-4" />
              {t.back}
            </SecondaryButton>

            {step < TOTAL_STEPS - 1 ? (
              <PrimaryButton onClick={next} disabled={!stepValid}>
                {t.next}
                <ArrowRight className="h-4 w-4" />
              </PrimaryButton>
            ) : (
              <PrimaryButton onClick={finish} disabled={!canFinish(form) || submitting}>
                {submitting ? t.installing : t.finish}
                {!submitting ? <ArrowRight className="h-4 w-4" /> : null}
              </PrimaryButton>
            )}
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">© {COMPANY.copyrightYear} {COMPANY.legalName}. {DEMO.notice}</p>
      </div>
    </main>
  );
}

function StepLanguage({
  form,
  t,
  onSelect
}: {
  form: InstallState;
  t: (typeof copy)[Language];
  onSelect: (value: Language) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-ink">{t.language}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {languages.map((item) => (
          <OptionCard
            key={item.id}
            active={form.language === item.id}
            flag={item.flag}
            label={item.label}
            onClick={() => onSelect(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

function StepBusiness({
  form,
  t,
  onBusiness
}: {
  form: InstallState;
  t: (typeof copy)[Language];
  onBusiness: <K extends keyof InstallState>(key: K, value: InstallState[K]) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-ink">{t.businessType}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {businessTypes.map((item) => (
          <OptionCard
            key={item.id}
            active={form.businessType === item.id}
            icon={item.id === "restaurant" ? <Store className="h-5 w-5" /> : <Coffee className="h-5 w-5" />}
            label={t[item.labelKey]}
            onClick={() => onBusiness("businessType", item.id)}
          />
        ))}
      </div>
    </div>
  );
}

function StepCredentials({
  form,
  t,
  onChange
}: {
  form: InstallState;
  t: (typeof copy)[Language];
  onChange: <K extends keyof InstallState>(key: K, value: InstallState[K]) => void;
}) {
  return (
    <div className="grid gap-5">
      <Field label={t.restaurantName} htmlFor="restaurantName">
        <TextInput
          id="restaurantName"
          value={form.restaurantName}
          placeholder={t.restaurantName}
          onChange={(value) => onChange("restaurantName", value)}
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.adminUser} htmlFor="username">
          <TextInput id="username" value={form.username} placeholder={t.adminUser} onChange={(value) => onChange("username", value)} />
        </Field>
        <Field label={t.password} hint={t.passwordHint} htmlFor="password">
          <TextInput
            id="password"
            type="password"
            value={form.password}
            placeholder={t.password}
            onChange={(value) => onChange("password", value)}
          />
        </Field>
      </div>
    </div>
  );
}

function StepProvider({
  form,
  t,
  providerConfigured,
  onSelect
}: {
  form: InstallState;
  t: (typeof copy)[Language];
  providerConfigured: boolean;
  onSelect: (value: DataProvider) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-ink">{t.provider}</p>
      <div className="grid gap-3">
        {providers.map((item) => {
          const configured = isProviderConfigured(item.id);
          return (
            <OptionCard
              key={item.id}
              active={form.provider === item.id}
              icon={item.id === "local" ? <HardDrive className="h-5 w-5" /> : <Database className="h-5 w-5" />}
              label={item.label}
              description={configured ? t.providerReady : t.providerMissing}
              badge={configured ? "ready" : "missing"}
              onClick={() => onSelect(item.id)}
            />
          );
        })}
      </div>
      <div className={clsx("mt-5 flex items-center gap-3 rounded-xl p-4", providerConfigured ? "bg-emerald-50" : "bg-slate-100")}>
        <Database className={clsx("h-5 w-5 shrink-0", providerConfigured ? "text-emerald-600" : "text-warn")} />
        <p className="text-sm font-semibold text-ink">
          {form.provider} · {providerConfigured ? t.ready : t.missing}
        </p>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-100 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 truncate text-sm font-bold">{value}</p>
    </div>
  );
}
