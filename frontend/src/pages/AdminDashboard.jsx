import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import client, { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import TicketStub from '../components/TicketStub';
import { Field, Input, Select, PrimaryButton, GhostButton, Alert, StatusBadge, Spinner } from '../components/UI';

const TABS = { RESERVATIONS: 'reservations', TABLES: 'tables' };

const AdminDashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState(TABS.RESERVATIONS);

  return (
    <Layout>
      <section className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-wine-light">
          Signed in as admin · {user?.email}
        </p>
        <h1 className="mt-2 font-display text-3xl text-paper">Restaurant control room</h1>

        <div className="mt-8 flex gap-2 border-b border-white/10">
          {[
            [TABS.RESERVATIONS, 'Reservations'],
            [TABS.TABLES, 'Tables'],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                tab === key ? 'border-wine text-paper' : 'border-transparent text-muted hover:text-paper/70'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === TABS.RESERVATIONS ? <ReservationsPanel /> : <TablesPanel />}
      </section>
    </Layout>
  );
};

const ReservationsPanel = () => {
  const [reservations, setReservations] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (dateFilter) params.date = dateFilter;
      if (statusFilter) params.status = statusFilter;
      const { data } = await client.get('/admin/reservations', { params });
      setReservations(data.reservations);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter, statusFilter]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this reservation? This cannot be undone.')) return;
    try {
      await client.delete(`/admin/reservations/${id}`);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-end gap-4">
        <Field label="Filter by date">
          <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        </Field>
        <Field label="Filter by status">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </Field>
        {(dateFilter || statusFilter) && (
          <GhostButton
            type="button"
            onClick={() => {
              setDateFilter('');
              setStatusFilter('');
            }}
          >
            Clear filters
          </GhostButton>
        )}
        <span className="ml-auto text-sm text-muted">{reservations.length} result(s)</span>
      </div>

      {error && <div className="mt-4"><Alert type="error">{error}</Alert></div>}

      {loading ? (
        <p className="mt-6 text-sm text-muted">Loading…</p>
      ) : reservations.length === 0 ? (
        <p className="mt-6 text-sm text-muted">No reservations match these filters.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {reservations.map((r) => (
            <TicketStub
              key={r._id}
              reservation={r}
              actions={
                r.status === 'confirmed' ? (
                  <button
                    onClick={() => handleCancel(r._id)}
                    className="rounded-full border border-wine/40 px-4 py-1.5 text-xs font-medium text-wine-light transition-colors hover:bg-wine/10"
                  >
                    Cancel
                  </button>
                ) : (
                  <StatusBadge status={r.status} />
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

const emptyTable = { tableNumber: '', capacity: 2, location: 'indoor' };

const TablesPanel = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTable, setNewTable] = useState(emptyTable);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await client.get('/admin/tables');
      setTables(data.tables);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      await client.post('/admin/tables', { ...newTable, capacity: Number(newTable.capacity) });
      setNewTable(emptyTable);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (table) => {
    try {
      await client.patch(`/admin/tables/${table._id}`, { isActive: !table.isActive });
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="mt-8">
      {error && <div className="mb-4"><Alert type="error">{error}</Alert></div>}

      <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <Field label="Table number">
          <Input
            value={newTable.tableNumber}
            onChange={(e) => setNewTable({ ...newTable, tableNumber: e.target.value })}
            placeholder="T11"
            required
          />
        </Field>
        <Field label="Capacity">
          <Input
            type="number"
            min={1}
            max={30}
            value={newTable.capacity}
            onChange={(e) => setNewTable({ ...newTable, capacity: e.target.value })}
            required
          />
        </Field>
        <Field label="Location">
          <Select
            value={newTable.location}
            onChange={(e) => setNewTable({ ...newTable, location: e.target.value })}
          >
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor</option>
            <option value="patio">Patio</option>
            <option value="private-room">Private room</option>
            <option value="bar">Bar</option>
          </Select>
        </Field>
        <PrimaryButton type="submit" disabled={creating}>
          {creating && <Spinner className="h-4 w-4" />}
          Add table
        </PrimaryButton>
      </form>

      {loading ? (
        <p className="mt-6 text-sm text-muted">Loading…</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Table</th>
                <th className="px-4 py-3">Capacity</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {tables.map((t) => (
                <tr key={t._id} className="border-t border-white/5">
                  <td className="px-4 py-3 font-mono">{t.tableNumber}</td>
                  <td className="px-4 py-3">{t.capacity}</td>
                  <td className="px-4 py-3 capitalize">{t.location.replace('-', ' ')}</td>
                  <td className="px-4 py-3">
                    <span className={t.isActive ? 'text-brass' : 'text-muted'}>
                      {t.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <GhostButton type="button" onClick={() => toggleActive(t)} className="px-4 py-1.5 text-xs">
                      {t.isActive ? 'Deactivate' : 'Reactivate'}
                    </GhostButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
