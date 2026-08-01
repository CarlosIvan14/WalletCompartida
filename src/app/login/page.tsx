import { login } from "@/app/actions/auth";
import ThemeToggle from "@/app/components/ThemeToggle";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const hasError = params?.error === "1";

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="absolute top-5 right-5">
        <ThemeToggle />
      </div>

      <form
        action={login}
        className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm"
      >
        <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-5 mx-auto">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
            <rect x="3" y="6" width="18" height="13" rx="2" />
            <path d="M3 10h18" />
            <circle cx="16" cy="14.5" r="1.2" fill="currentColor" stroke="none" />
          </svg>
        </div>

        <h1 className="text-lg font-medium mb-1 text-center text-slate-900 dark:text-white">
          Wallet compartida Cucú 🐣
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 text-center">
          Ingresa el PIN para ver el saldo
        </p>

        <input
          type="password"
          name="pin"
          inputMode="numeric"
          autoComplete="off"
          placeholder="PIN"
          required
          className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 text-center text-lg tracking-widest outline-none text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/20 transition-colors"
        />

        {hasError && (
          <p className="text-rose-500 text-sm mt-3 text-center">
            PIN incorrecto, intenta de nuevo.
          </p>
        )}

        <button
          type="submit"
          className="w-full mt-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors text-white font-medium py-3"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}
