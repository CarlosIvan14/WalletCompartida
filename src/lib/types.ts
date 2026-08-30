export type TransactionType =
  | "contribution_mxn"
  | "student_payment_eur"
  | "expense_uah";

export interface TransactionDoc {
  _id?: string;
  type: TransactionType;
  amountOriginal: number;
  currency: "MXN" | "EUR" | "UAH";
  rate: number; // 1 EUR = `rate` unidades de `currency` (1 si currency es EUR)
  amountEUR: number; // positivo = ingreso, negativo = gasto
  note?: string;
  createdAt: string;
}

export const TYPE_LABELS: Record<TransactionType, string> = {
  contribution_mxn: "Aporte de Carlos",
  student_payment_eur: "Pago de estudiante",
  expense_uah: "Gasto",
};

export const TYPE_ICONS: Record<TransactionType, string> = {
  contribution_mxn: "lucide:plus-circle",
  student_payment_eur: "lucide:check-circle",
  expense_uah: "lucide:minus-circle",
};

export const TYPE_COLORS: Record<TransactionType, { bg: string; color: string }> = {
  contribution_mxn: { bg: "bg-emerald-100 dark:bg-emerald-900/30", color: "text-emerald-600 dark:text-emerald-400" },
  student_payment_eur: { bg: "bg-sky-100 dark:bg-sky-900/30", color: "text-sky-600 dark:text-sky-400" },
  expense_uah: { bg: "bg-rose-100 dark:bg-rose-900/30", color: "text-rose-600 dark:text-rose-400" },
};