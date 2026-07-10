import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import client, { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import TicketStub from '../components/TicketStub';
import {
  Field,
  Input,
  Select,
  Textarea,
  PrimaryButton,
  GhostButton,
  Alert,
  Spinner,
} from '../components/UI';

const todayString = () => new Date().toISOString().slice(0, 10);

const CustomerDashboard = () => {
  const { user } = useAuth();

  const [timeSlots, setTimeSlots] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  const [form, setForm] = useState({
    date: todayString(),
    timeSlot: '',
    numberOfGuests: 2,
    specialRequests: '',
  });
  const [availableTables, setAvailableTables] = useState(null); // null = not checked yet
  const [selectedTable, setSelectedTable] = useState('');
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadReservations = async () => {
    setLoadingList(true);
    try {
      const { data } = await client.get('/reservations/my');
      setReservations(data.reservations);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    client.get('/meta/time-slots').then(({ data }) => setTimeSlots(data.timeSlots)).catch(() => {});
    loadReservations();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setAvailableTables(null);
    setSelectedTable('');
    setSuccess('');
  };

  const handleCheckAvailability = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCheckingAvailability(true);
    try {
      const { data } = await client.get('/tables/availability', {
        params: { date: form.date, timeSlot: form.timeSlot, guests: form.numberOfGuests },
      });
      setAvailableTables(data.availableTables);
      setSelectedTable('');
      if (data.availableTables.length === 0) {
        setError('No tables are free for that date, time, and party size. Try another slot.');
      }
    } catch (err) {
      setError(getErrorMessage(err));
      setAvailableTables(null);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedTable) return;
    setError('');
    setSubmitting(true);
    try {
      await client.post('/reservations', {
        tableId: selectedTable,
        date: form.date,
        timeSlot: form.timeSlot,
        numberOfGuests: Number(form.numberOfGuests),
        specialRequests: form.specialRequests,
      });
      setSuccess('Table reserved. Your ticket is below.');
      setAvailableTables(null);
      setSelectedTable('');
      setForm((f) => ({ ...f, specialRequests: '' }));
      loadReservations();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this reservation?')) return;
    try {
      await client.delete(`/reservations/${id}`);
      loadReservations();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const upcoming = reservations.filter((r) => r.status === 'confirmed');
  const past = reservations.filter((r) => r.status !== 'confirmed');

  return (
    <Layout>
      <section className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-brass">Welcome, {user?.name}</p>
        <h1 className="mt-2 font-display text-3xl text-paper">Reserve a table</h1>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
          <form onSubmit={availableTables ? handleBook : handleCheckAvailability} className="space-y-5">
            {error && <Alert type="error">{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}

            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Date">
                <Input
                  type="date"
                  name="date"
                  min={todayString()}
                  value={form.date}
                  onChange={handleFormChange}
                  required
                />
              </Field>
              <Field label="Time slot">
                <Select name="timeSlot" value={form.timeSlot} onChange={handleFormChange} required>
                  <option value="" disabled>Select a slot</option>
                  {timeSlots.map((slot) => (
                    <option className="text-black bg-gray-300" key={slot} value={slot}>{slot}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Guests">
                <Input
                  type="number"
                  name="numberOfGuests"
                  min={1}
                  max={10}
                  value={form.numberOfGuests}
                  onChange={handleFormChange}
                  required
                />
              </Field>
            </div>

            {!availableTables ? (
              <GhostButton type="submit" disabled={checkingAvailability || !form.timeSlot}>
                {checkingAvailability && <Spinner className="h-4 w-4" />}
                Check availability
              </GhostButton>
            ) : (
              <>
                <Field label="Available tables">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {availableTables.map((t) => (
                      <button
                        type="button"
                        key={t._id}
                        onClick={() => setSelectedTable(t._id)}
                        className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                          selectedTable === t._id
                            ? 'border-brass bg-brass/10'
                            : 'border-white/10 bg-white/[0.02] hover:border-brass/40'
                        }`}
                      >
                        <p className="font-mono text-sm text-paper">Table {t.tableNumber}</p>
                        <p className="text-xs text-muted capitalize">
                          Seats {t.capacity} · {t.location.replace('-', ' ')}
                        </p>
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="Special requests (optional)">
                  <Textarea
                    name="specialRequests"
                    value={form.specialRequests}
                    onChange={handleFormChange}
                    rows={2}
                    placeholder="Window seat, allergy notes, celebration..."
                  />
                </Field>

                <div className="flex flex-wrap gap-3">
                  <PrimaryButton type="submit" disabled={!selectedTable || submitting}>
                    {submitting && <Spinner className="h-4 w-4" />}
                    Confirm reservation
                  </PrimaryButton>
                  <GhostButton type="button" onClick={() => setAvailableTables(null)}>
                    Change search
                  </GhostButton>
                </div>
              </>
            )}
          </form>
        </div>

        <div className="mt-14">
          <h2 className="font-display text-2xl text-paper">Upcoming reservations</h2>
          {loadingList ? (
            <p className="mt-4 text-sm text-muted">Loading…</p>
          ) : upcoming.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No upcoming reservations yet.</p>
          ) : (
            <div className="mt-5 space-y-4">
              {upcoming.map((r) => (
                <TicketStub
                  key={r._id}
                  reservation={r}
                  actions={
                    <DangerButton onClick={() => handleCancel(r._id)}>Cancel</DangerButton>
                  }
                />
              ))}
            </div>
          )}
        </div>

        {past.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-xl text-paper/70">Past &amp; cancelled</h2>
            <div className="mt-5 space-y-4 opacity-60">
              {past.map((r) => (
                <TicketStub key={r._id} reservation={r} />
              ))}
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
};

const DangerButton = ({ children, ...props }) => (
  <button
    {...props}
    className="rounded-full border border-wine/40 px-4 py-1.5 text-xs font-medium text-wine-light transition-colors hover:bg-wine/10"
  >
    {children}
  </button>
);

export default CustomerDashboard;
