// src/components/dashboard/ComplaintCharts.jsx
import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

// Restrained architectural color palette
const PIE_COLORS = [
  '#23483D', // Forest Green
  '#C77B5A', // Muted Terracotta
  '#A9B9A5', // Muted Sage
  '#D9822B', // Warm Ochre
  '#4A6B5D', // Deep Sage
  '#6B7A68', // Muted Olive
  '#8A938C', // Slate Green
  '#B8A898', // Warm Sand
  '#5C4D43'  // Deep Earth
];

const PRIORITY_COLORS = {
  'Urgent': '#C77B5A',
  'High': '#D9822B',
  'Medium': '#23483D',
  'Low': '#7E8781'
};

// Clean Custom Tooltip
function CustomChartTooltip({ active, payload, label }) {
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
          <span>{payload[0].value} {payload[0].value === 1 ? 'ticket' : 'tickets'}</span>
        </div>
      </div>
    );
  }
  return null;
}

export function ComplaintCharts({ complaints = [] }) {
  // 1. Trend Over Past 7 Days
  const trendData = useMemo(() => {
    const days = 7;
    const map = {};
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' });
      map[key] = { date: key, count: 0, resolved: 0 };
    }

    complaints.forEach((c) => {
      if (!c.createdAt) return;
      const cDate = new Date(c.createdAt);
      const key = cDate.toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' });
      if (map[key]) {
        map[key].count += 1;
        if (c.status === 'Resolved') {
          map[key].resolved += 1;
        }
      }
    });

    return Object.values(map);
  }, [complaints]);

  // 2. Category Distribution
  const categoryData = useMemo(() => {
    const counts = {};
    complaints.forEach((c) => {
      const cat = c.category || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [complaints]);

  // 3. Priority Distribution
  const priorityData = useMemo(() => {
    const counts = { 'Urgent': 0, 'High': 0, 'Medium': 0, 'Low': 0 };
    complaints.forEach((c) => {
      const p = c.priority || 'Medium';
      if (counts[p] !== undefined) {
        counts[p] += 1;
      }
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      fill: PRIORITY_COLORS[name] || '#23483D'
    }));
  }, [complaints]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
      {/* Chart 1: Complaint Velocity (Area Chart) */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="card-header">
          <div>
            <div className="card-title">Activity & Ticket Velocity</div>
            <div className="card-subtitle">Tickets logged vs resolved over the past 7 days</div>
          </div>
        </div>

        <div style={{ height: 210, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#23483D" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#23483D" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A9B9A5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#A9B9A5" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#7E8781" fontSize={11} tickLine={false} />
              <YAxis stroke="#7E8781" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomChartTooltip />} />
              <Area type="monotone" dataKey="count" stroke="#23483D" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" name="Reported" />
              <Area type="monotone" dataKey="resolved" stroke="#6D8269" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" name="Resolved" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Category Breakdown (Donut Pie) */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="card-header">
          <div>
            <div className="card-title">Category Breakdown</div>
            <div className="card-subtitle">Distribution across facility domains</div>
          </div>
        </div>

        <div style={{ height: 210, width: '100%', display: 'flex', alignItems: 'center' }}>
          {categoryData.length === 0 ? (
            <div style={{ margin: 'auto', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No data</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="#FFFFFF" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '0.25rem' }}>
          {categoryData.slice(0, 5).map((cat, idx) => (
            <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: PIE_COLORS[idx % PIE_COLORS.length] }} />
              <span>{cat.name} ({cat.value})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart 3: Priority Stratification (Bar Chart) */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="card-header">
          <div>
            <div className="card-title">Priority Stratification</div>
            <div className="card-subtitle">Active tickets by urgency level</div>
          </div>
        </div>

        <div style={{ height: 210, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#7E8781" fontSize={11} tickLine={false} />
              <YAxis stroke="#7E8781" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomChartTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Tickets">
                {priorityData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', marginTop: '0.25rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
          {priorityData.map(p => (
            <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: 7, height: 7, borderRadius: '2px', background: p.fill }} />
              <span>{p.name}: {p.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
