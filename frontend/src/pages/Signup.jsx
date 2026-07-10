import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { Field, Input, PrimaryButton, Alert, Spinner } from '../components/UI';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await signup(form);
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
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-brass">New guest</p>
        <h1 className="font-display text-3xl text-paper">Create your account</h1>
        <p className="mt-2 text-sm text-paper/60">
          Customer accounts only — this signs you up as a guest who can book and manage tables.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && <Alert type="error">{error}</Alert>}
          <Field label="Full name">
            <Input name="name" value={form.name} onChange={handleChange} required placeholder="Jordan Lee" />
          </Field>
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
          <Field label="Phone (optional)">
            <Input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 90000 00000" />
          </Field>
          <Field label="Password" hint="At least 8 characters.">
            <Input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
              placeholder="••••••••"
            />
          </Field>
          <PrimaryButton type="submit" className="w-full" disabled={loading}>
            {loading && <Spinner className="h-4 w-4" />}
            Create account
          </PrimaryButton>
        </form>

        <p className="mt-6 text-center text-sm text-paper/60">
          Already have an account?{' '}
          <Link to="/login" className="text-brass hover:text-brass-light">Log in</Link>
        </p>
      </section>
    </Layout>
  );
};

export default Signup;
