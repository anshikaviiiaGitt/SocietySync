// src/components/common/StatCard.jsx
import React from 'react';

export function StatCard({ label, value, icon: Icon, iconColor, subtext, trend }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-card-label">{label}</span>
        {Icon && (
          <div
            className="stat-card-icon"
            style={{
              backgroundColor: iconColor ? `${iconColor}15` : 'rgba(35, 72, 61, 0.08)',
              color: iconColor || 'var(--color-primary)'
            }}
          >
            <Icon size={16} />
          </div>
        )}
      </div>
      <div className="stat-card-value">{value}</div>
      {subtext && (
        <div className="stat-card-sub">
          {trend && <span style={{ color: trend.color }}>{trend.text}</span>}
          <span>{subtext}</span>
        </div>
      )}
    </div>
  );
}
