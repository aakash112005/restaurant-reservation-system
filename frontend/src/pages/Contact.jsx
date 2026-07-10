import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Field, Input, Textarea, PrimaryButton, Alert } from '../components/UI';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // This form is intentionally client-side only for this build — there is
    // no backend endpoint for contact messages (out of scope for the
    // reservation system). Wire it to an email service or a /api/contact
    // route if you want it to actually deliver messages.
    setSent(true);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <Layout>
      <section className="mx-auto grid max-w-5xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2">
        <div>
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-brass">Contact</p>
          <h1 className="font-display text-4xl text-paper">Get in touch.</h1>
          <p className="mt-5 max-w-sm text-paper/60">
            For large parties, private events, or anything our booking system can't handle,
            reach out directly.
          </p>
          <dl className="mt-10 space-y-6 text-sm">
            <div>
              <dt className="text-muted">Address</dt>
              <dd className="mt-1 text-paper/80">45, Wave City Complex, Ghaziabad</dd>
            </div>
            <div>
              <dt className="text-muted">Phone</dt>
              <dd className="mt-1 text-paper/80">+91 XXXXXXXXXX</dd>
            </div>
            <div>
              <dt className="text-muted">Email</dt>
              <dd className="mt-1 text-paper/80">hello@thenightlytable.com</dd>
            </div>
            <div>
              <dt className="text-muted">Hours</dt>
              <dd className="mt-1 text-paper/80">Tue–Sun, 12:00–15:00 &amp; 18:00–22:30</dd>
            </div>
          </dl>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
          {sent && <Alert type="success">Thanks — your message has been noted. We'll get back to you shortly.</Alert>}
          <Field label="Name">
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Your name"
            />
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
          <Field label="Message">
            <Textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
              placeholder="How can we help?"
            />
          </Field>
          <PrimaryButton type="submit" className="w-full">Send message</PrimaryButton>
        </form>
      </section>
    </Layout>
  );
};

export default Contact;
