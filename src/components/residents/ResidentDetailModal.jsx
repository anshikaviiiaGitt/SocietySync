// src/components/residents/ResidentDetailModal.jsx
import React from 'react';
import { Modal } from '../common/Modal';
import {
  User,
  Home,
  Mail,
  Phone,
  Car,
  Calendar,
  ClipboardList,
  Plus
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../common/Badge';

export function ResidentDetailModal({
  resident,
  isOpen,
  onClose,
  complaints = [],
  onLogComplaintForResident
}) {
  if (!resident) return null;

  const residentComplaints = complaints.filter(
    c => (c.flatNumber || '').trim().toUpperCase() === (resident.flatNumber || '').trim().toUpperCase() ||
         (c.residentName || '').trim().toLowerCase() === (resident.name || '').trim().toLowerCase()
  );

  const initials = resident.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Resident Profile: ${resident.name}`}
      icon={User}
      size="lg"
    >
      <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Profile Card Header */}
        <div style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="resident-avatar" style={{ width: 48, height: 48, fontSize: '1.1rem' }}>
              {initials}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {resident.name}
                </h3>
                <span className={`badge ${resident.occupancyType === 'Owner' ? 'badge-resolved' : 'badge-pending'}`}>
                  {resident.occupancyType}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Flat {resident.flatNumber} • {resident.wing} (Floor {resident.floor})
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              onClose();
              onLogComplaintForResident(resident);
            }}
          >
            <Plus size={14} />
            <span>File Complaint for Flat</span>
          </button>
        </div>

        {/* Contact & Occupancy Meta Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem'
        }}>
          <div style={{ background: '#FFFFFF', padding: '0.75rem 0.95rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Mail size={12} style={{ color: 'var(--color-primary)' }} /> Registered Email
            </span>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 3 }}>
              {resident.email}
            </div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '0.75rem 0.95rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Phone size={12} style={{ color: 'var(--color-primary)' }} /> Contact Phone
            </span>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 3 }}>
              {resident.phone}
            </div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '0.75rem 0.95rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Car size={12} style={{ color: 'var(--color-accent)' }} /> Registered Vehicle
            </span>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 3, fontFamily: 'var(--font-mono)' }}>
              {resident.vehicleNo}
            </div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '0.75rem 0.95rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Calendar size={12} /> Resident Since
            </span>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 3 }}>
              {new Date(resident.joinedDate).toLocaleDateString([], { month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Resident Complaint History */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ClipboardList size={15} style={{ color: 'var(--color-primary)' }} />
              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Complaint History for Flat {resident.flatNumber} ({residentComplaints.length})
              </h4>
            </div>
          </div>

          {residentComplaints.length === 0 ? (
            <div style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.8rem'
            }}>
              No complaints on record for this resident. Clean operational track record!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {residentComplaints.map(c => (
                <div
                  key={c.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                        {c.id}
                      </span>
                      <PriorityBadge priority={c.priority} />
                      <StatusBadge status={c.status} />
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                      {c.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1 }}>
                      Logged on: {new Date(c.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                    <div>Staff: <strong>{c.assignedStaff}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
}
