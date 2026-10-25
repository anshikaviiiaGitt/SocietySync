// src/components/announcements/AnnouncementFormModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Megaphone, CheckCircle, UploadCloud, X, Loader2 } from 'lucide-react';
import { ANNOUNCEMENT_CATEGORIES } from '../../data/constants';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';

export function AnnouncementFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null
}) {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const isEditing = Boolean(initialData && initialData.id);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Maintenance',
    content: '',
    author: 'Estate Management Office',
    isPinned: false,
    imageUrl: null
  });

  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        category: initialData.category || 'Maintenance',
        content: initialData.content || '',
        author: initialData.author || 'Estate Management Office',
        isPinned: Boolean(initialData.isPinned),
        imageUrl: initialData.imageUrl || null
      });
    } else {
      setFormData({
        title: '',
        category: 'Maintenance',
        content: '',
        author: 'Estate Management Office',
        isPinned: false,
        imageUrl: null
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await apiClient.uploadImage(file);
      setFormData(prev => ({ ...prev, imageUrl: res.url }));
      toast.success('Notice image attachment uploaded!');
    } catch (err) {
      toast.error(err.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required.';
    if (!formData.content.trim()) newErrors.content = 'Content is required.';
    if (!formData.author.trim()) newErrors.author = 'Author/Desk is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.warning('Please fill in the required fields.');
      return;
    }
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Announcement' : 'Post Community Notice'}
      icon={Megaphone}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">
              <span>Notice Title <span className="required-star">*</span></span>
            </label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="e.g. Scheduled Water Pipeline Maintenance - Tower A & B"
              value={formData.title}
              onChange={handleChange}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Notice Category</label>
              <select
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
              >
                {ANNOUNCEMENT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Publishing Authority / Officer</label>
              <input
                type="text"
                name="author"
                className="form-input"
                placeholder="e.g. Estate Management Office"
                value={formData.author}
                onChange={handleChange}
              />
              {errors.author && <span className="form-error">{errors.author}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Notice Body & Instructions <span className="required-star">*</span></span>
            </label>
            <textarea
              name="content"
              className="form-textarea"
              placeholder="Explain details, timing, affected towers, and required resident cooperation..."
              value={formData.content}
              onChange={handleChange}
              rows={4}
            />
            {errors.content && <span className="form-error">{errors.content}</span>}
          </div>

          {/* Optional Image Attachment */}
          <div className="form-group">
            <label className="form-label">
              <span>Circular Document / Photo Attachment (Optional)</span>
            </label>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
            />
            {!formData.imageUrl ? (
              <div
                className="image-upload-zone"
                onClick={() => fileInputRef.current?.click()}
                style={{ padding: '0.75rem' }}
              >
                {isUploading ? (
                  <Loader2 size={18} className="spin-animation" style={{ color: 'var(--color-primary)' }} />
                ) : (
                  <>
                    <UploadCloud size={18} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Click to upload notice attachment or circular photo</span>
                  </>
                )}
              </div>
            ) : (
              <div className="image-preview-card">
                <img src={formData.imageUrl} alt="Notice preview" className="image-preview-thumb" />
                <button
                  type="button"
                  className="image-remove-btn"
                  onClick={() => setFormData(prev => ({ ...prev, imageUrl: null }))}
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.75rem',
            background: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            marginTop: '0.25rem'
          }}>
            <input
              type="checkbox"
              id="isPinned"
              name="isPinned"
              checked={formData.isPinned}
              onChange={handleChange}
              style={{ width: 17, height: 17, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
            />
            <label htmlFor="isPinned" style={{ fontSize: '0.8rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
              <strong>Pin to Top of Noticeboard</strong>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Highlight this notice prominently for immediate resident awareness.
              </p>
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm">
            <CheckCircle size={14} />
            <span>{isEditing ? 'Save Changes' : 'Broadcast Notice'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
