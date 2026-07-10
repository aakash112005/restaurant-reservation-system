import React from 'react';
import Layout from '../components/Layout';

const About = () => (
  <Layout>
    <section className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
      <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-brass">About us</p>
      <h1 className="font-display text-4xl text-paper">A small room, run carefully.</h1>
      <div className="mt-8 space-y-5 text-paper/70">
        <p>
          The Nightly Table seats a limited number of guests each evening, on purpose. We built
          this reservation system ourselves so that every table booked is a table we can actually
          honor — no overbooking, no double-seating, no guesswork at the door.
        </p>
        <p>
          Guests reserve directly: pick a date, a time, a party size, and we hold the right table.
          Our floor team works from the same list in real time, so what you booked online is
          exactly what's waiting for you when you arrive.
        </p>
        <p>
          We're a young kitchen with an old-fashioned idea: reservations should mean something.
          When you book with us, that table is yours for that slot — full stop.
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <p className="font-display text-3xl text-brass">10</p>
          <p className="mt-1 text-sm text-paper/60">Tables, indoor, patio, and bar seating</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <p className="font-display text-3xl text-brass">5</p>
          <p className="mt-1 text-sm text-paper/60">Seating slots across lunch and dinner</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <p className="font-display text-3xl text-brass">0</p>
          <p className="mt-1 text-sm text-paper/60">Double-bookings, by design</p>
        </div>
      </div>
    </section>
  </Layout>
);

export default About;
