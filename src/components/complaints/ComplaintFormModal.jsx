// src/components/complaints/ComplaintFormModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import {
  FileText,
  Sparkles,
  UploadCloud,
  Image as ImageIcon,
  X,
  CheckCircle,
  AlertTriangle,
  Wand2,
  Loader2
} from 'lucide-react';
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_PRIORITIES,
  COMPLAINT_STATUSES,
  STAFF_MEMBERS
} from '../../data/constants';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';

export function ComplaintFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  residentsList = []
}) {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const isEditing = Boolean(initialData && initialData.id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    residentName: '',
    flatNumber: '',
    category: 'Plumbing',
    priority: 'Medium',
    status: 'Pending',
    assignedStaff: 'Rajesh Patel',
    imageUrl: null,
    resolutionNotes: ''
  });

  const [errors, setErrors] = useState({});
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [aiNote, setAiNote] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        residentName: initialData.residentName || '',
        flatNumber: initialData.flatNumber || '',
        category: initialData.category || 'Plumbing',
        priority: initialData.priority || 'Medium',
        status: initialData.status || 'Pending',
        assignedStaff: initialData.assignedStaff || 'Rajesh Patel',
        imageUrl: initialData.imageUrl || null,
        resolutionNotes: initialData.resolutionNotes || ''
      });
      if (initialData.aiMode) {
        setAiNote({
          mode: initialData.aiMode,
          confidence: initialData.aiConfidence
        });
      } else {
        setAiNote(null);
      }
    } else {
      setFormData({
        title: '',
        description: '',
        residentName: '',
        flatNumber: '',
        category: 'Plumbing',
        priority: 'Medium',
        status: 'Pending',
        assignedStaff: 'Rajesh Patel',
        imageUrl: null,
        resolutionNotes: ''
      });
      setAiNote(null);
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

  const handleResidentSelect = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;
    const res = residentsList.find(r => r.id === selectedId);
    if (res) {
      setFormData(prev => ({
        ...prev,
        residentName: res.name,
        flatNumber: res.flatNumber
      }));
      setErrors(prev => ({ ...prev, residentName: null, flatNumber: null }));
    }
  };

  // Image Upload Handler
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const res = await apiClient.uploadImage(file);
      setFormData(prev => ({ ...prev, imageUrl: res.url }));
      toast.success('Image attached and saved to server successfully!');
    } catch (err) {
      toast.error(err.message || 'Image upload failed');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: null }));
  };

  // In-form AI Auto-Triage
  const handleRunAiTriage = async () => {
    if (!formData.title.trim() && !formData.description.trim()) {
      toast.warning('Please enter a title or description first so AI can analyze it.');
      return;
    }

    setIsAiLoading(true);
    try {
      const result = await apiClient.analyzeComplaint(formData.title, formData.description);
      setFormData(prev => ({
        ...prev,
        category: result.category || prev.category,
        priority: result.priority || prev.priority,
        assignedStaff: result.suggestedStaff || prev.assignedStaff
      }));
      setAiNote({
        mode: result.mode,
        sourceLabel: result.model || result.mode,
        summary: result.summary,
        actions: result.recommendedActions
      });
      toast.success(`AI suggested: ${result.category} (${result.priority} Priority)`);
    } catch (err) {
      toast.error('AI assistance failed: ' + err.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required.';
    if (!formData.description.trim()) newErrors.description = 'Description is required.';
    if (!formData.residentName.trim()) newErrors.residentName = 'Resident name is required.';
    if (!formData.flatNumber.trim()) newErrors.flatNumber = 'Flat number is required.';
    if (formData.status === 'Resolved' && !formData.resolutionNotes.trim()) {
      newErrors.resolutionNotes = 'Please provide resolution notes before marking as Resolved.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.warning('Please fix the errors in the form.');
      return;
    }
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Complaint #${initialData.id}` : 'Register New Complaint'}
      icon={FileText}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {/* AI Assistance Header */}
          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Intelligent Triage Assistant
                </span>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Auto-classifies category, urgency level, and dispatches technician.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleRunAiTriage}
              disabled={isAiLoading}
            >
              {isAiLoading ? (
                <>
                  <Loader2 size={13} className="spin-animation" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  <span>Classify with AI</span>
                </>
              )}
            </button>
          </div>

          {aiNote && (
            <div style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.6rem 0.8rem',
              marginBottom: '1rem',
              fontSize: '0.75rem',
              color: 'var(--color-primary)'
            }}>
              <strong>Triage Mode:</strong> {aiNote.sourceLabel} • {aiNote.summary || 'Classification verified.'}
            </div>
          )}

          {/* Resident Details */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">
                <span>Resident Name <span className="required-star">*</span></span>
                {residentsList.length > 0 && !isEditing && (
                  <select
                    className="form-select"
                    style={{ width: 'auto', padding: '0.15rem 0.4rem', fontSize: '0.72rem' }}
                    onChange={handleResidentSelect}
                    defaultValue=""
                  >
                    <option value="" disabled>Select Resident</option>
                    {residentsList.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.flatNumber})
                      </option>
                    ))}
                  </select>
                )}
              </label>
              <input
                type="text"
                name="residentName"
                className="form-input"
                placeholder="e.g. Vikram Malhotra"
                value={formData.residentName}
                onChange={handleChange}
              />
              {errors.residentName && <span className="form-error">{errors.residentName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Flat / Unit Number <span className="required-star">*</span></span>
              </label>
              <input
                type="text"
                name="flatNumber"
                className="form-input"
                placeholder="e.g. B-402"
                value={formData.flatNumber}
                onChange={handleChange}
              />
              {errors.flatNumber && <span className="form-error">{errors.flatNumber}</span>}
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">
              <span>Complaint Title <span className="required-star">*</span></span>
            </label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="e.g. Water pipe leakage in bathroom ceiling"
              value={formData.title}
              onChange={handleChange}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">
              <span>Detailed Description <span className="required-star">*</span></span>
            </label>
            <textarea
              name="description"
              className="form-textarea"
              placeholder="Explain the issue, location, duration, and safety considerations..."
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          {/* Image Attachment Upload */}
          <div className="form-group">
            <label className="form-label">
              <span>Photo / Evidence Attachment (JPEG, PNG, WebP — Max 5MB)</span>
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
              >
                {isUploadingImage ? (
                  <>
                    <Loader2 size={20} className="spin-animation" style={{ color: 'var(--color-primary)' }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Uploading image to server...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={22} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Click to upload photo evidence
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Supports JPEG, PNG, WebP up to 5MB. Persistently stored on server.
                    </span>
                  </>
                )}
              </div>
            ) : (
              <div className="image-preview-card">
                <img
                  src={formData.imageUrl}
                  alt="Complaint attachment"
                  className="image-preview-thumb"
                  title="Attached evidence photo"
                />
                <button
                  type="button"
                  className="image-remove-btn"
                  onClick={handleRemoveImage}
                  title="Remove image"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Category & Priority */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
              >
                {COMPLAINT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                name="priority"
                className="form-select"
                value={formData.priority}
                onChange={handleChange}
              >
                {COMPLAINT_PRIORITIES.map(prio => (
                  <option key={prio} value={prio}>{prio}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status & Assigned Staff */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                {COMPLAINT_STATUSES.map(stat => (
                  <option key={stat} value={stat}>{stat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Staff / Contractor</label>
              <select
                name="assignedStaff"
                className="form-select"
                value={formData.assignedStaff}
                onChange={handleChange}
              >
                {STAFF_MEMBERS.map(staff => (
                  <option key={staff.id} value={staff.name}>
                    {staff.name} ({staff.role})
                  </option>
                ))}
                <option value="Unassigned">Unassigned</option>
              </select>
            </div>
          </div>

          {/* Resolution Notes */}
          <div className="form-group">
            <label className="form-label">
              <span>Resolution Notes</span>
              {formData.status === 'Resolved' && (
                <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                  * Required for resolving ticket
                </span>
              )}
            </label>
            <textarea
              name="resolutionNotes"
              className="form-textarea"
              placeholder={formData.status === 'Resolved' 
                ? 'Explain what technician did, parts replaced, and verification test...' 
                : 'Technician comments or follow-up notes...'}
              value={formData.resolutionNotes}
              onChange={handleChange}
              rows={2}
            />
            {errors.resolutionNotes && <span className="form-error">{errors.resolutionNotes}</span>}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm">
            <CheckCircle size={14} />
            <span>{isEditing ? 'Save Changes' : 'Submit Complaint'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
