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
import TransactionList from "@/app/components/TransactionList";
import type { TransactionDoc } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatEUR(amount: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

async function getDashboardData() {
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
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthlyIncome = docs
    .filter(d => d.amountEUR > 0 && new Date(d.createdAt) >= startOfMonth)
    .reduce((sum, d) => sum + d.amountEUR, 0);
  const monthlyExpenses = docs
    .filter(d => d.amountEUR < 0 && new Date(d.createdAt) >= startOfMonth)
    .reduce((sum, d) => sum + Math.abs(d.amountEUR), 0);

  return { transactions: docs, balance, monthlyIncome, monthlyExpenses };
}

export default async function HomePage() {
  const { transactions, balance, monthlyIncome, monthlyExpenses } = await getDashboardData();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <span className="text-2xl">🐣</span>
              </div>
              <h1 className="text-xl font-display font-bold tracking-tight hidden sm:block">
                Wallet compartida <span className="text-indigo-600 dark:text-indigo-400">Cucú</span>
              </h1>
              <h1 className="text-lg font-display font-bold tracking-tight sm:hidden">Cucú 🐣</h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <ThemeToggle />
              <form action={logout}>
                <button type="submit" className="flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 dark:text-rose-400 font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
                  <iconify-icon icon="lucide:log-out" className="text-lg" />
                  <span className="hidden sm:inline">Cerrar sesión</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 md:p-10 shadow-sm">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">Saldo disponible</p>
                <h2 className="text-5xl md:text-6xl font-display font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">
                  {formatEUR(balance)} <span className="text-3xl font-semibold opacity-80">EUR</span>
                </h2>
              </div>
              <div className="flex gap-4">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                    <iconify-icon icon="lucide:arrow-down-left" className="text-xl" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Ingresos mes</p>
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-200">+{formatEUR(monthlyIncome)}</p>
                  </div>
                </div>
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-600 flex items-center justify-center">
                    <iconify-icon icon="lucide:arrow-up-right" className="text-xl" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Gastos mes</p>
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-200">-{formatEUR(monthlyExpenses)}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-400/5 rounded-full blur-3xl" />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border-l-4 border-l-indigo-500 border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl flex items-center justify-center">
                <iconify-icon icon="lucide:user-plus" className="text-2xl" />
              </div>
              <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 text-xs font-bold rounded uppercase">MXN</span>
            </div>
            <h3 className="text-xl font-bold mb-1">Aporte de Carlos</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Añadir fondos en Pesos Mexicanos al fondo común.</p>
            <TransactionForm
              action={addContributionMXN}
              title="Aporte de Carlos"
              description="Dinero que Carlos agrega en pesos mexicanos (MXN) para sus citas."
              currencyLabel="MXN"
              accent="indigo"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border-l-4 border-l-sky-400 border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 text-sky-600 rounded-xl flex items-center justify-center">
                <iconify-icon icon="lucide:graduation-cap" className="text-2xl" />
              </div>
              <span className="px-2 py-1 bg-sky-50 dark:bg-sky-900/20 text-sky-600 text-xs font-bold rounded uppercase">EUR</span>
            </div>
            <h3 className="text-xl font-bold mb-1">Pago de estudiante</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Registro de mensualidades recibidas en Euros.</p>
            <TransactionForm
              action={addStudentPaymentEUR}
              title="Pago de estudiante"
              description="Dinero que llega en euros a la cuenta de Revolut."
              currencyLabel="EUR"
              accent="sky"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border-l-4 border-l-rose-500 border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-xl flex items-center justify-center">
                <iconify-icon icon="lucide:receipt" className="text-2xl" />
              </div>
              <span className="px-2 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 text-xs font-bold rounded uppercase">UAH</span>
            </div>
            <h3 className="text-xl font-bold mb-1">Gasto</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Registrar egreso rápido en Grivnas Ucranianas.</p>
            <TransactionForm
              action={addExpenseUAH}
              title="Gasto"
              description="Registra un gasto en grivnas (UAH); se descuenta del saldo."
              currencyLabel="UAH"
              accent="rose"
            />
          </div>
        </section>

        <TransactionList
          transactions={transactions}
          initialBalance={balance}
        />
      </main>

      <footer className="max-w-7xl mx-auto px-4 py-8 text-center text-slate-400 text-sm">
        <p>© 2024 Cucú Wallet 🐣 • Diseñado para finanzas compartidas inteligentes.</p>
      </footer>
    </div>
  );
}