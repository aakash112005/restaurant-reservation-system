import React from 'react';

export const Field = ({ label, children, hint }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium text-paper/80">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
  </label>
);

const baseInputClass =
  'w-full rounded-lg border border-white/10 bg-ink-soft bg-white/[0.03] px-3.5 py-2.5 text-paper placeholder:text-muted focus:border-brass/60 focus:outline-none focus:ring-1 focus:ring-brass/40';

export const Input = (props) => <input {...props} className={`${baseInputClass} ${props.className || ''}`} />;

export const Select = ({ children, ...props }) => (
  <select {...props} className={`${baseInputClass} ${props.className || ''}`}>
    {children}
  </select>
);

export const Textarea = (props) => (
  <textarea {...props} className={`${baseInputClass} ${props.className || ''}`} />
);

export const PrimaryButton = ({ children, className = '', ...props }) => (
  <button
    {...props}
    className={`inline-flex items-center justify-center gap-2 rounded-full bg-brass px-6 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-brass-light disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  >
    {children}
  </button>
);

export const GhostButton = ({ children, className = '', ...props }) => (
  <button
    {...props}
    className={`inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium text-paper transition-colors hover:border-brass/50 hover:text-brass disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  >
    {children}
  </button>
);

export const DangerLink = ({ children, className = '', ...props }) => (
  <button
    {...props}
    className={`text-sm font-medium text-wine-light transition-colors hover:text-wine ${className}`}
  >
    {children}
  </button>
);

export const Alert = ({ type = 'error', children }) => {
  if (!children) return null;
  const styles =
    type === 'error'
      ? 'border-wine/40 bg-wine/10 text-wine-light'
      : 'border-brass/40 bg-brass/10 text-brass-light';
  return <div className={`rounded-lg border px-4 py-3 text-sm ${styles}`}>{children}</div>;
};

export const StatusBadge = ({ status }) => {
  const isConfirmed = status === 'confirmed';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide ${
        isConfirmed ? 'bg-brass/10 text-brass' : 'bg-white/5 text-muted'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isConfirmed ? 'bg-brass' : 'bg-muted'}`} />
      {status}
    </span>
  );
};

export const Spinner = ({ className = '' }) => (
  <svg
    className={`animate-spin ${className}`}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
    <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);
