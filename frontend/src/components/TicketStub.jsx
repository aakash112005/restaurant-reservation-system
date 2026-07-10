import React from 'react';

const formatDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

// The signature visual element of the product: reservations are presented
// as a perforated ticket stub, echoing the paper chits a maître d' hands
// out at the podium. Used on the hero, confirmation, and dashboard cards.
const TicketStub = ({ reservation, actions }) => {
  const table = reservation.table || {};
  return (
    <div className="ticket-stub flex flex-col overflow-hidden rounded-xl sm:flex-row">
      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass">
            {formatDate(reservation.date)}
          </p>
          {reservation.status && (
            <span
              className={`font-mono text-[10px] uppercase tracking-wide ${
                reservation.status === 'confirmed' ? 'text-brass' : 'text-muted'
              }`}
            >
              {reservation.status}
            </span>
          )}
        </div>
        <p className="font-display text-2xl text-paper">{reservation.timeSlot}</p>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-paper/70">
          <span>Table {table.tableNumber || '—'}</span>
          <span>
            {reservation.numberOfGuests} guest{reservation.numberOfGuests > 1 ? 's' : ''}
          </span>
          {table.location && <span className="capitalize">{table.location.replace('-', ' ')}</span>}
        </div>
        {reservation.specialRequests && (
          <p className="text-xs text-muted">Note: {reservation.specialRequests}</p>
        )}
        {reservation.user?.name && (
          <p className="text-xs text-muted">Guest: {reservation.user.name} ({reservation.user.email})</p>
        )}
      </div>
      {actions && (
        <div className="ticket-perforation flex items-center justify-center gap-2 p-5 sm:w-40 sm:flex-col">
          {actions}
        </div>
      )}
    </div>
  );
};

export default TicketStub;
