"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const accentConfig: Record<string, { button: string; iconBg: string; focusRing: string; shadow: string }> = {
  indigo: {
    button: "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20",
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
    focusRing: "focus:ring-2 focus:ring-indigo-500",
    shadow: "shadow-indigo-600/20",
  },
  sky: {
    button: "bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-500/20",
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
    focusRing: "focus:ring-2 focus:ring-sky-500",
    shadow: "shadow-sky-500/20",
  },
  rose: {
    button: "bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20",
    iconBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
    focusRing: "focus:ring-2 focus:ring-rose-500",
    shadow: "shadow-rose-500/20",
  },
};

const currencySymbols: Record<string, string> = {
  MXN: "$",
  EUR: "€",
  UAH: "₴",
};

const currencyNames: Record<string, string> = {
  MXN: "MXN - Peso Mexicano",
  EUR: "EUR - Euro",
  UAH: "UAH - Grivna Ucraniana",
};

export default function TransactionForm({
  action,
  title,
  description,
  defaultCurrency,
  availableCurrencies,
  accent,
}: {
  action: (formData: FormData) => Promise<void>;
  title: string;
  description: string;
  defaultCurrency: string;
  availableCurrencies: string[];
  accent: "indigo" | "sky" | "rose";
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrency);

  const config = accentConfig[accent];
  const currencySymbol = currencySymbols[selectedCurrency] || selectedCurrency;

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
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ocurrió un error.");
      }
    });
  }

  function handleCurrencyChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedCurrency(e.target.value);
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      <div className="relative">
        <select
          name="currency"
          value={selectedCurrency}
          onChange={handleCurrencyChange}
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none transition-all text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
        >
          {availableCurrencies.map((curr) => (
            <option key={curr} value={curr}>
              {currencyNames[curr] || curr}
            </option>
          ))}
        </select>
      </div>
      <div className="relative">
        <input
          type="number"
          name="amount"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          required
          className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none transition-all pr-12 text-slate-900 dark:text-white placeholder:text-slate-400 ${config.focusRing}`}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currencySymbol}</span>
      </div>
      <input
        type="text"
        name="note"
        placeholder="Nota (opcional)"
        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
      />
      <button
        type="submit"
        disabled={isPending}
        className={`w-full py-3 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${config.button} ${isPending ? "opacity-70 cursor-wait" : ""}`}
      >
        {isPending ? "Guardando..." : accent === "indigo" ? "Confirmar Aporte" : accent === "sky" ? "Registrar Pago" : "Registrar Gasto"}
      </button>
      {error && <p className="text-rose-500 text-sm text-center">{error}</p>}
      {success && !error && (
        <p className="text-emerald-500 text-sm text-center">Movimiento guardado.</p>
      )}
    </form>
  );
}