"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/mongodb";
import { convertToEUR } from "@/lib/exchange";
import { isAuthenticated } from "@/lib/auth";
import type { TransactionDoc, TransactionType } from "@/lib/types";

async function requireAuth() {
  const ok = await isAuthenticated();
  if (!ok) {
    redirect("/login");
  }
}

async function addTransaction(params: {
  type: TransactionType;
  amountOriginal: number;
  currency: "MXN" | "EUR" | "UAH";
  sign: 1 | -1;
  note?: string;
}) {
  await requireAuth();

  const { type, amountOriginal, currency, sign, note } = params;

  if (!Number.isFinite(amountOriginal) || amountOriginal <= 0) {
    throw new Error("El monto debe ser un número mayor a cero.");
  }

  const { amountEUR, rate } = await convertToEUR(amountOriginal, currency);

  const doc: TransactionDoc = {
    type,
    amountOriginal,
    currency,
    rate,
    amountEUR: sign * amountEUR,
    note: note?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };

  const db = await getDb();
  await db.collection<TransactionDoc>("transactions").insertOne(doc);

  revalidatePath("/");
}

export async function addContribution(formData: FormData) {
  const amount = Number(formData.get("amount"));
  const currency = String(formData.get("currency") ?? "MXN");
  const note = String(formData.get("note") ?? "");
  await addTransaction({
    type: "contribution_mxn",
    amountOriginal: amount,
    currency: currency as "MXN" | "EUR" | "UAH",
    sign: 1,
    note,
  });
}

export async function addStudentPayment(formData: FormData) {
  const amount = Number(formData.get("amount"));
  const currency = String(formData.get("currency") ?? "EUR");
  const note = String(formData.get("note") ?? "");
  await addTransaction({
    type: "student_payment_eur",
    amountOriginal: amount,
    currency: currency as "MXN" | "EUR" | "UAH",
    sign: 1,
    note,
  });
}

export async function addExpense(formData: FormData) {
  const amount = Number(formData.get("amount"));
  const currency = String(formData.get("currency") ?? "UAH");
  const note = String(formData.get("note") ?? "");
  await addTransaction({
    type: "expense_uah",
    amountOriginal: amount,
    currency: currency as "MXN" | "EUR" | "UAH",
    sign: -1,
    note,
  });
}

export async function deleteTransaction(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id"));
  const { ObjectId } = await import("mongodb");
  const db = await getDb();
  await db.collection("transactions").deleteOne({ _id: new ObjectId(id) });
  revalidatePath("/");
}
