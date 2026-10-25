// src/components/announcements/AnnouncementList.jsx
import React, { useState, useMemo } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  Pin,
  Calendar,
  User,
  Trash2,
  Edit,
  Tag,
  AlertTriangle,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AnnouncementFormModal } from './AnnouncementFormModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ANNOUNCEMENT_CATEGORIES } from '../../data/constants';

export function AnnouncementList() {
  const {
    announcements,
    addAnnouncement,
    deleteAnnouncement
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(item => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches =
          (item.title || '').toLowerCase().includes(q) ||
          (item.content || '').toLowerCase().includes(q) ||
          (item.author || '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    });
  }, [announcements, searchTerm, categoryFilter]);

  const handleFormSubmit = async (data) => {
    await addAnnouncement(data);
    setEditingAnnouncement(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Digital Society Noticeboard
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Official management notices, maintenance circulars, and community advisories
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => {
            setEditingAnnouncement(null);
            setIsFormOpen(true);
          }}
        >
          <Plus size={15} />
          <span>Post Notice</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={15} className="search-icon-inside" />
          <input
            type="text"
            className="form-input"
            placeholder="Search circulars by keyword, topic, or publishing officer..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="form-select filter-select"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="ALL">All Categories</option>
          {ANNOUNCEMENT_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon-box">
            <Megaphone size={22} />
          </div>
          <div className="empty-title">No notices found</div>
          <div className="empty-desc">
            No notices match your current filters. Post a new announcement to notify residents.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredAnnouncements.map(item => (
            <div
              key={item.id}
              className="card"
              style={{
                borderLeft: item.isPinned ? '4px solid var(--color-primary)' : '1px solid var(--border-color)',
                background: item.isPinned ? '#FAF8F4' : '#FFFFFF'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {item.isPinned && (
                    <span className="badge badge-ai" style={{ background: 'rgba(35, 72, 61, 0.12)', color: 'var(--color-primary)' }}>
                      <Pin size={11} />
                      Pinned Circular
                    </span>
                  )}
                  <span className="badge badge-category">
                    {item.category}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Ref: {item.id}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <button
                    type="button"
                    className="btn btn-danger btn-icon"
                    style={{ width: 28, height: 28 }}
                    title="Delete Notice"
                    onClick={() => setDeletingId(item.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.5rem', marginBottom: '0.35rem' }}>
                {item.title}
              </h3>

              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {item.content}
              </p>

              {item.imageUrl && (
                <div style={{ marginTop: '0.65rem' }}>
                  <img
                    src={item.imageUrl}
                    alt="Notice attachment"
                    style={{ maxHeight: 160, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                    onClick={() => setLightboxImg(item.imageUrl)}
                    title="Click to view full attachment"
                  />
                </div>
              )}

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginTop: '0.85rem',
                paddingTop: '0.65rem',
                borderTop: '1px solid var(--border-color)',
                fontSize: '0.74rem',
                color: 'var(--text-muted)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <User size={13} style={{ color: 'var(--color-primary)' }} />
                  <span>Authorized By: <strong>{item.author}</strong></span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={13} />
                  <span>Published: {new Date(item.publishedAt).toLocaleDateString([], { dateStyle: 'medium' })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox for Notice Attachments */}
      {lightboxImg && (
        <div className="lightbox-backdrop" onClick={() => setLightboxImg(null)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Notice Circular Attachment</span>
              <button type="button" className="btn btn-outline btn-icon" onClick={() => setLightboxImg(null)}>
                <X size={16} />
              </button>
            </div>
            <img src={lightboxImg} alt="Attachment" className="lightbox-img" />
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <AnnouncementFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingAnnouncement(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={editingAnnouncement}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) deleteAnnouncement(deletingId);
        }}
        title="Remove Noticeboard Announcement"
        message="Are you sure you want to permanently delete this notice? It will be removed from all resident dashboards."
        confirmText="Yes, Remove Notice"
        confirmVariant="danger"
      />
    </div>
  );
}
