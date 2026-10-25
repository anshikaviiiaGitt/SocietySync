// src/components/notifications/NotificationCenter.jsx
import React, { useState, useMemo } from 'react';
import {
  Bell,
  CheckCheck,
  ClipboardList,
  Calendar,
  Megaphone,
  CheckCircle,
  Filter,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function NotificationCenter() {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setActiveTab
  } = useApp();

  const [filterType, setFilterType] = useState('ALL');

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (filterType === 'UNREAD') return !n.read;
      if (filterType !== 'ALL') return n.type === filterType;
      return true;
    });
  }, [notifications, filterType]);

  const handleNotificationClick = (notif) => {
    markNotificationAsRead(notif.id);
    if (notif.type === 'complaint') {
      setActiveTab('complaints');
    } else if (notif.type === 'event') {
      setActiveTab('events');
    } else if (notif.type === 'announcement') {
      setActiveTab('announcements');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Activity Center & Notifications
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Real-time event alerts for maintenance tickets, event RSVPs, and noticeboard circulars
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={markAllNotificationsAsRead}
          >
            <CheckCheck size={14} />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Scope Disclaimer */}
      <div style={{
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        fontSize: '0.76rem',
        color: 'var(--text-secondary)'
      }}>
        <Info size={15} style={{ color: 'var(--color-primary)' }} />
        <span>
          <strong>System Notice:</strong> In-app notifications track authentic application updates stored persistently in the SQLite database. External SMS/push gateways require cloud provider credentials.
        </span>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`btn btn-sm ${filterType === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilterType('ALL')}
        >
          All Activity ({notifications.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${filterType === 'UNREAD' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilterType('UNREAD')}
        >
          Unread ({unreadCount})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${filterType === 'complaint' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilterType('complaint')}
        >
          Complaints
        </button>
        <button
          type="button"
          className={`btn btn-sm ${filterType === 'event' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilterType('event')}
        >
          Events
        </button>
        <button
          type="button"
          className={`btn btn-sm ${filterType === 'announcement' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilterType('announcement')}
        >
          Notices
        </button>
      </div>

      {/* Notification Stream */}
      {filteredNotifications.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon-box">
            <Bell size={22} />
          </div>
          <div className="empty-title">No notifications</div>
          <div className="empty-desc">
            You're all caught up! New alerts will appear here as tickets are resolved or events booked.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {filteredNotifications.map(notif => {
            const isUnread = !notif.read;

            return (
              <div
                key={notif.id}
                className="card"
                style={{
                  padding: '0.85rem 1.15rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                  cursor: 'pointer',
                  borderLeft: isUnread ? '3px solid var(--color-primary)' : '1px solid var(--border-color)',
                  background: isUnread ? '#FAF8F4' : '#FFFFFF'
                }}
                onClick={() => handleNotificationClick(notif)}
              >
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 'var(--radius-md)',
                  background: notif.type === 'complaint'
                    ? 'rgba(35, 72, 61, 0.08)'
                    : notif.type === 'event'
                    ? 'rgba(217, 130, 43, 0.08)'
                    : 'rgba(199, 123, 90, 0.08)',
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
                  {notif.type === 'complaint' && <ClipboardList size={16} />}
                  {notif.type === 'event' && <Calendar size={16} />}
                  {notif.type === 'announcement' && <Megaphone size={16} />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                        {notif.title}
                      </span>
                      {isUnread && (
                        <span style={{
                          fontSize: '0.65rem',
                          background: 'var(--color-primary)',
                          color: '#FFFFFF',
                          padding: '0.1rem 0.4rem',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: 700
                        }}>
                          NEW
                        </span>
                      )}
                    </div>

                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {new Date(notif.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.45 }}>
                    {notif.message}
                  </p>

                  <div style={{ marginTop: '0.35rem', fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                    Jump to related section →
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
