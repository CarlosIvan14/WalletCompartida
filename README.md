# Wallet compartida (Carlos + novia)

Web app simple para llevar el control del saldo en euros de la cuenta de
Revolut: tú registras lo que aportas en pesos mexicanos, se registran los
pagos de la estudiante en euros, y ella registra sus gastos en grivnas
(UAH). El saldo total en EUR se actualiza solo, con conversión de moneda
en vivo (gratis, sin API key).

## Cómo funciona

- Login con un PIN compartido (una sola contraseña para los dos).
- 3 botones para agregar movimientos:
  1. **Aporte de Carlos (MXN)** — se convierte a EUR con la tasa del día y se suma.
  2. **Pago de estudiante (EUR)** — se suma directo, sin conversión.
  3. **Gasto (UAH)** — se convierte a EUR con la tasa del día y se resta.
- El saldo y el historial de movimientos se ven en la pantalla principal,
  accesibles desde el celular de cualquiera de los dos con el mismo PIN.
- Las tasas de cambio vienen de `open.er-api.com` (gratis, se actualizan
  a diario).

**Importante:** el PIN es una protección simple, no es un login bancario
de verdad. No conecta con Revolut ni mueve dinero real — es solo una
libreta de control manual que ustedes actualizan a mano.

## 1. Crear la base de datos gratis (MongoDB Atlas)

1. Ve a https://www.mongodb.com/cloud/atlas/register y crea una cuenta gratis.
2. Crea un cluster **M0 (Free)** — elige cualquier proveedor/región cercana.
3. En **Database Access**, crea un usuario y contraseña (guárdalos).
4. En **Network Access**, agrega `0.0.0.0/0` (permitir acceso desde
   cualquier IP) — Vercel usa IPs dinámicas, así que es necesario.
5. En **Database > Connect > Drivers**, copia la cadena de conexión, se
   ve así:
   ```
   mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Agrégale el nombre de la base al final (antes del `?`), por ejemplo
   `.../wallet-tracker?retryWrites=true...`. No hace falta crear la
   colección a mano: se crea sola con el primer movimiento que agreguen.

## 2. Subir el proyecto a GitHub

```bash
cd wallet-tracker
git init
git add .
git commit -m "wallet tracker"
gh repo create wallet-tracker --private --source=. --push
# o crea el repo manualmente en github.com y luego:
# git remote add origin https://github.com/TU_USUARIO/wallet-tracker.git
# git push -u origin main
```

## 3. Deploy en Vercel

1. Ve a https://vercel.com, inicia sesión con GitHub.
2. **Add New Project** → importa el repo `wallet-tracker`.
3. En **Environment Variables**, agrega:

   | Nombre | Valor |
   |---|---|
   | `MONGODB_URI` | la cadena de conexión de Atlas (paso 1) |
   | `APP_PIN` | el PIN que van a usar los dos para entrar |
   | `AUTH_SECRET` | una cadena aleatoria larga (genera una con `openssl rand -hex 32`) |

4. Click **Deploy**. En un par de minutos Vercel te da una URL tipo
   `https://wallet-tracker-xxx.vercel.app` — esa es la que abren desde el
   celular.

## Desarrollo local (opcional)

```bash
npm install
cp .env.example .env.local   # y rellena los valores reales
npm run dev
```

Abre http://localhost:3000

## Estructura

- `src/app/page.tsx` — pantalla principal (saldo + historial + botones).
- `src/app/login/page.tsx` — pantalla de PIN.
- `src/app/actions/` — server actions (agregar movimiento, login, logout).
- `src/lib/mongodb.ts` — conexión a MongoDB (lazy, solo se conecta cuando
  se necesita).
- `src/lib/exchange.ts` — conversión de divisas en vivo (EUR base).
- `src/lib/auth.ts` — cookie de sesión firmada con el PIN compartido.
