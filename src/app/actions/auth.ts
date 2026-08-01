"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  checkPin,
  createSessionCookieValue,
  COOKIE_NAME,
  SESSION_DURATION_MS,
} from "@/lib/auth";

export async function login(formData: FormData) {
  const pin = String(formData.get("pin") ?? "");

  if (!pin || !checkPin(pin)) {
    redirect("/login?error=1");
  }

  const store = await cookies();
  store.set(COOKIE_NAME, createSessionCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: Math.floor(SESSION_DURATION_MS / 1000),
    path: "/",
  });

  redirect("/");
}

export async function logout() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
  redirect("/login");
}
