// src/components/events/EventFormModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Calendar, CheckCircle, UploadCloud, X, Loader2 } from 'lucide-react';
import { EVENT_CATEGORIES, EVENT_LOCATIONS } from '../../data/constants';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';

export function EventFormModal({ isOpen, onClose, onSubmit, initialData = null }) {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const isEditing = Boolean(initialData && initialData.id);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Cultural & Festival',
    date: '',
    time: '6:00 PM - 9:00 PM',
    location: 'Central Grand Lawn & Amphitheatre',
    capacity: 100,
    organizer: 'Cultural Sub-Committee',
    description: '',
    coverImage: null
  });

  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        category: initialData.category || 'Cultural & Festival',
        date: initialData.date || '',
        time: initialData.time || '6:00 PM - 9:00 PM',
        location: initialData.location || 'Central Grand Lawn & Amphitheatre',
        capacity: initialData.capacity || 100,
        organizer: initialData.organizer || 'Cultural Sub-Committee',
        description: initialData.description || '',
        coverImage: initialData.coverImage || null
      });
    } else {
      const defaultDate = new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0];
      setFormData({
        title: '',
        category: 'Cultural & Festival',
        date: defaultDate,
        time: '6:00 PM - 9:00 PM',
        location: 'Central Grand Lawn & Amphitheatre',
        capacity: 100,
        organizer: 'Cultural Sub-Committee',
        description: '',
        coverImage: null
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      setFormData(prev => ({ ...prev, coverImage: res.url }));
      toast.success('Event cover image uploaded!');
    } catch (err) {
      toast.error(err.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Event title is required.';
    if (!formData.date) newErrors.date = 'Date is required.';
    if (!formData.time.trim()) newErrors.time = 'Time is required.';
    if (!formData.location.trim()) newErrors.location = 'Location is required.';
    if (!formData.capacity || Number(formData.capacity) <= 0) {
      newErrors.capacity = 'Capacity must be greater than 0.';
    }
    if (!formData.description.trim()) newErrors.description = 'Description is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.warning('Please fix the errors in the event form.');
      return;
    }
    onSubmit({
      ...formData,
      capacity: Number(formData.capacity)
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Event: ${initialData.title}` : 'Organize New Society Event'}
      icon={Calendar}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">
              <span>Event Title <span className="required-star">*</span></span>
            </label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="e.g. Diwali & Winter Community Gala 2026"
              value={formData.title}
              onChange={handleChange}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
              >
                {EVENT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Maximum Capacity <span className="required-star">*</span></span>
              </label>
              <input
                type="number"
                name="capacity"
                className="form-input"
                min="5"
                max="1000"
                value={formData.capacity}
                onChange={handleChange}
              />
              {errors.capacity && <span className="form-error">{errors.capacity}</span>}
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">
                <span>Event Date <span className="required-star">*</span></span>
              </label>
              <input
                type="date"
                name="date"
                className="form-input"
                value={formData.date}
                onChange={handleChange}
              />
              {errors.date && <span className="form-error">{errors.date}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Time & Schedule <span className="required-star">*</span></span>
              </label>
              <input
                type="text"
                name="time"
                className="form-input"
                placeholder="e.g. 6:30 PM - 10:00 PM"
                value={formData.time}
                onChange={handleChange}
              />
              {errors.time && <span className="form-error">{errors.time}</span>}
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Location / Amenity</label>
              <select
                name="location"
                className="form-select"
                value={formData.location}
                onChange={handleChange}
              >
                {EVENT_LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Host Committee / Lead</label>
              <input
                type="text"
                name="organizer"
                className="form-input"
                placeholder="e.g. Cultural Committee, Wellness Club"
                value={formData.organizer}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Cover Image Upload */}
          <div className="form-group">
            <label className="form-label">
              <span>Event Cover Photo (Optional)</span>
            </label>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
            />
            {!formData.coverImage ? (
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
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Click to upload event banner image</span>
                  </>
                )}
              </div>
            ) : (
              <div className="image-preview-card">
                <img src={formData.coverImage} alt="Cover preview" className="image-preview-thumb" />
                <button
                  type="button"
                  className="image-remove-btn"
                  onClick={() => setFormData(prev => ({ ...prev, coverImage: null }))}
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Event Details & Activities <span className="required-star">*</span></span>
            </label>
            <textarea
              name="description"
              className="form-textarea"
              placeholder="Describe event schedule, dress code, catering, or resident instructions..."
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm">
            <CheckCircle size={14} />
            <span>{isEditing ? 'Save Event' : 'Publish Event'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
