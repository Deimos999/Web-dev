import React from 'react';

export default function StatusPill({ status }) {
  const lower = status.toLowerCase();
  let className = '';

  if (lower === 'open') className = 'status-pill status-open';
  else if (lower === 'paid') className = 'status-pill status-paid';
  else if (lower === 'inactive') className = 'status-pill status-inactive';
  else if (lower === 'due') className = 'status-pill status-due';
  else className = 'status-pill';

  return <span className={className}>{status}</span>;
}
