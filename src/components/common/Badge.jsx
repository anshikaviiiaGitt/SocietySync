// src/components/common/Badge.jsx
import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  AlertTriangle, 
  Sparkles 
} from 'lucide-react';

export function StatusBadge({ status }) {
  switch (status) {
    case 'Pending':
      return (
        <span className="badge badge-pending">
          <Clock size={11} />
          Pending
        </span>
      );
    case 'In Progress':
      return (
        <span className="badge badge-in-progress">
          <AlertCircle size={11} />
          In Progress
        </span>
      );
    case 'Resolved':
      return (
        <span className="badge badge-resolved">
          <CheckCircle2 size={11} />
          Resolved
        </span>
      );
    default:
      return <span className="badge badge-category">{status}</span>;
  }
}

export function PriorityBadge({ priority }) {
  switch (priority) {
    case 'Urgent':
      return (
        <span className="badge badge-urgent">
          <Flame size={11} />
          Urgent
        </span>
      );
    case 'High':
      return (
        <span className="badge badge-high">
          <AlertTriangle size={11} />
          High
        </span>
      );
    case 'Medium':
      return (
        <span className="badge badge-medium">
          Medium
        </span>
      );
    case 'Low':
      return (
        <span className="badge badge-low">
          Low
        </span>
      );
    default:
      return <span className="badge badge-low">{priority}</span>;
  }
}

export function CategoryBadge({ category }) {
  return (
    <span className="badge badge-category">
      {category}
    </span>
  );
}

export function AiBadge({ mode, model }) {
  const isLive = mode === 'gemini';
  return (
    <span className="badge badge-ai" title={model || 'Triage Engine'}>
      <Sparkles size={11} />
      {isLive ? 'Gemini 1.5 Cloud AI' : 'Smart Rule Heuristic (Offline)'}
    </span>
  );
}
