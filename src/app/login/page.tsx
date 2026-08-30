"use client";

import { useState, useEffect } from "react";
import { login } from "@/app/actions/auth";
import ThemeToggle from "@/app/components/ThemeToggle";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [hasError, setHasError] = useState(false);
  const [pin, setPin] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    searchParams.then((params) => {
      if (params?.error === "1") {
        setHasError(true);
        setShake(true);
        setTimeout(() => setShake(false), 400);
      }
    });
  }, [searchParams]);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setPin(value);
    setIsButtonDisabled(value.length !== 4);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length === 4) {
      const formData = new FormData();
      formData.append("pin", pin);
      await login(formData);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative transition-colors duration-500">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] dark:bg-indigo-900/20" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] dark:bg-indigo-900/20" />
      </div>

      <div className="absolute top-8 right-8 z-50">
        <ThemeToggle />
      </div>

      <div
        id="login-card"
        className={`w-full max-w-[440px] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-slate-800 p-8 md:p-12 z-10 relative ${shake ? "animate-shake" : ""}`}
      >
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950 rounded-3xl flex items-center justify-center mb-6 ring-8 ring-indigo-50/50 dark:ring-indigo-900/20">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 dark:text-indigo-400">
              <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2Z" />
              <path d="M7 9h10" />
              <path d="M7 14h10" />
              <path d="M12 4v4" />
              <path d="M16 21H8a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2Z" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
            Wallet compartida Cucú 🐣
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg">
            Ingresa el PIN para ver el saldo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <div className="relative group">
              <input
                type="password"
                id="pin-field"
                maxLength={4}
                inputMode="numeric"
                placeholder="••••"
                value={pin}
                onChange={handlePinChange}
                className="pin-input w-full text-center text-4xl tracking-[0.75em] md:tracking-[1em] font-mono py-5 px-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-600 rounded-3xl text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 outline-none transition-all duration-200"
                autoComplete="off"
                required
              />
            </div>

            {hasError && (
              <div className="flex items-center justify-center gap-2 text-red-500 text-sm font-medium animate-fade-in">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>El PIN ingresado es incorrecto</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isButtonDisabled}
            className={`w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all duration-200 active:scale-[0.98] ${isButtonDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Entrar
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4 text-center">
          <a href="#" className="text-slate-400 dark:text-slate-500 text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            ¿Olvidaste tu PIN?
          </a>
        </div>
      </div>

      <p className="mt-8 text-slate-400 dark:text-slate-600 text-xs tracking-widest uppercase font-semibold">
        v2.4.0 — Secure Core
      </p>

      <style jsx>{`
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        .pin-input::-webkit-outer-spin-button,
        .pin-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </main>
  );
}