// src/components/dashboard/HighPriorityAlerts.jsx
import React from 'react';
import { Flame, ShieldCheck, ArrowRight } from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../common/Badge';

export function HighPriorityAlerts({ complaints = [], onSelectComplaint }) {
  const criticalComplaints = complaints.filter(
    c => (c.priority === 'Urgent' || c.priority === 'High') && c.status !== 'Resolved'
  );

  if (criticalComplaints.length === 0) {
    return (
      <div style={{
        background: '#FFFFFF',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '0.85rem 1.25rem',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'rgba(35, 72, 61, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-primary)'
        }}>
          <ShieldCheck size={17} />
        </div>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            All High-Priority & Urgent Systems Normal
          </span>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            No unresolved emergency tickets currently outstanding across all 4 towers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#FDF0EB',
      border: '1px solid #F6CEBF',
      borderRadius: 'var(--radius-lg)',
      padding: '1rem 1.25rem',
      marginBottom: '1.25rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Flame size={17} style={{ color: 'var(--color-accent)' }} />
          <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--color-accent)', letterSpacing: '0.02em' }}>
            CRITICAL ATTENTION REQUIRED ({criticalComplaints.length} Outstanding)
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
          Requires immediate facility dispatch
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {criticalComplaints.map(c => (
          <div
            key={c.id}
            style={{
              background: '#FFFFFF',
              border: '1px solid #F6CEBF',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                  {c.id}
                </span>
                <PriorityBadge priority={c.priority} />
                <StatusBadge status={c.status} />
              </div>

              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: 3 }}>
                {c.title}
              </div>

              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2, display: 'flex', gap: '0.85rem' }}>
                <span>Resident: <strong>{c.residentName}</strong> (Flat {c.flatNumber})</span>
                <span>Assigned: <strong>{c.assignedStaff || 'Unassigned'}</strong></span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', borderColor: '#F6CEBF', color: 'var(--color-accent)' }}
              onClick={() => onSelectComplaint(c)}
            >
              <span>Review Ticket</span>
              <ArrowRight size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
