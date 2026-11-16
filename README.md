# Stay-Go

Stay-Go is a full-stack accommodation booking platform for discovering stays, managing listings, saving wishlists, and completing bookings with online payments. It combines a **React (Vite) single-page frontend** with an **Express + MongoDB backend** that serves both JSON APIs and server-rendered views.

## Highlights

- **Stay discovery** — Search and browse listings with category filters, sorting, pagination, guest count, and date-based availability filtering.
- **Rich listing details** — Photos/gallery, amenities, capacity, location context, pricing, and guest reviews.
- **User accounts** — Signup, login, logout, and session-based authentication (Passport + MongoDB session store).
- **Wishlist** — Save and remove favorite listings per user.
- **Bookings & payments** — Availability checks, booking holds, Razorpay order creation/signature verification, and booking history.
- **Pricing transparency** — Server-side price calculation including base stay, service fee, and tax breakdown.
- **Listing management** — Create/edit/delete listings with image uploads (Cloudinary) and optional Mapbox geocoding.
- **Reviews** — Authenticated users can add and remove reviews on listings.
- **Operational utilities** — Seed/backfill scripts and periodic cleanup of expired pending bookings.

## Architecture & Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 8, Redux Toolkit / RTK Query, Axios, React Router, Tailwind CSS 4, Framer Motion, Leaflet |
| Backend | Node.js, Express 5, Mongoose/MongoDB, Passport (`passport-local-mongoose`), `express-session` + `connect-mongo`, Joi |
| Media & Maps | Cloudinary + Multer (uploads), Mapbox SDK (optional geocoding) |
| Payments | Razorpay (orders, checkout, signature verification) |
| Views | EJS / ejs-mate for server-rendered routes alongside `/api` endpoints |
| Quality | Node test runner, Supertest (backend), Oxlint (frontend) |

## Project Structure

```text
Stay-Go/
├── backend/                 # Express app, API/routes, models, controllers, views, scripts, tests
│   ├── app.js               # Server entry point (DB, middleware, routes, jobs, listen)
│   ├── controllers/         # Listings, payments, reviews, users
│   ├── models/              # Listing, Booking, Review, User schemas
│   ├── routes/              # Route definitions (API + view routes)
│   ├── views/               # EJS templates
│   ├── utils/               # Helpers (pricing, validation, response handling, etc.)
│   ├── init/                # Seed/backfill scripts
│   └── tests/               # Backend tests
├── frontend/                # React SPA
│   ├── src/
│   │   ├── components/      # UI, modals, booking/listing widgets
│   │   ├── pages/           # Page-level views
│   │   ├── redux/           # Store and RTK Query APIs
│   │   ├── services/        # API client and endpoint modules
│   │   ├── utils/           # Client helpers
│   │   └── tests/           # Frontend tests
│   └── vite.config.ts
├── AGENTS.md
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** 22.x recommended (backend `package.json` specifies `engines.node: 22.6.0`)
- **npm**
- **MongoDB** (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas))
- Accounts/keys as needed: [Cloudinary](https://cloudinary.com/) (uploads), [Razorpay](https://razorpay.com/) (payments), [Mapbox](https://www.mapbox.com/) (optional geocoding)

### 1. Clone and install dependencies

```bash
git clone <repository-url>
cd Stay-Go

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment variables

Create local env files from the provided templates (do not commit secrets):

```bash
# Backend: backend/.env
# Copy from backend/.env.example

# Frontend: frontend/.env
# Copy from frontend/.env.example
```

**Backend (`backend/.env`)**

| Variable | Required | Description |
| --- | --- | --- |
| `ATLASDB_URL` | Recommended | MongoDB connection string. Defaults to `mongodb://127.0.0.1:27017/staygo` if unset. |
| `PORT` | No | Server port (default `8080`). |
| `SECRET` | Recommended | Session/cookie secret. Use a strong value outside local development. |
| `CLOUDINARY_CLOUD_NAME` | For uploads | Cloudinary cloud name. |
| `CLOUDINARY_API_KEY` | For uploads | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | For uploads | Cloudinary API secret. |
| `RAZORPAY_KEY_ID` | For payments | Razorpay key ID (server-side). |
| `RAZORPAY_KEY_SECRET` | For payments | Razorpay key secret. |
| `MAP_TOKEN` | Optional | Mapbox token for listing geocoding. |

**Frontend (`frontend/.env`)**

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | No | Backend origin (default `http://localhost:8080`). The app calls `${VITE_API_BASE_URL}/api`. |
| `VITE_RAZORPAY_KEY_ID` | Optional | Razorpay checkout key fallback if not supplied by the API. |

> Notes: Backend allows common localhost origins for CORS with credentials. Legacy Cloudinary env names may be accepted for compatibility; prefer canonical `CLOUDINARY_*` keys.

### 3. Run the application locally

**Start backend** (from `backend/`):

```bash
node app.js
```

**Start frontend** (from `frontend/`):

```bash
npm run dev
```

- Backend: `http://localhost:8080` (or `PORT`)
- Frontend: `http://localhost:5173` (Vite default)
- Ensure the backend is running and `VITE_API_BASE_URL` points to it.

## Available Scripts

### Backend (`backend/`)

| Command | Description |
| --- | --- |
| `node app.js` | Start the Express server |
| `npm test` | Run backend tests (`node --test "tests/*.test.cjs"`) |
| `npm run backfill:capacity` | Backfill listing capacity data |
| `npm run backfill:bookings` | Backfill booking occupancy data |
| `npm run sass:watch` | Compile/watch SCSS to `public/css/style.css` |

### Frontend (`frontend/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and build for production (`tsc -b && vite build`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run Oxlint |
| `npm run test` | Run frontend tests |

## API Overview

The SPA consumes JSON endpoints under `/api` (parallel non-API routes also exist for EJS flows). Primary groups:

| Area | Endpoints (examples) |
| --- | --- |
| Auth / User | `/api/curr-user`, `/api/login`, `/api/signup`, `/api/logout`, `/api/wishlist`, `/api/wishlist/:listingId` |
| Listings | `/api/listings`, `/api/listings/:id`, `/api/listings/:id/availability` |
| Reviews | `/api/listings/:id/reviews`, `/api/listings/:id/reviews/:reviewId` |
| Payments / Bookings | `/api/payment/create-order`, `/api/payment/verify-signature`, `/api/payment/cancel-order`, `/api/payment/my-bookings` |

Refer to `backend/routes/*.js` and `frontend/src/services/endpoints.ts` for the authoritative route map.

## Development Notes

- **Session storage:** Sessions are persisted in MongoDB via `connect-mongo`.
- **Images:** Listing uploads are stored in Cloudinary when configured.
- **Geocoding:** Coordinates are enriched via Mapbox when `MAP_TOKEN` is provided.
- **Bookings:** Availability/hold logic is enforced server-side; expired pending bookings are cleaned up periodically by the running server.
- **Conventions:** See `AGENTS.md` for repository development and testing expectations.

## Troubleshooting

| Issue | What to check |
| --- | --- |
| Cannot connect to database | Verify `ATLASDB_URL` and MongoDB network/access settings. |
| CORS or login/session issues | Ensure frontend origin is allowed, requests use credentials, and production cookie/CORS settings match your domains and HTTPS setup. |
| Image upload fails | Confirm `CLOUDINARY_*` credentials and supported formats (`png`, `jpg`, `jpeg`). |
| Payment/checkout errors | Verify `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET`, frontend-backend connectivity, and order/signature flow. |
| Maps/geocoding missing | Set `MAP_TOKEN`; geocoding-dependent fields may be unavailable without it. |
| Booking availability/holds seem stale | Confirm the backend process is running (cleanup runs on an interval) and inspect booking/payment logs/data. |

## Additional Resources

- [Vite Documentation](https://vite.dev/)
- [Express Documentation](https://expressjs.com/)
- [MongoDB Atlas](https://www.mongodb.com/docs/atlas/)
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

## Deployment

> **Note:** Stay-Go is a Vite/React frontend with a separate Express + MongoDB backend (not a Next.js app). For a full production deployment, host the frontend and backend as separate services.

### Deploy on Vercel (Frontend)

The easiest way to deploy the Stay-Go frontend is with the [Vercel Platform](https://vercel.com/).

1. Push your repository to GitHub, GitLab, or Bitbucket and import it into Vercel.
2. Set **Root Directory** to `frontend`.
3. Configure project settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variables in Vercel Project Settings:
   - `VITE_API_BASE_URL` — URL of your deployed backend (e.g. `https://your-backend.example.com`)
   - `VITE_RAZORPAY_KEY_ID` — optional checkout key fallback (if not provided by API)
5. Add an SPA rewrite so client-side routes resolve correctly (serve `index.html` for non-file paths). Example `vercel.json` in `frontend/`:

   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

6. Deploy, then redeploy after any environment variable changes.

For more details, see the [Vercel documentation](https://vercel.com/docs) and [Vite on Vercel guide](https://vercel.com/docs/frameworks/frontend/vite).

### Backend Hosting (Required for full functionality)

Because the backend is a stateful Express server (sessions, database connections, background cleanup jobs), deploy it to a Node.js host that supports persistent processes (e.g. [Render](https://render.com/), [Railway](https://railway.app/), [Fly.io](https://fly.io/)):

- **Root Directory:** `backend`
- **Install:** `npm install`
- **Start:** `node app.js`
- **Environment:** `ATLASDB_URL`, `SECRET`, `PORT` (as required), `CLOUDINARY_*`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `MAP_TOKEN` (optional)
- **Production checklist:** use MongoDB Atlas, enable HTTPS, configure CORS for your Vercel domain, and set secure cookie/session behavior for cross-origin auth.
