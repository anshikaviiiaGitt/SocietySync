// src/components/complaints/ComplaintList.jsx
import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  Clock,
  User,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../common/Badge';
import { ComplaintDetailModal } from './ComplaintDetailModal';
import { ComplaintFormModal } from './ComplaintFormModal';
import { exportComplaintsToCSV } from '../../services/csvExport';
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_PRIORITIES,
  COMPLAINT_STATUSES
} from '../../data/constants';

export function ComplaintList({ initialPreFill = null, onClearPreFill }) {
  const {
    complaints,
    residents,
    addComplaint,
    updateComplaint,
    deleteComplaint
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  // Modal states
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(Boolean(initialPreFill));
  const [editingComplaint, setEditingComplaint] = useState(initialPreFill);

  React.useEffect(() => {
    if (initialPreFill) {
      setEditingComplaint(initialPreFill);
      setIsFormOpen(true);
      if (onClearPreFill) onClearPreFill();
    }
  }, [initialPreFill, onClearPreFill]);

  // Filtering & Sorting
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matches =
          (c.title || '').toLowerCase().includes(query) ||
          (c.description || '').toLowerCase().includes(query) ||
          (c.residentName || '').toLowerCase().includes(query) ||
          (c.flatNumber || '').toLowerCase().includes(query) ||
          (c.assignedStaff || '').toLowerCase().includes(query) ||
          (c.id || '').toLowerCase().includes(query);
        if (!matches) return false;
      }

      if (categoryFilter !== 'ALL' && c.category !== categoryFilter) return false;
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (priorityFilter !== 'ALL' && c.priority !== priorityFilter) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === 'priority') {
        const weights = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        return (weights[b.priority] || 0) - (weights[a.priority] || 0);
      }
      if (sortBy === 'status') {
        const order = { 'Pending': 1, 'In Progress': 2, 'Resolved': 3 };
        return (order[a.status] || 0) - (order[b.status] || 0);
      }
      return 0;
    });
  }, [complaints, searchTerm, categoryFilter, statusFilter, priorityFilter, sortBy]);

  const hasActiveFilters =
    searchTerm !== '' ||
    categoryFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    sortBy !== 'newest';

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('ALL');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setSortBy('newest');
  };

  const handleFormSubmit = async (data) => {
    if (editingComplaint && editingComplaint.id) {
      await updateComplaint(editingComplaint.id, data);
    } else {
      await addComplaint(data);
    }
    setEditingComplaint(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Complaints & Maintenance Desk
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing {filteredComplaints.length} of {complaints.length} tickets recorded in SQLite database
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => exportComplaintsToCSV(filteredComplaints)}
            title="Download CSV export of currently filtered complaints"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              setEditingComplaint(null);
              setIsFormOpen(true);
            }}
          >
            <Plus size={15} />
            <span>Log Complaint</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={15} className="search-icon-inside" />
          <input
            type="text"
            className="form-input"
            placeholder="Search tickets by title, resident, flat, or staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category filter */}
        <select
          className="form-select filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="ALL">All Categories</option>
          {COMPLAINT_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Status filter */}
        <select
          className="form-select filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          {COMPLAINT_STATUSES.map(stat => (
            <option key={stat} value={stat}>{stat}</option>
          ))}
        </select>

        {/* Priority filter */}
        <select
          className="form-select filter-select"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="ALL">All Priorities</option>
          {COMPLAINT_PRIORITIES.map(prio => (
            <option key={prio} value={prio}>{prio}</option>
          ))}
        </select>

        {/* Sort by */}
        <select
          className="form-select filter-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="priority">Highest Priority</option>
          <option value="status">By Status</option>
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={resetFilters}
            title="Reset filters to default"
          >
            <RotateCcw size={12} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Complaints Table */}
      {filteredComplaints.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon-box">
            <AlertTriangle size={22} />
          </div>
          <div className="empty-title">No complaints match your criteria</div>
          <div className="empty-desc">
            Try adjusting your search terms or clearing active filters to see more results.
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={resetFilters}
              style={{ marginTop: '0.4rem' }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Subject & Description</th>
                <th>Resident</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                    {c.id}
                  </td>
                  <td style={{ maxWidth: 300 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span
                        style={{ fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
                        onClick={() => setSelectedComplaint(c)}
                        title={c.title}
                      >
                        {c.title}
                      </span>
                      {c.imageUrl && (
                        <span title="Evidence photo attached" style={{ color: 'var(--color-primary)', display: 'inline-flex' }}>
                          <ImageIcon size={13} />
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 280, marginTop: 2 }}>
                      {c.description}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.residentName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      Flat {c.flatNumber}
                    </div>
                  </td>
                  <td>
                    <CategoryBadge category={c.category} />
                  </td>
                  <td>
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {c.assignedStaff || 'Unassigned'}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-icon"
                        title="View Full Details & Lifecycle"
                        onClick={() => setSelectedComplaint(c)}
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-icon"
                        title="Edit Complaint"
                        onClick={() => {
                          setEditingComplaint(c);
                          setIsFormOpen(true);
                        }}
                      >
                        <Edit size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <ComplaintDetailModal
          complaint={complaints.find(c => c.id === selectedComplaint.id) || selectedComplaint}
          isOpen={Boolean(selectedComplaint)}
          onClose={() => setSelectedComplaint(null)}
          onEdit={(comp) => {
            setEditingComplaint(comp);
            setIsFormOpen(true);
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

      {/* Complaint Create / Edit Form Modal */}
      {isFormOpen && (
        <ComplaintFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingComplaint(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={editingComplaint}
          residentsList={residents}
        />
      )}
    </div>
  );
}
