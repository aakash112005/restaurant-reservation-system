import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import TicketStub from '../components/TicketStub';

const sampleReservation = {
  date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
  timeSlot: '19:30-21:00',
  numberOfGuests: 4,
  status: 'confirmed',
  table: { tableNumber: 'T5', location: 'indoor' },
};

const Landing = () => (
  <Layout>
    {/* Hero */}
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grain" />
      <div className="mx-auto grid max-w-6xl gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.25em] text-brass">
            Table reservations, done properly
          </p>
          <h1 className="text-balance font-display text-4xl font-semibold leading-[1.1] text-paper sm:text-5xl lg:text-6xl">
            One table.
            <br />
            One time slot.
            <br />
            <span className="text-brass">Never double-booked.</span>
          </h1>
          <p className="mt-6 max-w-md text-paper/70">
            The Nightly Table is our restaurant's own reservation system — guests book directly,
            our floor staff always know exactly who's coming, and no two parties are ever seated
            at the same table at once.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              to="/signup"
              className="rounded-full bg-brass px-7 py-3 text-sm font-semibold text-ink transition-colors hover:bg-brass-light"
            >
              Sign up to book a table
            </Link>
            <Link
              to="/login"
              className="rounded-full border border-white/15 px-7 py-3 text-sm font-medium text-paper transition-colors hover:border-brass/50 hover:text-brass"
            >
              Log in
            </Link>
          </div>
          <Link
            to="/admin/login"
            className="mt-5 inline-block text-xs text-muted transition-colors hover:text-wine-light"
          >
            Restaurant staff → Admin login
          </Link>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-3xl bg-brass/5 blur-2xl" />
          <p className="mb-3 text-xs uppercase tracking-widest text-muted">Your confirmation looks like this</p>
          <TicketStub reservation={sampleReservation} />
        </div>
      </div>
    </section>

    {/* How it works */}
    <section className="border-t border-white/5 bg-ink-soft/40 py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <h2 className="font-display text-3xl text-paper">How a reservation is protected</h2>
        <p className="mt-3 max-w-xl text-paper/60">
          Three checks run every time a table is requested — before anything is confirmed.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            {
              step: 'Capacity check',
              copy: "A table is only offered if it comfortably seats your party. A two-top never gets squeezed to fit six.",
            },
            {
              step: 'Conflict check',
              copy: 'The same table can never hold two confirmed bookings in the same date and time slot — checked at the database level.',
            },
            {
              step: 'Confirmation',
              copy: 'You get an instant ticket with your table, time, and party size. Cancel any time from your dashboard.',
            },
          ].map((item) => (
            <div key={item.step} className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
              <h3 className="font-display text-xl text-brass">{item.step}</h3>
              <p className="mt-2 text-sm text-paper/60">{item.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA band */}
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-5 text-center sm:px-8">
        <h2 className="font-display text-3xl text-paper sm:text-4xl">Ready for tonight?</h2>
        <p className="mx-auto mt-3 max-w-md text-paper/60">
          Create an account and reserve your table in under a minute.
        </p>
        <Link
          to="/signup"
          className="mt-8 inline-block rounded-full bg-brass px-8 py-3 text-sm font-semibold text-ink transition-colors hover:bg-brass-light"
        >
          Reserve a table
        </Link>
      </div>
    </section>
  </Layout>
);

export default Landing;
