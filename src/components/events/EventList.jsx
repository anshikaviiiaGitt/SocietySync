// src/components/events/EventList.jsx
import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Plus,
  Search,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Image as ImageIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EventFormModal } from './EventFormModal';
import { EventRegisterModal } from './EventRegisterModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EVENT_CATEGORIES } from '../../data/constants';

export function EventList() {
  const {
    events,
    residents,
    addEvent,
    deleteEvent,
    registerForEvent
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [timeFilter, setTimeFilter] = useState('ALL'); // 'ALL', 'UPCOMING', 'PAST'

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [registeringEvent, setRegisteringEvent] = useState(null);
  const [deletingEventId, setDeletingEventId] = useState(null);
  const [expandedEventId, setExpandedEventId] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches =
          (evt.title || '').toLowerCase().includes(q) ||
          (evt.location || '').toLowerCase().includes(q) ||
          (evt.description || '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (categoryFilter !== 'ALL' && evt.category !== categoryFilter) {
        return false;
      }
      if (timeFilter === 'UPCOMING' && evt.date < todayStr) {
        return false;
      }
      if (timeFilter === 'PAST' && evt.date >= todayStr) {
        return false;
      }
      return true;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events, searchTerm, categoryFilter, timeFilter, todayStr]);

  const handleFormSubmit = async (data) => {
    await addEvent(data);
    setEditingEvent(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Society Events & Community RSVPs
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Manage community gatherings, AGMs, safety drills, and track resident participant attendance
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => {
            setEditingEvent(null);
            setIsFormOpen(true);
          }}
        >
          <Plus size={15} />
          <span>Organize Event</span>
        </button>
      </div>

      {/* Filter Bar with Time Tabs */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={15} className="search-icon-inside" />
          <input
            type="text"
            className="form-input"
            placeholder="Search events by title, venue, or activity..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Time Tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-subtle)', padding: 2, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button
            type="button"
            className={`btn btn-sm ${timeFilter === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.74rem' }}
            onClick={() => setTimeFilter('ALL')}
          >
            All
          </button>
          <button
            type="button"
            className={`btn btn-sm ${timeFilter === 'UPCOMING' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.74rem' }}
            onClick={() => setTimeFilter('UPCOMING')}
          >
            Upcoming
          </button>
          <button
            type="button"
            className={`btn btn-sm ${timeFilter === 'PAST' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.74rem' }}
            onClick={() => setTimeFilter('PAST')}
          >
            Past
          </button>
        </div>

        <select
          className="form-select filter-select"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="ALL">All Categories</option>
          {EVENT_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon-box">
            <Calendar size={22} />
          </div>
          <div className="empty-title">No events found</div>
          <div className="empty-desc">
            No events match your current search or timeline filter. Create a new event to get started.
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.25rem' }}>
          {filteredEvents.map(evt => {
            const totalAttendees = (evt.registrations || []).reduce((acc, r) => acc + (Number(r.attendees) || 1), 0);
            const percent = Math.min(100, Math.round((totalAttendees / evt.capacity) * 100));
            const isFull = totalAttendees >= evt.capacity;
            const isExpanded = expandedEventId === evt.id;
            const isPast = evt.date < todayStr;

            return (
              <div key={evt.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', opacity: isPast ? 0.8 : 1 }}>
                {evt.coverImage && (
                  <div style={{ width: '100%', height: 140, borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '0.25rem' }}>
                    <img src={evt.coverImage} alt={evt.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span className="badge badge-category" style={{ color: 'var(--color-primary)', borderColor: 'rgba(35, 72, 61, 0.2)' }}>
                      {evt.category}
                    </span>
                    {isPast && (
                      <span className="badge" style={{ background: '#ECEAE3', color: '#7E8781' }}>
                        Past Event
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      type="button"
                      className="btn btn-danger btn-icon"
                      style={{ width: 28, height: 28 }}
                      title="Cancel Event"
                      onClick={() => setDeletingEventId(evt.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {evt.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {evt.description}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={13} style={{ color: 'var(--color-primary)' }} />
                    <span>
                      {new Date(evt.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} • {evt.time}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={13} style={{ color: 'var(--color-accent)' }} />
                    <span>{evt.location}</span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div style={{ marginTop: '0.25rem', background: 'var(--bg-subtle)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: 3 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      RSVPs: <strong>{totalAttendees}</strong> / {evt.capacity}
                    </span>
                    <span style={{ fontWeight: 600, color: isFull ? 'var(--color-accent)' : 'var(--color-primary)' }}>
                      {isFull ? 'Full' : `${evt.capacity - totalAttendees} spots left`}
                    </span>
                  </div>
                  <div style={{ height: 4, background: '#E5E3DC', borderRadius: 999, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${percent}%`,
                        background: isFull ? 'var(--color-accent)' : 'var(--color-primary)',
                        borderRadius: 999
                      }}
                    />
                  </div>
                </div>

                {/* Footer Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                  <button
                    type="button"
                    style={{ fontSize: '0.75rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}
                    onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                  >
                    <span>Registered Attendees ({(evt.registrations || []).length})</span>
                    {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={isFull || isPast}
                    onClick={() => setRegisteringEvent(evt)}
                  >
                    <Users size={13} />
                    <span>{isPast ? 'Concluded' : isFull ? 'Fully Booked' : 'RSVP / Register'}</span>
                  </button>
                </div>

                {/* Expanded Attendees List */}
                {isExpanded && (
                  <div style={{
                    marginTop: '0.4rem',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem',
                    maxHeight: 180,
                    overflowY: 'auto'
                  }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 5 }}>
                      Registered Society Members:
                    </div>
                    {(evt.registrations || []).length === 0 ? (
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>No registrations yet.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {evt.registrations.map(r => (
                          <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            <span><strong>{r.residentName}</strong> (Flat {r.flatNumber})</span>
                            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{r.attendees} seat(s)</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Event Form Modal */}
      {isFormOpen && (
        <EventFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingEvent(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={editingEvent}
        />
      )}

      {/* Event Register Modal */}
      {registeringEvent && (
        <EventRegisterModal
          event={registeringEvent}
          isOpen={Boolean(registeringEvent)}
          onClose={() => setRegisteringEvent(null)}
          onRegister={registerForEvent}
          residentsList={residents}
        />
      )}

      {/* Delete Event Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingEventId)}
        onClose={() => setDeletingEventId(null)}
        onConfirm={() => {
          if (deletingEventId) deleteEvent(deletingEventId);
        }}
        title="Cancel Society Event"
        message="Are you sure you want to cancel and remove this event? All participant registrations will be removed."
        confirmText="Cancel Event"
        confirmVariant="danger"
      />
    </div>
  );
}
