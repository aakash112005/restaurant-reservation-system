import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const NotFound = () => (
  <Layout>
    <section className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-5 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-brass">404</p>
      <h1 className="mt-3 font-display text-3xl text-paper">No table booked under that address.</h1>
      <p className="mt-2 text-sm text-paper/60">The page you're looking for doesn't exist.</p>
      <Link to="/" className="mt-7 rounded-full bg-brass px-6 py-2.5 text-sm font-semibold text-ink hover:bg-brass-light">
        Back to the homepage
      </Link>
    </section>
  </Layout>
);

export default NotFound;
