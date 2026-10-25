// src/components/events/EventRegisterModal.jsx
import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Users, CheckCircle, AlertTriangle, Calendar, MapPin } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export function EventRegisterModal({
  event,
  isOpen,
  onClose,
  onRegister,
  residentsList = []
}) {
  const toast = useToast();

  const [residentName, setResidentName] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [attendees, setAttendees] = useState(1);
  const [errors, setErrors] = useState({});

  if (!event) return null;

  const currentTotal = (event.registrations || []).reduce((acc, r) => acc + (Number(r.attendees) || 1), 0);
  const remainingSpots = Math.max(0, event.capacity - currentTotal);

  const handleResidentSelect = (e) => {
    const resId = e.target.value;
    if (!resId) return;
    const res = residentsList.find(r => r.id === resId);
    if (res) {
      setResidentName(res.name);
      setFlatNumber(res.flatNumber);
      setErrors({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!residentName.trim()) newErrors.residentName = 'Resident name is required.';
    if (!flatNumber.trim()) newErrors.flatNumber = 'Flat number is required.';
    if (Number(attendees) <= 0) newErrors.attendees = 'Must have at least 1 attendee.';
    if (Number(attendees) > remainingSpots) {
      newErrors.attendees = `Only ${remainingSpots} spot(s) remaining for this event.`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await onRegister(event.id, {
      residentName: residentName.trim(),
      flatNumber: flatNumber.trim(),
      attendees: Number(attendees)
    });

    if (result && result.success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`RSVP Registration: ${event.title}`}
      icon={Users}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {/* Event Quick Snapshot */}
          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            marginBottom: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.3rem'
          }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
              {event.title}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span>📅 {new Date(event.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} • {event.time}</span>
              <span>📍 {event.location}</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: remainingSpots < 10 ? 'var(--color-accent)' : 'var(--color-primary)', fontWeight: 600, marginTop: 2 }}>
              {remainingSpots} spots remaining out of {event.capacity} total capacity
            </div>
          </div>

          {/* Resident Directory Picker */}
          {residentsList.length > 0 && (
            <div className="form-group">
              <label className="form-label">
                <span>Select Resident (Optional Shortcut)</span>
              </label>
              <select
                className="form-select"
                onChange={handleResidentSelect}
                defaultValue=""
              >
                <option value="">-- Choose Resident from Directory --</option>
                {residentsList.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.flatNumber} • {r.wing})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">
                <span>Resident Name <span className="required-star">*</span></span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Vikram Malhotra"
                value={residentName}
                onChange={e => {
                  setResidentName(e.target.value);
                  setErrors(prev => ({ ...prev, residentName: null }));
                }}
              />
              {errors.residentName && <span className="form-error">{errors.residentName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Flat Number <span className="required-star">*</span></span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. B-402"
                value={flatNumber}
                onChange={e => {
                  setFlatNumber(e.target.value);
                  setErrors(prev => ({ ...prev, flatNumber: null }));
                }}
              />
              {errors.flatNumber && <span className="form-error">{errors.flatNumber}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Number of Attendees (Family / Guests) <span className="required-star">*</span></span>
            </label>
            <select
              className="form-select"
              value={attendees}
              onChange={e => setAttendees(e.target.value)}
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'attendee' : 'attendees'}
                </option>
              ))}
            </select>
            {errors.attendees && <span className="form-error">{errors.attendees}</span>}
          </div>

          <div style={{
            fontSize: '0.74rem',
            color: 'var(--text-muted)',
            lineHeight: 1.4,
            background: 'var(--bg-subtle)',
            padding: '0.6rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)'
          }}>
            ℹ️ SocietySync validates registrations and prevents duplicate entries per flat to ensure fair access for all residents.
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={remainingSpots <= 0}
          >
            <CheckCircle size={14} />
            <span>Confirm RSVP</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
