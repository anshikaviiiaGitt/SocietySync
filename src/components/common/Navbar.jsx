// src/components/common/Navbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Bell,
  Sparkles,
  Plus,
  CheckCheck,
  Database,
  ExternalLink,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function Navbar({ onMobileMenuToggle, onOpenNewComplaint }) {
  const {
    activeTab,
    setActiveTab,
    backendStatus,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useApp();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const tabTitles = {
    'dashboard': 'Executive Overview',
    'complaints': 'Complaints Management Desk',
    'ai-assistant': 'AI Complaint Triage Diagnostic',
    'analytics': 'Society Analytics & SLA Performance',
    'events': 'Events & Community Registrations',
    'announcements': 'Digital Society Noticeboard',
    'residents': 'Resident & Occupancy Directory',
    'notifications': 'Activity Center & Alerts'
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    if (showNotifDropdown) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showNotifDropdown]);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onMobileMenuToggle}
          aria-label="Toggle navigation menu"
        >
          <Menu size={18} />
        </button>

        <h1 className="page-title-heading">
          {tabTitles[activeTab] || 'Dashboard'}
        </h1>
      </div>

      <div className="topbar-right">
        {/* Backend & AI Mode Status Pill */}
        <button
          type="button"
          className="ai-status-pill"
          onClick={() => setShowAiModal(true)}
          title="Click to view Backend & AI system details"
        >
          <span className={`ai-status-dot ${backendStatus.aiConfigured ? '' : 'offline'}`} />
          <Sparkles size={13} />
          <span className="ai-label-full">
            {backendStatus.aiConfigured ? 'Gemini 1.5 Cloud AI' : 'Rule-Based Heuristic (Offline)'}
          </span>
        </button>

        {/* Notifications Icon with Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            type="button"
            className="topbar-action-icon"
            onClick={() => setShowNotifDropdown(prev => !prev)}
            aria-label="View notifications"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="notif-badge-bubble">{unreadCount}</span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="notif-dropdown">
              <div className="notif-dropdown-header">
                <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                  Notifications ({unreadCount} unread)
                </span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                    onClick={markAllNotificationsAsRead}
                  >
                    <CheckCheck size={12} />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No notifications yet.
                  </div>
                ) : (
                  notifications.slice(0, 6).map((notif) => (
                    <div
                      key={notif.id}
                      className={`notif-item ${!notif.read ? 'unread' : ''}`}
                      onClick={() => {
                        markNotificationAsRead(notif.id);
                        if (notif.type === 'complaint') setActiveTab('complaints');
                        if (notif.type === 'event') setActiveTab('events');
                        if (notif.type === 'announcement') setActiveTab('announcements');
                        setShowNotifDropdown(false);
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div className="notif-item-title">{notif.title}</div>
                        <div className="notif-item-msg">{notif.message}</div>
                        <div className="notif-item-time">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      {!notif.read && (
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent)', marginTop: 5 }} />
                      )}
                    </div>
                  ))
                )}
              </div>

              <div style={{ padding: '0.65rem 1rem', borderTop: '1px solid var(--border-color)', textAlign: 'center', background: 'var(--bg-subtle)' }}>
                <button
                  type="button"
                  style={{ fontSize: '0.76rem', color: 'var(--color-primary)', fontWeight: 600 }}
                  onClick={() => {
                    setActiveTab('notifications');
                    setShowNotifDropdown(false);
                  }}
                >
                  View All Activity & Timeline →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick New Complaint Button */}
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onOpenNewComplaint}
        >
          <Plus size={15} />
          <span>New Complaint</span>
        </button>
      </div>

      {/* Backend & AI Status Modal */}
      {showAiModal && (
        <div className="modal-backdrop" onClick={() => setShowAiModal(false)}>
          <div className="modal-box modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Database size={17} style={{ color: 'var(--color-primary)' }} />
                <span>Backend & AI System Status</span>
              </div>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Persistent Database:</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: 2 }}>
                  {backendStatus.database}
                </div>
              </div>

              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Triage Engine:</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: backendStatus.aiConfigured ? 'var(--color-primary)' : 'var(--color-ochre)', marginTop: 2 }}>
                  {backendStatus.activeMode}
                </div>
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {backendStatus.aiConfigured
                  ? 'Your backend has a configured GEMINI_API_KEY. Resident complaints are analyzed via Google Gemini 1.5 Flash cloud API.'
                  : 'No external API key is currently configured. SocietySync is operating with its built-in rule-based NLP classifier, ensuring zero external dependencies and guaranteed privacy.'}
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAiModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
