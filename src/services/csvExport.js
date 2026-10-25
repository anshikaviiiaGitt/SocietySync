// src/services/csvExport.js
// Export complaints data to CSV format with proper formatting and quotes

export function exportComplaintsToCSV(complaints) {
  if (!complaints || complaints.length === 0) {
    alert('No complaint records available to export.');
    return;
  }

  const headers = [
    'Complaint ID',
    'Title',
    'Resident Name',
    'Flat Number',
    'Category',
    'Priority',
    'Status',
    'Assigned Staff',
    'Created At',
    'Last Updated At',
    'Resolution Notes'
  ];

  const escapeCSV = (value) => {
    if (value === null || value === undefined) return '""';
    const stringValue = String(value).replace(/"/g, '""');
    return `"${stringValue}"`;
  };

  const rows = complaints.map(c => [
    escapeCSV(c.id),
    escapeCSV(c.title),
    escapeCSV(c.residentName),
    escapeCSV(c.flatNumber),
    escapeCSV(c.category),
    escapeCSV(c.priority),
    escapeCSV(c.status),
    escapeCSV(c.assignedStaff || 'Unassigned'),
    escapeCSV(c.createdAt ? new Date(c.createdAt).toLocaleString() : ''),
    escapeCSV(c.updatedAt ? new Date(c.updatedAt).toLocaleString() : ''),
    escapeCSV(c.resolutionNotes || '')
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];

  link.setAttribute('href', url);
  link.setAttribute('download', `SocietySync_Complaints_Report_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
