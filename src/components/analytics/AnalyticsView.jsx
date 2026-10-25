// src/components/analytics/AnalyticsView.jsx
import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  Clock,
  Download,
  AlertOctagon,
  CheckCircle2,
  Calendar,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { exportComplaintsToCSV } from '../../services/csvExport';

function CustomAnalyticsTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E5E3DC',
        borderRadius: '6px',
        padding: '0.5rem 0.75rem',
        boxShadow: '0 4px 12px rgba(41, 46, 43, 0.08)',
        fontSize: '0.76rem'
      }}>
        <div style={{ color: '#7E8781', marginBottom: '0.15rem', fontWeight: 600 }}>{label || payload[0].name}</div>
        <div style={{ color: '#292E2B', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: payload[0].color || payload[0].fill }} />
          <span>{payload[0].value} {payload[0].unit || ''}</span>
        </div>
      </div>
    );
  }
  return null;
}

export function AnalyticsView() {
  const { complaints } = useApp();
  const [timeFilter, setTimeFilter] = useState('ALL');

  const filteredComplaints = useMemo(() => {
    if (timeFilter === 'ALL') return complaints;
    const now = Date.now();
    const windowDays = timeFilter === '7D' ? 7 : 30;
    const cutoff = now - windowDays * 24 * 3600 * 1000;
    return complaints.filter(c => new Date(c.createdAt).getTime() >= cutoff);
  }, [complaints, timeFilter]);

  const resolvedList = useMemo(() => {
    return filteredComplaints.filter(c => c.status === 'Resolved' && c.createdAt && c.updatedAt);
  }, [filteredComplaints]);

  const resolutionMetrics = useMemo(() => {
    if (resolvedList.length === 0) {
      return {
        avgHours: 0,
        fastestHours: 0,
        categoryTimes: [],
        slaCompliance: 100
      };
    }

    let totalHours = 0;
    let minHours = Infinity;
    const catTimes = {};

    resolvedList.forEach(c => {
      const created = new Date(c.createdAt).getTime();
      const resolved = new Date(c.updatedAt).getTime();
      const diffHours = Math.max(0.5, (resolved - created) / (1000 * 3600));

      totalHours += diffHours;
      if (diffHours < minHours) minHours = diffHours;

      const cat = c.category || 'Other';
      if (!catTimes[cat]) catTimes[cat] = { total: 0, count: 0 };
      catTimes[cat].total += diffHours;
      catTimes[cat].count += 1;
    });

    const avgHours = (totalHours / resolvedList.length).toFixed(1);
    const fastest = minHours === Infinity ? 0 : minHours.toFixed(1);

    const onTimeCount = resolvedList.filter(c => {
      const diff = (new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime()) / (1000 * 3600);
      return diff <= 48;
    }).length;

    const slaCompliance = ((onTimeCount / resolvedList.length) * 100).toFixed(1);

    return {
      avgHours,
      fastestHours: fastest,
      categoryTimes: Object.entries(catTimes).map(([name, data]) => ({
        category: name,
        avgHours: Number((data.total / data.count).toFixed(1))
      })),
      slaCompliance
    };
  }, [resolvedList]);

  const recurringHotspots = useMemo(() => {
    const wingMap = { 'Tower A': 0, 'Tower B': 0, 'Tower C': 0, 'Tower D': 0, 'Common': 0 };
    const categoryFreq = {};

    filteredComplaints.forEach(c => {
      const flat = (c.flatNumber || '').toUpperCase();
      if (flat.startsWith('A')) wingMap['Tower A']++;
      else if (flat.startsWith('B')) wingMap['Tower B']++;
      else if (flat.startsWith('C')) wingMap['Tower C']++;
      else if (flat.startsWith('D')) wingMap['Tower D']++;
      else wingMap['Common']++;

      categoryFreq[c.category] = (categoryFreq[c.category] || 0) + 1;
    });

    const sortedCats = Object.entries(categoryFreq).sort((a, b) => b[1] - a[1]);

    return {
      wingMap: Object.entries(wingMap).map(([name, count]) => ({ name, count })),
      topCategory: sortedCats[0] ? sortedCats[0][0] : 'None',
      topCategoryCount: sortedCats[0] ? sortedCats[0][1] : 0
    };
  }, [filteredComplaints]);

  const statusDistribution = useMemo(() => {
    const counts = { 'Pending': 0, 'In Progress': 0, 'Resolved': 0 };
    filteredComplaints.forEach(c => {
      if (counts[c.status] !== undefined) counts[c.status]++;
    });
    return [
      { name: 'Pending', count: counts['Pending'], fill: '#D9822B' },
      { name: 'In Progress', count: counts['In Progress'], fill: '#4A6B5D' },
      { name: 'Resolved', count: counts['Resolved'], fill: '#2E7D32' }
    ];
  }, [filteredComplaints]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header & Date Range Filter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Society Analytics & SLA Performance
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Operational telemetry derived from real residential maintenance records in SQLite
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'var(--bg-subtle)', padding: 3, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <button
              type="button"
              className={`btn btn-sm ${timeFilter === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.74rem' }}
              onClick={() => setTimeFilter('ALL')}
            >
              All Time
            </button>
            <button
              type="button"
              className={`btn btn-sm ${timeFilter === '30D' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.74rem' }}
              onClick={() => setTimeFilter('30D')}
            >
              Past 30 Days
            </button>
            <button
              type="button"
              className={`btn btn-sm ${timeFilter === '7D' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.74rem' }}
              onClick={() => setTimeFilter('7D')}
            >
              Past 7 Days
            </button>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => exportComplaintsToCSV(filteredComplaints)}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* SLA Metric Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">Avg. Turnaround SLA</span>
            <div className="stat-card-icon" style={{ background: 'rgba(35, 72, 61, 0.08)', color: 'var(--color-primary)' }}>
              <Clock size={16} />
            </div>
          </div>
          <div className="stat-card-value">
            {resolutionMetrics.avgHours} <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-muted)' }}>hours</span>
          </div>
          <div className="stat-card-sub">
            <span>Based on {resolvedList.length} resolved tickets</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">SLA Compliance Rate</span>
            <div className="stat-card-icon" style={{ background: 'rgba(46, 125, 50, 0.08)', color: '#2E7D32' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="stat-card-value" style={{ color: '#2E7D32' }}>
            {resolutionMetrics.slaCompliance}%
          </div>
          <div className="stat-card-sub">
            <span>Resolved within 48h target</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">Fastest Resolution</span>
            <div className="stat-card-icon" style={{ background: 'rgba(217, 130, 43, 0.08)', color: 'var(--color-ochre)' }}>
              <Zap size={16} />
            </div>
          </div>
          <div className="stat-card-value" style={{ color: 'var(--color-ochre)' }}>
            {resolutionMetrics.fastestHours} <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-muted)' }}>hours</span>
          </div>
          <div className="stat-card-sub">
            <span>Rapid housekeeping & parking</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">Top Recurring Issue</span>
            <div className="stat-card-icon" style={{ background: 'rgba(199, 123, 90, 0.08)', color: 'var(--color-accent)' }}>
              <AlertOctagon size={16} />
            </div>
          </div>
          <div className="stat-card-value" style={{ fontSize: '1.3rem' }}>
            {recurringHotspots.topCategory}
          </div>
          <div className="stat-card-sub">
            <span>{recurringHotspots.topCategoryCount} tickets logged in this domain</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {/* Chart 1: Status Distribution */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Status Funnel & Backlog</div>
              <div className="card-subtitle">Pending vs In-Progress vs Resolved tickets</div>
            </div>
          </div>

          <div style={{ height: 210, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#7E8781" fontSize={11} tickLine={false} />
                <YAxis stroke="#7E8781" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomAnalyticsTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Tickets">
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`status-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Tower Concentration */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Incident Concentration by Tower</div>
              <div className="card-subtitle">Identifies recurrent geographical hotspots</div>
            </div>
          </div>

          <div style={{ height: 210, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recurringHotspots.wingMap} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#7E8781" fontSize={11} tickLine={false} />
                <YAxis stroke="#7E8781" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomAnalyticsTooltip />} />
                <Bar dataKey="count" fill="#23483D" radius={[4, 4, 0, 0]} name="Tickets" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Turnaround by Category */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Resolution Speed by Category (Hours)</div>
              <div className="card-subtitle">Calculated turnaround from creation to resolution</div>
            </div>
          </div>

          <div style={{ height: 210, width: '100%' }}>
            {resolutionMetrics.categoryTimes.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No resolved ticket history yet in selected timeframe.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={resolutionMetrics.categoryTimes}
                  margin={{ top: 10, right: 20, left: 40, bottom: 0 }}
                >
                  <XAxis type="number" stroke="#7E8781" fontSize={11} unit="h" />
                  <YAxis type="category" dataKey="category" stroke="#7E8781" fontSize={11} width={80} tickLine={false} />
                  <Tooltip content={<CustomAnalyticsTooltip />} />
                  <Bar dataKey="avgHours" fill="#C77B5A" radius={[0, 4, 4, 0]} name="Avg SLA" unit="hrs" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
