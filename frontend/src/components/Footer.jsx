import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="border-t border-white/5 bg-ink">
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div>
        <p className="font-display text-lg text-paper">The Nightly Table</p>
        <p className="mt-1 text-sm text-muted">Book once. We hold the rest of the evening.</p>
      </div>
      <div className="flex gap-6 text-sm text-paper/60">
        <Link to="/about" className="hover:text-paper">About</Link>
        <Link to="/contact" className="hover:text-paper">Contact</Link>
        <Link to="/login" className="hover:text-paper">Reservations</Link>
        <Link to="/admin/login" className="hover:text-paper">Staff login</Link>
      </div>
    </div>
    <div className="border-t border-white/5 px-5 py-4 text-center text-xs text-muted sm:px-8">
      © {new Date().getFullYear()} The Nightly Table. All rights reserved.
    </div>
  </footer>
);

export default Footer;
