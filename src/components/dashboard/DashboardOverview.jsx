// src/components/dashboard/DashboardOverview.jsx
import React, { useState } from 'react';
import {
  ClipboardList,
  Clock,
  AlertCircle,
  CheckCircle2,
  Percent,
  Plus,
  Sparkles,
  Calendar,
  Megaphone,
  Download,
  ArrowRight,
  TrendingUp,
  MapPin,
  Users,
  Activity
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { ComplaintCharts } from './ComplaintCharts';
import { HighPriorityAlerts } from './HighPriorityAlerts';
import { ComplaintDetailModal } from '../complaints/ComplaintDetailModal';
import { exportComplaintsToCSV } from '../../services/csvExport';

export function DashboardOverview({
  onOpenNewComplaint,
  onOpenNewEvent,
  onOpenNewAnnouncement
}) {
  const {
    complaints,
    announcements,
    events,
    notifications,
    setActiveTab,
    deleteComplaint,
    updateComplaint
  } = useApp();

  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Compute live metrics from actual saved records
  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'Pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const resolutionRate = totalCount > 0 ? ((resolvedCount / totalCount) * 100).toFixed(1) : '0.0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Quick Operations Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0.75rem 1.25rem',
        background: '#FFFFFF',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <TrendingUp size={16} style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Quick Operations:
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onOpenNewComplaint}
          >
            <Plus size={14} />
            <span>New Complaint</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('ai-assistant')}
          >
            <Sparkles size={14} style={{ color: 'var(--color-primary)' }} />
            <span>AI Triage</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onOpenNewAnnouncement}
          >
            <Megaphone size={14} />
            <span>Post Notice</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onOpenNewEvent}
          >
            <Calendar size={14} />
            <span>New Event</span>
          </button>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => exportComplaintsToCSV(complaints)}
            title="Export all complaints to CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Stat Cards */}
      <div className="stat-grid">
        <StatCard
          label="Total Logged"
          value={totalCount}
          icon={ClipboardList}
          iconColor="var(--color-primary)"
          subtext="All society tickets"
        />
        <StatCard
          label="Pending Triage"
          value={pendingCount}
          icon={Clock}
          iconColor="var(--color-ochre)"
          subtext="Awaiting technician"
        />
        <StatCard
          label="In Progress"
          value={inProgressCount}
          icon={AlertCircle}
          iconColor="#4A6B5D"
          subtext="Under active repair"
        />
        <StatCard
          label="Resolved"
          value={resolvedCount}
          icon={CheckCircle2}
          iconColor="#2E7D32"
          subtext="Successfully closed"
        />
        <StatCard
          label="Resolution Rate"
          value={`${resolutionRate}%`}
          icon={Percent}
          iconColor="var(--color-primary)"
          subtext={`${resolvedCount} of ${totalCount} completed`}
        />
      </div>

      {/* 3. High-Priority Alerts Banner */}
      <HighPriorityAlerts
        complaints={complaints}
        onSelectComplaint={(c) => setSelectedComplaint(c)}
      />

      {/* 4. Live Charts */}
      <ComplaintCharts complaints={complaints} />

      {/* 5. Bottom Two-Column Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {/* Left Column: Recent Notices & Upcoming Events */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Noticeboard Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Megaphone size={16} style={{ color: 'var(--color-primary)' }} />
                <span>Noticeboard Announcements</span>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setActiveTab('announcements')}
              >
                <span>View All</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {announcements.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 0.95rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                      {item.category} {item.isPinned && '• Pinned Notice'}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {new Date(item.publishedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: '1.4' }}>
                    {item.content.length > 110 ? `${item.content.substring(0, 110)}...` : item.content}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Calendar size={16} style={{ color: 'var(--color-primary)' }} />
                <span>Upcoming Society Events</span>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setActiveTab('events')}
              >
                <span>Browse All</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {events.slice(0, 2).map((evt) => {
                const totalAttendees = (evt.registrations || []).reduce((acc, r) => acc + (Number(r.attendees) || 1), 0);
                const percent = Math.min(100, Math.round((totalAttendees / evt.capacity) * 100));

                return (
                  <div
                    key={evt.id}
                    style={{
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem 0.95rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                        {evt.category}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(evt.date).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {evt.time}
                      </span>
                    </div>

                    <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                      {evt.title}
                    </div>

                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                      <MapPin size={12} style={{ color: 'var(--color-accent)' }} />
                      <span>{evt.location}</span>
                    </div>

                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>
                        <span>Capacity Booked</span>
                        <span>{totalAttendees} / {evt.capacity} spots ({percent}%)</span>
                      </div>
                      <div style={{ height: 4, background: '#E5E3DC', borderRadius: 999, overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${percent}%`,
                            background: percent > 85 ? 'var(--color-accent)' : 'var(--color-primary)',
                            borderRadius: 999
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Activity Timeline Stream */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div className="card-title">
              <Activity size={16} style={{ color: 'var(--color-primary)' }} />
              <span>Society Activity Stream</span>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setActiveTab('notifications')}
            >
              <span>Activity Center</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', overflowY: 'auto', maxHeight: 480 }}>
            {notifications.slice(0, 8).map((notif) => (
              <div
                key={notif.id}
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.7rem 0.85rem',
                  display: 'flex',
                  gap: '0.7rem',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  if (notif.type === 'complaint') setActiveTab('complaints');
                  if (notif.type === 'event') setActiveTab('events');
                  if (notif.type === 'announcement') setActiveTab('announcements');
                }}
              >
                <div style={{
                  width: 30,
                  height: 30,
                  borderRadius: 'var(--radius-md)',
                  background: notif.type === 'complaint'
                    ? 'rgba(35, 72, 61, 0.1)'
                    : notif.type === 'event'
                    ? 'rgba(217, 130, 43, 0.1)'
                    : 'rgba(199, 123, 90, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: notif.type === 'complaint'
                    ? 'var(--color-primary)'
                    : notif.type === 'event'
                    ? 'var(--color-ochre)'
                    : 'var(--color-accent)',
                  flexShrink: 0
                }}>
                  {notif.type === 'complaint' && <ClipboardList size={15} />}
                  {notif.type === 'event' && <Calendar size={15} />}
                  {notif.type === 'announcement' && <Megaphone size={15} />}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {notif.title}
                    </span>
                    <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>
                    {notif.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Complaint Modal from Alerts */}
      {selectedComplaint && (
        <ComplaintDetailModal
          complaint={complaints.find(c => c.id === selectedComplaint.id) || selectedComplaint}
          isOpen={Boolean(selectedComplaint)}
          onClose={() => setSelectedComplaint(null)}
          onEdit={() => {
            setSelectedComplaint(null);
            setActiveTab('complaints');
          }}
          onDelete={(id) => {
            deleteComplaint(id);
            setSelectedComplaint(null);
          }}
          onQuickUpdateStatus={(id, updates) => {
            updateComplaint(id, updates);
            setSelectedComplaint(prev => ({ ...prev, ...updates }));
          }}
        />
      )}
    </div>
  );
}
