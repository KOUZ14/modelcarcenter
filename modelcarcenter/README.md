## ModelCarCenter Frontend

Next.js App Router experience for managing ModelCarCenter accounts, inventory, marketplace search, and Stripe-only payments.

### Prerequisites

- Node.js 18+
- npm 9+ (pnpm 9+ recommended)
- Backend service exposing the endpoints documented below

### Environment Variables

Create `.env.local` from the template below:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_123456 # optional UI display only
```

Restart the dev server after updating env vars so the client bundle picks up changes.

### Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Create a production bundle |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint (next/core-web-vitals + prettier) |
| `npm run test` | Execute Jest + Testing Library unit tests |
| `npm run type-check` | Validate TypeScript definitions |

pnpm equivalents:

```bash
pnpm install
pnpm dev
pnpm test
```

### Backend Contract

- `POST /accounts`
- `GET /accounts`
- `GET /accounts/:id?include_listings=true`
- `POST /accounts/:id/listings`
- `GET /accounts/:id/listings`
- `PATCH /accounts/:id/listings/:listing_id`
- `DELETE /accounts/:id/listings/:listing_id`
- `GET /search?q=<query>` (eBay proxy)
- `POST /payments` (Stripe provider only)
- `GET /payments/:id`
- `POST /payments/webhooks/stripe` (handled server side)

### Architecture

- `src/app` — App Router pages, layouts, providers, and route handlers
- `src/api` — Thin fetch wrappers per backend resource with retry on 429
- `src/components` — Tailwind-styled UI building blocks (forms, dialogs, grids, toasts)
- `src/hooks` — Reusable client hooks (`useToast`, `useDebouncedValue`)
- `src/store` — Zustand slices for account selection, cart, and toast queue
- `src/types` — Shared TypeScript contracts for accounts, listings, payments, and errors
- `src/lib/api-client.ts` — Centralized fetch helper honoring env base URL, JSON parsing, and retry logic

### Feature Highlights

- **Dashboard (`/`)** — Create collector/shop accounts, view account stats, manage listings with optimistic CRUD, and stage a cart snapshot.
- **Search (`/search`)** — Debounced (500 ms) marketplace search with skeleton loaders and add-to-cart shortcuts.
- **Payments (`/payments`)** — Launch Stripe intents, stream status via polling, and surface client secrets alongside test card instructions.
- **Account Detail (`/accounts/[id]`)** — Inventory analytics (total value, avg price, top listing) with inline modal editing and tabular listings.
- **Design system** — Responsive dark-mode-first shell, cards, buttons, modals, focus rings, and toast notifications.

### Testing

Jest + Testing Library with SWC (`next/jest`). Tests live in `src/__tests__` and cover form validation, optimistic listing flows, payment error handling, and API client edge cases.

```bash
npm run test
```

### Stripe Test Flow

1. Ensure your backend has Stripe test credentials configured.
2. From `/payments`, open **New payment intent** and provide the amount in smallest currency units (e.g. `1999` for $19.99).
3. Optionally attach an Account ID and metadata JSON; submit to create the intent.
4. Copy the surfaced `client_secret` or use Stripe dashboard; test with standard card `4242 4242 4242 4242` (exp `04/42`, CVC `424`).
5. The status card polls `/payments/:id` until the intent reaches a terminal state.

### Linting & Formatting

- ESLint: `npm run lint`
- Prettier: `npx prettier --check "src/**/*.{ts,tsx}"`
- Tailwind config: `tailwind.config.mjs`, PostCSS via `postcss.config.mjs`

### TypeScript

Strict TS configuration with baseUrl/paths (`@/*`) and `npm run type-check` guard before deploys.

### Deployment Notes

- Build with `npm run build`
- Run with `npm run start`
- Ensure `NEXT_PUBLIC_API_BASE_URL` points to the production backend and the backend handles Stripe webhooks (`POST /payments/webhooks/stripe`).
