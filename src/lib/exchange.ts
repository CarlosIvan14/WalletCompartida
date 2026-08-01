// Tasas de cambio en vivo, base EUR, vía open.er-api.com (gratis, sin API key).
const RATES_URL = "https://open.er-api.com/v6/latest/EUR";

type RatesResponse = {
  result: string;
  rates: Record<string, number>;
};

let cache: { rates: Record<string, number>; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hora

async function getRates(): Promise<Record<string, number>> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.rates;
  }
  const res = await fetch(RATES_URL, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error("No se pudo obtener la tasa de cambio.");
  }
  const data = (await res.json()) as RatesResponse;
  if (data.result !== "success") {
    throw new Error("Respuesta inválida del proveedor de tasas de cambio.");
  }
  cache = { rates: data.rates, fetchedAt: Date.now() };
  return data.rates;
}

// Convierte un monto de `currency` a EUR. Las tasas vienen como "1 EUR = X currency".
export async function convertToEUR(
  amount: number,
  currency: string
): Promise<{ amountEUR: number; rate: number }> {
  if (currency === "EUR") {
    return { amountEUR: amount, rate: 1 };
  }
  const rates = await getRates();
  const rate = rates[currency];
  if (!rate) {
    throw new Error(`No hay tasa de cambio disponible para ${currency}.`);
  }
  const amountEUR = amount / rate;
  return { amountEUR, rate };
}
