# The Nightly Table — Restaurant Reservation Management System

Vercel : https://restaurant-reservation-system-six-self.vercel.app
Render : https://restaurant-reservation-system-avk6.onrender.com

A full-stack reservation system for a single restaurant: customers sign up and book tables
themselves; a restaurant admin oversees every reservation and the table inventory. Built with
React (Vite + Tailwind), Node.js/Express, MongoDB, and JWT authentication.

This started from a take-home assignment brief, but is built as a real, deployable product —
production-minded structure, real validation, a real double-booking guard at the database level,
and a responsive UI usable on desktop and mobile.

---

## 1. Demo admin account

There is **no public admin signup form** — by design, the only way an admin account is created is
via the backend seed script, run once by whoever owns the deployment (you). Run it against your
own database and you'll get:

```
node backend/seed/seed.js       # or: npm run seed  (from backend/)
```

It reads these from `backend/.env` (see `.env.example`):

```
ADMIN_EMAIL=admin@thenightlytable.com
ADMIN_PASSWORD=Admin@12345
ADMIN_NAME=Restaurant Owner
```

**Before you deploy for real:** change `ADMIN_PASSWORD` (and ideally `ADMIN_EMAIL`) in your `.env`
to something only you know, *then* run the seed script. The values above are placeholders for
local development only — they are not a "real" credential, just what ships in this template.
If you ever run the seed script with the default values against a public deployment, log in
immediately afterwards and rotate the password, or edit the user document directly in MongoDB.

Customers can never become admins through the UI or the API — `POST /api/auth/signup` always
forces `role: 'customer'` server-side, and `POST /api/auth/admin/login` rejects any account that
isn't already `role: 'admin'`.

---

## 2. Project structure

```
restaurant-reservation-system/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── models/                   # User, Table, Reservation (Mongoose schemas)
│   ├── middleware/                # JWT auth, role guard, validation, error handler
│   ├── controllers/               # Business logic per resource
│   ├── routes/                    # Express routers
│   ├── seed/seed.js               # Creates the one admin account + starter tables
│   ├── app.js / server.js
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── pages/                 # Landing, About, Contact, Signup, Login, AdminLogin,
    │   │                          #   CustomerDashboard, AdminDashboard, NotFound
    │   ├── components/            # Navbar, Footer, Layout, ProtectedRoute, TicketStub, UI
    │   ├── context/AuthContext.jsx
    │   └── api/client.js
    └── .env.example
```

---

## 3. Setup instructions

### Prerequisites
- Node.js 18+
- A MongoDB database — local `mongod`, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### Backend

```bash
cd backend
cp .env.example .env      # then edit MONGO_URI, JWT_SECRET, ADMIN_EMAIL/PASSWORD
npm install
npm run seed               # creates the admin account + 10 starter tables (idempotent)
npm run dev                 # http://localhost:5000
```

### Frontend

```bash
cd frontend
cp .env.example .env       # set VITE_API_URL to your backend's /api URL
npm install
npm run dev                 # http://localhost:5173
```

Open `http://localhost:5173`. Sign up as a guest from the landing page, or go to **Admin** to log
in with the seeded admin credentials.

---

## 4. Reservation & availability logic

- **Fixed time slots.** Rather than free-form times, the restaurant offers five fixed slots per
  day (e.g. `19:30-21:00`). Both frontend and backend read the same list from
  `GET /api/meta/time-slots`, so they can never drift apart. This turns "does this overlap with
  that?" into a simple equality check instead of interval-overlap math.
- **A reservation is valid only if, at the moment of booking:**
  1. the date is today or later, and inside the configurable booking window (`MAX_ADVANCE_BOOKING_DAYS`);
  2. the chosen time slot is one of the fixed slots;
  3. the table exists, is active, and its `capacity >= numberOfGuests`;
  4. no other **confirmed** reservation exists for that exact `table + date + timeSlot`.
- **Race-condition safety.** The availability check above runs in the application layer, but two
  requests could theoretically hit it at the same instant. To close that gap, `Reservation` has a
  **partial unique index** on `{ table, date, timeSlot }` that only applies while
  `status: 'confirmed'`. A genuine double-booking is therefore rejected by MongoDB itself
  (`E11000` duplicate key), which the centralized error handler turns into a clean `409 Conflict`
  — not just an application-level "best effort."
- **Cancelling** a reservation sets `status: 'cancelled'` (soft delete) rather than removing the
  document, so it frees up the table/slot immediately while preserving history for the admin.

## 5. Role-based access

| | Customer | Admin |
|---|---|---|
| Sign up | ✅ self-service | ❌ (seed script only) |
| Log in | `/api/auth/login` | `/api/auth/admin/login` (separate endpoint) |
| Create reservation | ✅ own only | — |
| View reservations | own only | all, filterable by date/status |
| Cancel reservation | own only | any |
| Update/reassign reservation | ❌ | ✅ |
| Manage tables | ❌ | ✅ create/edit/deactivate |

Every protected route runs through two middlewares: `protect` (verifies the JWT and loads
`req.user`) and `authorize(role)` (rejects the request with `403` if the role doesn't match). The
JWT payload only carries `id` and `role`; the server always re-reads the user's current role from
the database on each request rather than trusting a stale claim.

The **admin login page is a visually distinct, separate route** (`/admin/login`) from the guest
login, so staff and guests can never confuse which account they're using.

## 6. Assumptions

- Single restaurant, single location, fixed set of tables (seeded, editable by admin).
- Five fixed daily time slots rather than arbitrary start/end times (documented above).
- A "reservation" is for one table (no ability to combine two tables for a big party in this
  version — see Known limitations).
- No payment, deposit, or SMS/email confirmation — out of scope per the assignment brief.
- The contact page form is currently front-end only (no backend endpoint) since it isn't part of
  the reservation domain; wire it to a `/api/contact` route or email service if needed.

## 7. Known limitations

- No email/SMS confirmation or reminders.
- No ability to merge multiple tables for one large party.
- No walk-in / phone booking workflow for staff (admin can only manage reservations that already
  exist, or edit them — there's no "quick add for a walk-in" shortcut yet).
- No refresh-token rotation — JWTs are long-lived (`JWT_EXPIRES_IN`, default 7 days) and there's no
  server-side revocation list, so a stolen token is valid until it expires.
- No automated test suite included in this build.
- No image opening hours / floor-plan seat map — tables are listed, not spatially arranged.

## 8. Areas for improvement with more time

- Add a lightweight admin analytics view (covers per night, no-show tracking).
- Add email confirmation + reminder before the reservation time.
- Support combinable tables for parties larger than any single table's capacity.
- Add refresh tokens + logout-everywhere for better session security.
- Add integration/unit tests (Jest + Supertest for the API, React Testing Library for the UI).
- Add optimistic UI updates and websocket-based live updates to the admin dashboard so newly
  placed reservations appear without a manual refresh.

---

## 9. Deployment

Any standard platform works. A common split:

- **Backend** → Render / Railway (Node web service). Set `MONGO_URI`, `JWT_SECRET`,
  `CLIENT_ORIGIN` (your deployed frontend URL), `ADMIN_EMAIL`/`ADMIN_PASSWORD` as environment
  variables, then run the seed script once via the platform's shell/console.
- **Database** → MongoDB Atlas (free tier is enough for this scope).
- **Frontend** → Vercel / Netlify (static Vite build). Set `VITE_API_URL` to your deployed
  backend's `/api` base URL.

Remember to update `CLIENT_ORIGIN` on the backend and `VITE_API_URL` on the frontend once both
are deployed, or CORS will block requests.
