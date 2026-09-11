# HypeXchange

**Buy and sell fictional shares of internet products.**

HypeXchange is an entertainment / social game: a fictional stock exchange for internet products, startups, SaaS tools, AI apps, and developer tools.

Users receive fictional **Internet Dollars (IXD)** and buy/sell fictional virtual shares of products like Cursor, Claude, Figma, Vercel, and Notion.

Prices exist only inside HypeXchange and move when players trade (constant-product AMM).

## Important disclaimers

- **NO real money**
- **NO crypto / NFTs / cash-out**
- **NO real equity or securities**
- **IXD has no monetary value**
- Virtual shares do **not** represent ownership or investment products

Domain: [hypexchange.space](https://hypexchange.space)

---

## Stack

| Layer | Technology |
| --- | --- |
| App | Next.js 16 (App Router) + TypeScript |
| UI | Tailwind CSS, Geist Sans / Mono, Lucide, Recharts |
| Auth | Auth.js (`next-auth` v5) with Resend email magic link |
| Database | MongoDB Atlas + Mongoose |
| Hosting | Vercel |

Architecture:

```
Browser → Vercel / Next.js → Server Actions & Route Handlers → MongoDB Atlas
```

---

## Local development

### 1. Clone & install

```bash
npm install
```

### 2. Environment variables

Copy the example file:

```bash
cp .env.example .env.local
```

Fill in:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/hypexchange?retryWrites=true&w=majority
AUTH_SECRET= # openssl rand -base64 32
AUTH_RESEND_KEY=re_xxxxxxxx
AUTH_EMAIL_FROM=HypeXchange <noreply@hypexchange.space>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. MongoDB Atlas setup

1. Create a [MongoDB Atlas](https://www.mongodb.com/atlas) account and project.
2. Create a cluster.
3. Create a database user (username + password).
4. Network Access: allow your IP for local dev, and `0.0.0.0/0` (or Vercel’s ranges) for production.
5. Click **Connect → Drivers** and copy the connection string into `MONGODB_URI`.
6. Prefer a dedicated database name in the URI path (`/hypexchange`).

Atlas **must** be a replica set (all modern Atlas clusters are) so multi-document **transactions** work for trading.

### 4. Seed the catalog

```bash
npm run seed
```

Optional development-only demo users/trades (clearly marked `isDemo: true`):

```bash
npm run seed:demo
```

Do **not** treat demo activity as real production volume.

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Authentication setup

HypeXchange uses **Resend email magic links only** (no Google/GitHub).

### Auth secret

```bash
openssl rand -base64 32
```

Put the value in `AUTH_SECRET` (local + Vercel).

### Resend

1. Create a [Resend](https://resend.com) account and API key.
2. Set `AUTH_RESEND_KEY=re_...`.
3. Set `AUTH_EMAIL_FROM` to a verified sender, e.g. `HypeXchange <noreply@hypexchange.space>`.
4. For local testing you can use Resend’s onboarding sender: `HypeXchange <onboarding@resend.dev>` (delivers only to your Resend account email until a domain is verified).

Users enter their email on `/auth/signin` → receive a one-time link → session is created via the MongoDB Auth.js adapter.

### New user grant

On first sign-in the app creates a `profiles` document with:

```text
cashBalance = 10,000 IXD
```

Users cannot update their own balance directly. Only trading RPCs can.

### Make a user admin

In MongoDB Atlas → Browse Collections → `profiles`:

```js
db.profiles.updateOne(
  { username: "your-username" },
  { $set: { role: "admin" } }
)
```

Then visit `/admin`.

---

## Trading algorithm (AMM)

Each product is a constant-product pool:

```text
x = cashReserve
y = shareReserve
k = x * y
```

Default listing reserves:

```text
cashReserve = 100,000 IXD
shareReserve = 10,000
starting price ≈ 10 IXD
```

### Buy

User spends IXD amount `A`:

```text
fee = A * 0.005
netSpend = A - fee
newX = x + netSpend
newY = k / newX
sharesReceived = y - newY
newPrice = newX / newY
```

### Sell

User sells `S` shares:

```text
newY = y + S
newX = k / newY
grossPayout = x - newX
fee = grossPayout * 0.005
netPayout = grossPayout - fee
newPrice = newX / newY
```

### Safety

Trades run in MongoDB **multi-document transactions** with retry on write conflicts:

1. Lock/load profile + product
2. Validate balances / ownership
3. Update cash, reserves, holdings
4. Insert `trades` + `priceHistory`
5. Commit (or abort entirely)

Endpoints:

- `POST /api/trade/buy` `{ productId, amount }`
- `POST /api/trade/sell` `{ productId, shares }`

The client never decides balances, prices, or shares received.

Numeric values use **Decimal.js** + MongoDB **Decimal128**.

**Hype Cap** (fictional UI metric only):

```text
Hype Cap = currentPrice × 1,000,000
```

---

## Adding / importing products

### Seed file

Edit `data/products.ts`, then:

```bash
npm run seed
```

### Admin UI

Sign in as admin → `/admin`:

- Create product
- Edit / verify / pause / delist
- Approve listing requests
- Bulk CSV import

CSV columns:

```text
name,ticker,domain,description,category,logo_url
```

API: `POST /api/admin/products/import`

### Community listings

Users can submit `/request-listing` when search misses a product. Admins approve into the live catalog.

---

## Deploy on Vercel

1. Push the repo to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add **Production** environment variables (copy from `.env.example` / your `.env.local`):

```env
MONGODB_URI=mongodb+srv://...
AUTH_SECRET=          # openssl rand -base64 32
AUTH_TRUST_HOST=true
AUTH_URL=https://hypexchange.space
NEXT_PUBLIC_APP_URL=https://hypexchange.space
AUTH_RESEND_KEY=re_...
AUTH_EMAIL_FROM=HypeXchange <noreply@hypexchange.space>
EMAIL_LOGO_URL=https://hypexchange.space/brand/logo-white-bg.png
```

4. Deploy.
5. Domains → add `hypexchange.space` (+ `www` if desired) and configure DNS as Vercel instructs.
6. Confirm Resend domain `hypexchange.space` stays **Verified**.
7. In Atlas → Network Access, allow `0.0.0.0/0` (or Vercel egress) so production can reach MongoDB.
8. Run seed once against the production `MONGODB_URI`:

```bash
MONGODB_URI="your-production-uri" npm run seed
```

For local development, use `http://localhost:3000` for `AUTH_URL` / `NEXT_PUBLIC_APP_URL` so magic links open on your machine.
---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Local Next.js server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run seed` | Upsert ~120+ product catalog |
| `npm run seed:demo` | Seed + demo users/trades (`isDemo`) |
| `npm run lint` | ESLint |

---

## Brand assets

Located in `public/`:

- `/brand/logo-white-bg.png`: primary header logo
- `/brand/logo.png`: alternate logo
- `/favicon.png` / `/icon.png`: app icon

Primary accent: `#240BCD`

---

## Legal routes

- `/terms`
- `/privacy`
- `/disclaimer`
