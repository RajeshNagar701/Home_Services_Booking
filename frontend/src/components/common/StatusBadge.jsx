import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toLowerCase();
  let badgeClass = 'badge-pending';
  let label = status.replace(/_/g, ' ');

  if (['completed', 'approved', 'paid', 'success', 'captured'].includes(normalized)) {
    badgeClass = 'badge-completed';
  } else if (['pending', 'created', 'open'].includes(normalized)) {
    badgeClass = 'badge-pending';
  } else if (['accepted'].includes(normalized)) {
    badgeClass = 'badge-accepted';
  } else if (
    ['in_progress', 'on_the_way', 'arrived', 'technician_assigned', 'under_investigation'].includes(
      normalized
    )
  ) {
    badgeClass = 'badge-in_progress';
  } else if (['cancelled', 'rejected', 'failed', 'closed'].includes(normalized)) {
    badgeClass = 'badge-cancelled';
  }

  return <span className={`badge-status ${badgeClass}`}>{label}</span>;
};

export default StatusBadge;
