import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { Field, Input, PrimaryButton, Alert, Spinner } from '../components/UI';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(form);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <Layout>
      <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16 sm:px-8">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-brass">Welcome back</p>
        <h1 className="font-display text-3xl text-paper">Log in</h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && <Alert type="error">{error}</Alert>}
          <Field label="Email">
            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
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
          <PrimaryButton type="submit" className="w-full" disabled={loading}>
            {loading && <Spinner className="h-4 w-4" />}
            Log in
          </PrimaryButton>
        </form>

        <p className="mt-6 text-center text-sm text-paper/60">
          New here?{' '}
          <Link to="/signup" className="text-brass hover:text-brass-light">Create an account</Link>
        </p>
        <p className="mt-2 text-center text-xs text-muted">
          Restaurant staff? <Link to="/admin/login" className="text-wine-light hover:text-wine">Admin login</Link>
        </p>
      </section>
    </Layout>
  );
};

export default Login;
