import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { logout } from "@/app/actions/auth";
import {
  addContributionMXN,
  addStudentPaymentEUR,
  addExpenseUAH,
  deleteTransaction,
} from "@/app/actions/transactions";
import TransactionForm from "@/app/components/TransactionForm";
import ThemeToggle from "@/app/components/ThemeToggle";
import type { TransactionDoc } from "@/lib/types";
import { TYPE_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatEUR(amount: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function formatOriginal(amount: number, currency: string) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "UAH" ? 0 : 2,
  }).format(amount);
}

export default async function HomePage() {
  const authed = await isAuthenticated();
  if (!authed) {
    redirect("/login");
  }

  const db = await getDb();
  const docs = await db
    .collection<TransactionDoc>("transactions")
    .find({})
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  const balance = docs.reduce((sum, d) => sum + d.amountEUR, 0);

  return (
    <main className="min-h-screen p-5 sm:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium text-slate-900 dark:text-white">
          Wallet compartida Cucú 🐣
        </h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <form action={logout}>
            <button
              type="submit"
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6 text-center">
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">
          Saldo disponible
        </p>
        <p className="text-4xl font-medium text-indigo-600 dark:text-indigo-400">
          {formatEUR(balance)}
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <TransactionForm
          action={addContributionMXN}
          title="Aporte de Carlos"
          description="Dinero que Carlos agrega en pesos mexicanos (MXN) para sus citas."
          currencyLabel="MXN"
          accent="indigo"
        />
        <TransactionForm
          action={addStudentPaymentEUR}
          title="Pago de estudiante"
          description="Dinero que llega en euros a la cuenta de Revolut."
          currencyLabel="EUR"
          accent="sky"
        />
        <TransactionForm
          action={addExpenseUAH}
          title="Gasto"
          description="Registra un gasto en grivnas (UAH); se descuenta del saldo."
          currencyLabel="UAH"
          accent="rose"
        />
      </div>

      <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
        Movimientos recientes
      </h2>
      <div className="space-y-2">
        {docs.length === 0 && (
          <p className="text-slate-400 dark:text-slate-500 text-sm">
            Todavía no hay movimientos registrados.
          </p>
        )}
        {docs.map((d) => (
          <div
            key={d._id?.toString()}
            className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3"
          >
            <div>
              <p className="text-sm text-slate-900 dark:text-white">
                {TYPE_LABELS[d.type]}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {formatOriginal(d.amountOriginal, d.currency)} ·{" "}
                {new Date(d.createdAt).toLocaleString("es-ES")}
                {d.note ? ` · ${d.note}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={
                  d.amountEUR >= 0
                    ? "text-indigo-600 dark:text-indigo-400 text-sm font-medium"
                    : "text-rose-500 text-sm font-medium"
                }
              >
                {d.amountEUR >= 0 ? "+" : ""}
                {formatEUR(d.amountEUR)}
              </span>
              <form action={deleteTransaction}>
                <input type="hidden" name="id" value={d._id?.toString()} />
                <button
                  type="submit"
                  className="text-slate-300 dark:text-slate-600 hover:text-rose-500 text-xs"
                  title="Eliminar"
                >
                  ✕
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
