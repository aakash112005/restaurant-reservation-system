import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinkClass = ({ isActive }) =>
  `text-sm tracking-wide transition-colors ${
    isActive ? 'text-brass' : 'text-paper/70 hover:text-paper'
  }`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardPath = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl font-semibold text-paper">The Nightly Table</span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-brass sm:inline">
            Reservations
          </span>
        </Link>

        <button
          className="text-paper sm:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>

        <div className="hidden items-center gap-7 sm:flex">
          <NavLink to="/" end className={navLinkClass}>Home</NavLink>
          <NavLink to="/about" className={navLinkClass}>About</NavLink>
          <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>

          {user ? (
            <>
              <Link
                to={dashboardPath}
                className="rounded-full border border-brass/40 px-4 py-1.5 text-sm text-brass transition-colors hover:bg-brass/10"
              >
                {user.role === 'admin' ? 'Admin dashboard' : 'My reservations'}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-paper/60 transition-colors hover:text-paper"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-paper/70 transition-colors hover:text-paper">
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-brass px-4 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-brass-light"
              >
                Sign up
              </Link>
              <Link to="/admin/login" className="text-sm text-wine-light/80 transition-colors hover:text-wine-light">
                Admin
              </Link>
            </>
          )}
        </div>
      </nav>

      {open && (
        <div className="flex flex-col gap-4 border-t border-white/5 px-5 py-5 sm:hidden">
          <NavLink to="/" end onClick={() => setOpen(false)} className={navLinkClass}>Home</NavLink>
          <NavLink to="/about" onClick={() => setOpen(false)} className={navLinkClass}>About</NavLink>
          <NavLink to="/contact" onClick={() => setOpen(false)} className={navLinkClass}>Contact</NavLink>
          {user ? (
            <>
              <Link to={dashboardPath} onClick={() => setOpen(false)} className="text-brass">
                {user.role === 'admin' ? 'Admin dashboard' : 'My reservations'}
              </Link>
              <button onClick={handleLogout} className="text-left text-paper/60">Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="text-paper/70">Log in</Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="text-brass">Sign up</Link>
              <Link to="/admin/login" onClick={() => setOpen(false)} className="text-wine-light/80">Admin login</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
