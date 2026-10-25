// src/components/common/Sidebar.jsx
import React, { useState } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Sparkles,
  BarChart3,
  CalendarDays,
  Megaphone,
  Users,
  Bell,
  RefreshCw,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SOCIETY_INFO } from '../../data/constants';
import { ConfirmDialog } from './ConfirmDialog';

export function Sidebar({ isOpen, onClose }) {
  const {
    activeTab,
    setActiveTab,
    complaints,
    notifications,
    handleResetData
  } = useApp();

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Compute pending complaints count
  const pendingCount = complaints.filter(c => c.status === 'Pending').length;
  const unreadNotifCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'complaints', label: 'Complaints Desk', icon: ClipboardList, badge: pendingCount > 0 ? `${pendingCount} pending` : null },
    { id: 'ai-assistant', label: 'AI Complaint Triage', icon: Sparkles, isAi: true },
    { id: 'analytics', label: 'Analytics & SLA', icon: BarChart3 },
    { id: 'events', label: 'Events & RSVPs', icon: CalendarDays },
    { id: 'announcements', label: 'Noticeboard', icon: Megaphone },
    { id: 'residents', label: 'Resident Directory', icon: Users },
    { id: 'notifications', label: 'Activity Center', icon: Bell, badge: unreadNotifCount > 0 ? unreadNotifCount : null }
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (onClose) onClose();
  };

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-wrapper">
            <div className="brand-icon-box">
              <Building2 size={20} />
            </div>
            <div className="brand-text-col">
              <span className="brand-title">SocietySync</span>
              <span className="brand-subtitle">Smart Community OS</span>
            </div>
          </div>
        </div>

        <div className="society-badge-pill">
          <div className="society-name-text">
            <ShieldCheck size={14} style={{ color: 'var(--color-primary)' }} />
            <span>{SOCIETY_INFO.name}</span>
          </div>
          <span className="society-sub-text">
            {SOCIETY_INFO.totalFlats} Flats • {SOCIETY_INFO.totalWings} Towers
          </span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <Icon size={17} style={{ color: isActive ? 'var(--color-primary)' : 'var(--text-muted)' }} />
                <span>{item.label}</span>
                {item.isAi && (
                  <span className="nav-badge active-badge" style={{ fontSize: '0.65rem' }}>
                    AI
                  </span>
                )}
                {item.badge && !item.isAi && (
                  <span className={`nav-badge ${isActive ? 'active-badge' : ''}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className="reset-demo-btn"
            onClick={() => setShowResetConfirm(true)}
            title="Restore sample records in SQLite and local storage"
          >
            <RefreshCw size={13} />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </aside>

      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetData}
        title="Reset Demo Records"
        message="This will reset all complaints, announcements, events, registrations, and notifications back to the initial sample dataset in your SQLite database. Proceed?"
        confirmText="Reset All Data"
        confirmVariant="danger"
        icon={RefreshCw}
      />
    </>
  );
}
