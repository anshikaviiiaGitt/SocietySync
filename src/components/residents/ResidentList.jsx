// src/components/residents/ResidentList.jsx
import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Home,
  Phone,
  Mail,
  Car,
  Eye,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ResidentDetailModal } from './ResidentDetailModal';
import { SOCIETY_INFO } from '../../data/constants';

export function ResidentList({ onStartComplaintForResident }) {
  const { residents, complaints } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [wingFilter, setWingFilter] = useState('ALL');
  const [occupancyFilter, setOccupancyFilter] = useState('ALL');
  const [selectedResident, setSelectedResident] = useState(null);

  const filteredResidents = useMemo(() => {
    return residents.filter(r => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches =
          (r.name || '').toLowerCase().includes(q) ||
          (r.flatNumber || '').toLowerCase().includes(q) ||
          (r.email || '').toLowerCase().includes(q) ||
          (r.vehicleNo || '').toLowerCase().includes(q) ||
          (r.phone || '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (wingFilter !== 'ALL' && r.wing !== wingFilter) return false;
      if (occupancyFilter !== 'ALL' && r.occupancyType !== occupancyFilter) return false;
      return true;
    });
  }, [residents, searchTerm, wingFilter, occupancyFilter]);

  const getActiveComplaintCount = (flatNumber, name) => {
    const cleanFlat = (flatNumber || '').trim().toUpperCase();
    const cleanName = (name || '').trim().toLowerCase();
    return complaints.filter(c => {
      const isMatch =
        (c.flatNumber || '').trim().toUpperCase() === cleanFlat ||
        (c.residentName || '').trim().toLowerCase() === cleanName;
      return isMatch && c.status !== 'Resolved';
    }).length;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Resident & Occupancy Directory
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Resident registry with initials avatars, occupancy classification, parking identifiers, and active tickets
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={15} className="search-icon-inside" />
          <input
            type="text"
            className="form-input"
            placeholder="Search residents by name, flat (e.g. B-402), email, or vehicle..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="form-select filter-select"
          value={wingFilter}
          onChange={e => setWingFilter(e.target.value)}
        >
          <option value="ALL">All Towers</option>
          {SOCIETY_INFO.wings.map(w => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>

        <select
          className="form-select filter-select"
          value={occupancyFilter}
          onChange={e => setOccupancyFilter(e.target.value)}
        >
          <option value="ALL">All Occupancy</option>
          <option value="Owner">Owners</option>
          <option value="Tenant">Tenants</option>
        </select>
      </div>

      {/* Resident Table */}
      {filteredResidents.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon-box">
            <Users size={22} />
          </div>
          <div className="empty-title">No residents match search criteria</div>
          <div className="empty-desc">
            Try adjusting your search query or reset the filters.
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Flat / Unit</th>
                <th>Resident</th>
                <th>Tower & Floor</th>
                <th>Occupancy</th>
                <th>Contact Details</th>
                <th>Vehicle Reg</th>
                <th>Active Tickets</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResidents.map(r => {
                const activeCount = getActiveComplaintCount(r.flatNumber, r.name);
                const initials = r.name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('');

                return (
                  <tr key={r.id}>
                    <td>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        color: 'var(--color-primary)',
                        background: 'var(--bg-subtle)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)'
                      }}>
                        {r.flatNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div className="resident-avatar" style={{ width: 30, height: 30, fontSize: '0.74rem' }}>
                          {initials}
                        </div>
                        <div
                          style={{ fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
                          onClick={() => setSelectedResident(r)}
                        >
                          {r.name}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {r.wing} (Fl. {r.floor})
                    </td>
                    <td>
                      <span className={`badge ${r.occupancyType === 'Owner' ? 'badge-resolved' : 'badge-pending'}`}>
                        {r.occupancyType}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>{r.phone}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.email}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                        {r.vehicleNo}
                      </span>
                    </td>
                    <td>
                      {activeCount > 0 ? (
                        <span className="badge badge-urgent" style={{ fontSize: '0.72rem' }}>
                          {activeCount} active
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          None
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-icon"
                          title="View Profile & Ticket History"
                          onClick={() => setSelectedResident(r)}
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-icon"
                          title="File Complaint for this Resident"
                          onClick={() => onStartComplaintForResident(r)}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Resident Detail Modal */}
      {selectedResident && (
        <ResidentDetailModal
          resident={selectedResident}
          isOpen={Boolean(selectedResident)}
          onClose={() => setSelectedResident(null)}
          complaints={complaints}
          onLogComplaintForResident={onStartComplaintForResident}
        />
      )}
    </div>
  );
}
