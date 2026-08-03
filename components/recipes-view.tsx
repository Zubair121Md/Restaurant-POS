"use client";

import { useState } from "react";
import { useBranchData } from "@/components/app-provider";
import { Field, PrimaryButton, SecondaryButton, TextInput } from "@/components/ui";
import { calculateRecipeCost, createId, formatMoney, upsertRecipe } from "@/lib/store";

type DraftLine = { ingredientId: string; qty: string; wastePercent: string };

export function RecipesView() {
  const { store, menu, recipes, ingredients, refresh } = useBranchData();
  const [menuItemId, setMenuItemId] = useState("");
  const [yieldPortions, setYieldPortions] = useState("1");
  const [lines, setLines] = useState<DraftLine[]>([]);

  if (!store) return <p className="text-slate-500">Loading recipes…</p>;
  const selectedMenuId = menuItemId || menu[0]?.id || "";
  const currency = store.settings.currency;

  function addLine() {
    if (!ingredients[0]) return;
    setLines((current) => [...current, { ingredientId: ingredients[0].id, qty: "1", wastePercent: "0" }]);
  }

  function save() {
    if (!selectedMenuId || !lines.length) return;
    const existing = recipes.find((recipe) => recipe.menuItemId === selectedMenuId);
    upsertRecipe({
      id: existing?.id ?? createId("recipe"),
      menuItemId: selectedMenuId,
      yieldPortions: Math.max(1, Number(yieldPortions) || 1),
      ingredients: lines.map((line) => ({
        ingredientId: line.ingredientId,
        qty: Math.max(0, Number(line.qty) || 0),
        wastePercent: Math.max(0, Number(line.wastePercent) || 0)
      }))
    });
    setLines([]);
    refresh();
  }

  return (
    <div className="space-y-8">
      <header><p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Cost control</p><h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">Recipes</h2><p className="mt-2 text-slate-600">Connect ingredients to menu prices and monitor food cost.</p></header>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <h3 className="font-display text-2xl font-semibold">Recipe editor</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Field label="Menu item"><select value={selectedMenuId} onChange={(event) => setMenuItemId(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium">{menu.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
          <Field label="Yield portions"><TextInput type="number" value={yieldPortions} onChange={setYieldPortions} /></Field>
          <div className="flex items-end"><SecondaryButton onClick={addLine}>Add ingredient line</SecondaryButton></div>
        </div>
        <div className="mt-4 space-y-3">
          {lines.map((line, index) => (
            <div key={index} className="grid gap-3 rounded-xl bg-slate-50 p-3 md:grid-cols-[2fr_1fr_1fr_auto]">
              <select value={line.ingredientId} onChange={(event) => setLines((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ingredientId: event.target.value } : item))} className="rounded-xl border border-slate-200 bg-white px-3 py-2">{ingredients.map((ingredient) => <option key={ingredient.id} value={ingredient.id}>{ingredient.name} ({ingredient.unit})</option>)}</select>
              <TextInput type="number" value={line.qty} onChange={(value) => setLines((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, qty: value } : item))} placeholder="Qty" />
              <TextInput type="number" value={line.wastePercent} onChange={(value) => setLines((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, wastePercent: value } : item))} placeholder="Waste %" />
              <SecondaryButton onClick={() => setLines((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remove</SecondaryButton>
            </div>
          ))}
        </div>
        <PrimaryButton className="mt-4" onClick={save} disabled={!lines.length}>Save recipe</PrimaryButton>
      </section>
      <div className="space-y-4">
        {recipes.map((recipe) => {
          const item = menu.find((entry) => entry.id === recipe.menuItemId);
          const cost = calculateRecipeCost(recipe.id);
          const foodCost = item?.price ? cost / item.price * 100 : 0;
          return <section key={recipe.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-lg font-semibold">{item?.name ?? "Unknown menu item"}</h3><p className="text-sm text-slate-500">{recipe.yieldPortions} portion yield</p></div><div className="text-right"><p className="font-semibold">{formatMoney(cost, currency)} / portion</p><p className={foodCost > 35 ? "text-sm font-semibold text-red-600" : "text-sm font-semibold text-accent"}>{foodCost.toFixed(1)}% food cost</p></div></div>
            <div className="mt-4 divide-y divide-slate-100">{recipe.ingredients.map((line) => { const ingredient = store.ingredients.find((entry) => entry.id === line.ingredientId); const lineCost = (ingredient?.costPerUnit ?? 0) * line.qty * (1 + line.wastePercent / 100); return <div key={line.ingredientId} className="grid grid-cols-4 py-2 text-sm"><span className="col-span-1 font-medium">{ingredient?.name ?? "Missing"}</span><span>{line.qty} {ingredient?.unit}</span><span>{line.wastePercent}% waste</span><span className="text-right">{formatMoney(lineCost, currency)}</span></div>; })}</div>
          </section>;
        })}
      </div>
    </div>
  );
}
