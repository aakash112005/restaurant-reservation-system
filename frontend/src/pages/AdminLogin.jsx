import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { Field, Input, Alert, Spinner } from '../components/UI';

const AdminLogin = () => {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await adminLogin(form);
    setLoading(false);
    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <Layout>
      <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16 sm:px-8">
        <div className="rounded-2xl border border-wine/30 bg-wine/[0.04] p-7">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-wine-light">
            Restricted access
          </p>
          <h1 className="font-display text-3xl text-paper">Administrator login</h1>
          <p className="mt-2 text-sm text-paper/60">
            This area is for restaurant staff only. There is no self-service admin signup —
            accounts are provisioned directly by the owner.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            {error && <Alert type="error">{error}</Alert>}
            <Field label="Admin email">
              <Input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="admin@thenightlytable.com"
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </Field>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-wine px-6 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-wine-light disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && <Spinner className="h-4 w-4" />}
              Log in as admin
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-paper/60">
          Not staff?{' '}
          <Link to="/login" className="text-brass hover:text-brass-light">Go to guest login</Link>
        </p>
      </section>
    </Layout>
  );
};

export default AdminLogin;
