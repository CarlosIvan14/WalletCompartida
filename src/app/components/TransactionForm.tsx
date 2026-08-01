"use client";

import { useRef, useState, useTransition } from "react";

export default function TransactionForm({
  action,
  title,
  description,
  currencyLabel,
  accent,
}: {
  action: (formData: FormData) => Promise<void>;
  title: string;
  description: string;
  currencyLabel: string;
  accent: "indigo" | "sky" | "rose";
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const buttonColors: Record<string, string> = {
    indigo: "bg-indigo-600 hover:bg-indigo-500 text-white",
    sky: "bg-sky-600 hover:bg-sky-500 text-white",
    rose: "bg-rose-600 hover:bg-rose-500 text-white",
  };

  const iconBg: Record<string, string> = {
    indigo: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500",
    sky: "bg-sky-50 dark:bg-sky-500/10 text-sky-500",
    rose: "bg-rose-50 dark:bg-rose-500/10 text-rose-500",
  };

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    const amount = Number(formData.get("amount"));
    if (!amount || amount <= 0) {
      setError("Escribe un monto válido mayor a cero.");
      return;
    }
    startTransition(async () => {
      try {
        await action(formData);
        formRef.current?.reset();
        setSuccess(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ocurrió un error.");
      }
    });
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${iconBg[accent]}`}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </div>
      <h3 className="font-medium text-sm text-slate-900 dark:text-white">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-xs mb-3">{description}</p>
      <form ref={formRef} action={handleSubmit} className="space-y-2">
        <input
          type="number"
          name="amount"
          step="0.01"
          min="0.01"
          placeholder={`Monto en ${currencyLabel}`}
          required
          className="w-full rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm outline-none text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-400 transition-colors"
        />
        <input
          type="text"
          name="note"
          placeholder="Nota (opcional)"
          className="w-full rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm outline-none text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-400 transition-colors"
        />
        <button
          type="submit"
          disabled={isPending}
          className={`w-full rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-60 ${buttonColors[accent]}`}
        >
          {isPending ? "Guardando..." : "Agregar"}
        </button>
        {error && <p className="text-rose-500 text-xs">{error}</p>}
        {success && !error && (
          <p className="text-indigo-500 text-xs">Movimiento guardado.</p>
        )}
      </form>
    </div>
  );
}
