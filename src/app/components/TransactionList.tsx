"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteTransaction } from "@/app/actions/transactions";
import { formatEUR, formatOriginal } from "@/lib/utils";
import { TYPE_LABELS, TYPE_ICONS, TYPE_COLORS } from "@/lib/types";
import type { TransactionDoc } from "@/lib/types";

interface TransactionListProps {
  transactions: TransactionDoc[];
  initialBalance: number;
}

function TransactionRow({ transaction, onDelete }: { transaction: TransactionDoc; onDelete: (id: string) => void }) {
  const config = TYPE_COLORS[transaction.type];
  const icon = TYPE_ICONS[transaction.type];
  const label = TYPE_LABELS[transaction.type];
  const isPositive = transaction.amountEUR >= 0;

  return (
    <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors animate-slide-up">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center`}>
            <iconify-icon icon={icon} className={`text-xl ${config.color}`} />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">{label}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
          {formatOriginal(transaction.amountOriginal, transaction.currency)}
        </span>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          {new Date(transaction.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
        </p>
        {transaction.note && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{transaction.note}</p>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        <span className={`${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"} font-bold text-lg`}>
          {isPositive ? "+" : ""}{formatEUR(transaction.amountEUR)}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <button
          type="button"
          onClick={() => onDelete(transaction._id?.toString()!)}
          className="text-slate-400 hover:text-rose-500 transition-colors p-1"
          title="Eliminar"
          aria-label="Eliminar transacción"
        >
          <iconify-icon icon="lucide:trash-2" className="text-xl" />
        </button>
      </td>
    </tr>
  );
}

export default function TransactionList({ transactions: initialTransactions }: TransactionListProps) {
  const router = useRouter();
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isDeleting, startDeleteTransition] = useTransition();

  function handleDelete(id: string) {
    startDeleteTransition(async () => {
      const formData = new FormData();
      formData.append("id", id);
      await deleteTransaction(formData);
      router.refresh();
    });
  }

  return (
    <section className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-display font-bold">Transacciones recientes</h3>
        <button className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1">
          Ver todas
          <iconify-icon icon="lucide:chevron-right" className="text-lg" />
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Detalle</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Divisa Original</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Fecha y Nota</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Monto EUR</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-slate-400 dark:text-slate-500 text-sm">Todavía no hay movimientos registrados.</p>
                  </td>
                </tr>
              ) : (
                transactions.map((d) => (
                  <TransactionRow key={d._id?.toString()} transaction={d} onDelete={handleDelete} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slideUp 0.5s ease-out forwards; }
        @media (prefers-reduced-motion: reduce) {
          .animate-slide-up { animation: none; opacity: 1; transform: none; }
        }
      `}</style>
    </section>
  );
}