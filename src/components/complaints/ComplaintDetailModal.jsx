// src/components/complaints/ComplaintDetailModal.jsx
import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import {
  FileText,
  Clock,
  User,
  Home,
  CheckCircle2,
  AlertCircle,
  Edit,
  Trash2,
  Calendar,
  History,
  PhoneCall,
  ShieldCheck,
  Image as ImageIcon,
  Maximize2,
  X
} from 'lucide-react';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { STAFF_MEMBERS } from '../../data/constants';

export function ComplaintDetailModal({
  complaint,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onQuickUpdateStatus
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [quickResolutionText, setQuickResolutionText] = useState('');
  const [isResolvingInline, setIsResolvingInline] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!complaint) return null;

  const staffObj = STAFF_MEMBERS.find(s => s.name === complaint.assignedStaff) || {
    name: complaint.assignedStaff || 'Unassigned',
    role: 'Maintenance Desk',
    phone: 'Ext 100'
  };

  const handleResolveSubmit = (e) => {
    e.preventDefault();
    if (!quickResolutionText.trim()) return;
    onQuickUpdateStatus(complaint.id, {
      status: 'Resolved',
      resolutionNotes: quickResolutionText.trim()
    });
    setIsResolvingInline(false);
    setQuickResolutionText('');
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Complaint Details #${complaint.id}`}
        icon={FileText}
        size="lg"
      >
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header Card */}
          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 700 }}>
                  {complaint.id}
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                  {complaint.title}
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                <StatusBadge status={complaint.status} />
                <PriorityBadge priority={complaint.priority} />
                <CategoryBadge category={complaint.category} />
              </div>
            </div>

            {/* Resident & Timestamp metadata row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-color)',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block' }}>Resident:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {complaint.residentName} (Flat {complaint.flatNumber})
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block' }}>Assigned Staff:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {staffObj.name} ({staffObj.phone})
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block' }}>Reported:</span>
                <span>
                  {new Date(complaint.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block' }}>Last Activity:</span>
                <span>
                  {new Date(complaint.updatedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
              Full Issue Description
            </h4>
            <div style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.9rem 1.1rem',
              color: 'var(--text-primary)',
              fontSize: '0.86rem',
              lineHeight: 1.6
            }}>
              {complaint.description}
            </div>
          </div>

          {/* Attached Photo Evidence (With Lightbox support) */}
          {complaint.imageUrl && (
            <div>
              <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ImageIcon size={14} style={{ color: 'var(--color-primary)' }} />
                <span>Attached Photo Evidence</span>
              </h4>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.5rem',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer'
                }}
                onClick={() => setIsLightboxOpen(true)}
              >
                <img
                  src={complaint.imageUrl}
                  alt="Complaint photo"
                  style={{ width: 100, height: 75, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Maximize2 size={13} />
                    Click to view full-size photo
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Stored persistently on backend server
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Resolution Notes */}
          {complaint.resolutionNotes && (
            <div>
              <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
                Resolution Findings & Closure Notes
              </h4>
              <div style={{
                background: '#E8F5E9',
                border: '1px solid #C8E6C9',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                color: '#1E4620',
                fontSize: '0.84rem',
                lineHeight: 1.5
              }}>
                {complaint.resolutionNotes}
              </div>
            </div>
          )}

          {/* Inline Quick Resolve Form */}
          {isResolvingInline && (
            <form onSubmit={handleResolveSubmit} style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.9rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem'
            }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                Resolution Notes to Close Ticket #{complaint.id}:
              </label>
              <textarea
                className="form-textarea"
                placeholder="e.g. Technician replaced leaking fixture washer, pressure-tested line, verified zero seepage."
                value={quickResolutionText}
                onChange={e => setQuickResolutionText(e.target.value)}
                rows={2}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsResolvingInline(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                >
                  <CheckCircle2 size={14} />
                  <span>Mark Ticket as Resolved</span>
                </button>
              </div>
            </form>
          )}

          {/* Activity Timeline */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <History size={15} style={{ color: 'var(--color-primary)' }} />
              <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Complaint Activity Lifecycle
              </h4>
            </div>

            <div className="timeline">
              {(complaint.history || []).map((step, idx) => (
                <div key={step.id || idx} className="timeline-item">
                  <div className="timeline-dot" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="timeline-action">{step.action}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>•</span>
                    <span className="timeline-actor">{step.actor}</span>
                  </div>
                  {step.note && <div className="timeline-note">{step.note}</div>}
                  <div className="timeline-time">
                    {new Date(step.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {complaint.status !== 'In Progress' && complaint.status !== 'Resolved' && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  onQuickUpdateStatus(complaint.id, { status: 'In Progress' });
                }}
              >
                <AlertCircle size={13} style={{ color: 'var(--color-primary)' }} />
                <span>Mark In Progress</span>
              </button>
            )}

            {complaint.status !== 'Resolved' && !isResolvingInline && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                onClick={() => setIsResolvingInline(true)}
              >
                <CheckCircle2 size={13} />
                <span>Quick Resolve</span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                onClose();
                onEdit(complaint);
              }}
            >
              <Edit size={13} />
              <span>Edit Details</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Lightbox for Full-Size Image Viewing */}
      {isLightboxOpen && complaint.imageUrl && (
        <div className="lightbox-backdrop" onClick={() => setIsLightboxOpen(false)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Evidence Photo: Complaint #{complaint.id}
              </span>
              <button
                type="button"
                className="btn btn-outline btn-icon"
                onClick={() => setIsLightboxOpen(false)}
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
            <img
              src={complaint.imageUrl}
              alt="Full size evidence"
              className="lightbox-img"
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          onDelete(complaint.id);
          onClose();
        }}
        title={`Delete Complaint #${complaint.id}`}
        message={`Are you sure you want to permanently delete complaint "${complaint.title}" filed by ${complaint.residentName}? This cannot be undone.`}
        confirmText="Yes, Delete Record"
        confirmVariant="danger"
      />
    </>
  );
}
