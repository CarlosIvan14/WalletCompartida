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
  contribution_mxn: "Aporte de Carlos (MXN)",
  student_payment_eur: "Pago de estudiante (EUR)",
  expense_uah: "Gasto (UAH)",
};
