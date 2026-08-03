"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChefHat } from "lucide-react";
import { Field, PrimaryButton, TextInput } from "@/components/ui";
import { authenticate, getSession, isInstalled, loadStore } from "@/lib/store";
import { COMPANY, DEMO } from "@/lib/brand";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [venue, setVenue] = useState<string>(DEMO.restaurantName);

  useEffect(() => {
    if (!isInstalled()) {
      router.replace("/setup");
      return;
    }
    if (getSession()) {
      router.replace("/dashboard");
      return;
    }
    const store = loadStore();
    if (store) {
      setVenue(store.install.restaurantName);
      setUsername(store.install.username);
    }
  }, [router]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const user = authenticate(username, password);
    if (!user) {
      setError("Invalid credentials. Use your setup admin username and a password with 6+ characters.");
      return;
    }
    router.replace("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.18),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.08),_transparent_35%)]" />
      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 shadow-soft"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-teal-200">
          <ChefHat className="h-6 w-6" />
        </span>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-accent">{COMPANY.legalName}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">{COMPANY.productName}</h1>
        <p className="mt-2 text-sm text-slate-600">{venue}</p>
        <p className="mt-1 text-xs text-slate-500">{DEMO.notice}</p>

        <div className="mt-8 grid gap-4">
          <Field label="Username" htmlFor="username">
            <TextInput id="username" value={username} onChange={setUsername} placeholder="Admin username" />
          </Field>
          <Field label="Password" htmlFor="password">
            <TextInput id="password" type="password" value={password} onChange={setPassword} placeholder="Password" />
          </Field>
        </div>

        {error ? <p className="mt-4 text-sm font-medium text-danger">{error}</p> : null}

        <PrimaryButton type="submit" className="mt-6 w-full py-3">
          Enter POS
        </PrimaryButton>
        <p className="mt-4 text-center text-xs text-slate-500">
          Demo: {DEMO.username} / {DEMO.password}
        </p>
      </form>
    </main>
  );
}
