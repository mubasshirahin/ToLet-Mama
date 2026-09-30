import { useState } from "react";
import { Calculator } from "lucide-react";

const fields = [["monthly", "Monthly rent"], ["advance", "Advance or deposit"], ["service", "Monthly service charge"], ["utilities", "Monthly utilities"], ["months", "Months to budget"]];
const inputClass = "w-full rounded-xl border bg-transparent px-3 py-2 text-sm";

export default function RentCalculatorPage() {
  const [cost, setCost] = useState({ monthly: 0, advance: 0, service: 0, utilities: 0, months: 1 });
  const monthly = cost.monthly + cost.service + cost.utilities;
  const moveIn = monthly + cost.advance;
  const period = cost.advance + cost.months * monthly;
  return <main className="mx-auto max-w-4xl space-y-6 p-5 md:p-8" style={{ color: "var(--theme-ink)" }}>
    <header><p className="text-xs font-bold uppercase tracking-widest opacity-60">To-Let Mama</p><h1 className="mt-2 font-serif text-3xl font-black">Rent budget calculator</h1><p className="mt-2 opacity-70">Plan move-in costs and ongoing rent before arranging a viewing.</p></header>
    <section className="glass-pane space-y-5 rounded-2xl border p-6" style={{ borderColor: "var(--theme-border)" }}><h2 className="flex items-center gap-2 font-serif text-xl font-bold"><Calculator/> Monthly costs</h2><div className="grid gap-4 sm:grid-cols-2">{fields.map(([key, label]) => <label key={key} className="space-y-1 text-sm">{label}{key === "months" && <span className="opacity-60"> (including move-in month)</span>}<input className={inputClass} style={{ borderColor: "var(--theme-border)", color: "var(--theme-ink)" }} type="number" min={key === "months" ? "1" : "0"} value={cost[key]} onChange={(event) => setCost({ ...cost, [key]: Math.max(key === "months" ? 1 : 0, Number(event.target.value) || 0) })}/></label>)}</div><p className="text-xs opacity-60">Estimates only. Actual advance, deposits, and service charges depend on the agreement.</p>
      <div aria-live="polite" className="space-y-3 rounded-xl bg-[var(--theme-surface)] p-4"><p>Move-in estimate <strong className="float-right">৳{moveIn.toLocaleString()}</strong></p><p>Monthly total after move-in <strong className="float-right">৳{monthly.toLocaleString()}</strong></p><p>Budget for {cost.months} month{cost.months === 1 ? "" : "s"} <strong className="float-right">৳{period.toLocaleString()}</strong></p></div>
    </section>
  </main>;
}
