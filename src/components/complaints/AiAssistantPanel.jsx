// src/components/complaints/AiAssistantPanel.jsx
import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Clock,
  UserCheck,
  CheckCircle,
  RotateCcw,
  Wand2,
  Cpu,
  Loader2
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';
import { CategoryBadge, PriorityBadge } from '../common/Badge';

export function AiAssistantPanel({ onApplyToForm }) {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const samplePrompts = [
    {
      title: 'Water pipe burst in kitchen',
      desc: 'Major flooding on 4th floor. Water is entering the main electrical junction switchboard and corridor.'
    },
    {
      title: 'Elevator jerking and skipping floor 7',
      desc: 'The lift car makes screeching metal noises and stopped abruptly between floors with 3 passengers inside.'
    },
    {
      title: 'Corridor lights flickering',
      desc: 'The LED tube lights on Tower B 5th floor keep flickering and the emergency battery inverter is humming.'
    },
    {
      title: 'Blocked visitor parking slot',
      desc: 'An unknown vehicle has parked across slot V-04 without a guest pass for two consecutive days.'
    }
  ];

  const handleAnalyze = async (sampleTitle, sampleDesc) => {
    const textTitle = sampleTitle !== undefined ? sampleTitle : title;
    const textDesc = sampleDesc !== undefined ? sampleDesc : description;

    if (!textTitle.trim() && !textDesc.trim()) {
      toast.warning('Please enter a complaint title or issue description to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const data = await apiClient.analyzeComplaint(textTitle, textDesc);
      setResult(data);
      if (data.mode === 'gemini') {
        toast.success('Google Gemini 1.5 Flash Cloud AI analysis completed!');
      } else {
        toast.info('Rule-based heuristic classification completed (Offline mode).');
      }
    } catch (err) {
      toast.error(`Analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    if (onApplyToForm) {
      onApplyToForm({
        title: title || result.summary,
        description: description || '',
        category: result.category,
        priority: result.priority,
        assignedStaff: result.suggestedStaff || '',
        aiConfidence: result.confidence,
        aiMode: result.mode
      });
      toast.success('AI recommendations transferred to complaint form!');
    }
  };

  return (
    <div className="card" style={{ marginBottom: '1.5rem', background: '#FFFFFF', border: '1px solid var(--border-color)' }}>
      <div className="card-header" style={{ marginBottom: '0.75rem' }}>
        <div className="card-title">
          <Sparkles size={18} style={{ color: 'var(--color-primary)' }} />
          <span>AI Complaint Triage & Diagnostic Assistant</span>
        </div>
        {result && (
          <span className="badge badge-ai">
            <Cpu size={12} />
            {result.model || result.mode}
          </span>
        )}
      </div>

      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.55' }}>
        Input resident feedback or describe a facility anomaly. Our triage architecture (supporting server-side Google Gemini 1.5 Flash when configured, and a smart offline heuristic NLP fallback when unconfigured) evaluates urgency, classifies domain, and outlines immediate remediation protocols.
      </p>

      {/* Preset prompts for quick demo testing */}
      <div style={{ marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Test Scenarios:
        </span>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
          {samplePrompts.map((s, idx) => (
            <button
              key={idx}
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.74rem', padding: '0.3rem 0.65rem' }}
              onClick={() => {
                setTitle(s.title);
                setDescription(s.desc);
                handleAnalyze(s.title, s.desc);
              }}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label">Complaint Title / Incident Summary</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Broken water pipe leaking into meter room"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Detailed Symptoms / Observations</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Continuous dripping, circuit sparks observed"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', marginTop: '0.25rem' }}>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => handleAnalyze()}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={14} className="spin-animation" />
              <span>Analyzing Issue...</span>
            </>
          ) : (
            <>
              <Sparkles size={14} />
              <span>Run Diagnostic Triage</span>
            </>
          )}
        </button>

        {(title || description || result) && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setTitle('');
              setDescription('');
              setResult(null);
            }}
          >
            <RotateCcw size={13} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Analysis Result Box */}
      {result && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Triage Diagnosis:
              </span>
              <CategoryBadge category={result.category} />
              <PriorityBadge priority={result.priority} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={13} style={{ color: 'var(--color-primary)' }} />
                Target SLA: {result.estimatedResolutionHours} hours
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <UserCheck size={13} style={{ color: 'var(--color-primary)' }} />
                Assign: {result.suggestedStaff}
              </span>
            </div>
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            <strong>Assessment:</strong> {result.summary}
          </div>

          {result.recommendedActions && result.recommendedActions.length > 0 && (
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>
                Standard Operating Procedure:
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {result.recommendedActions.map((action, i) => (
                  <li key={i} style={{ fontSize: '0.78rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem', paddingTop: '0.65rem', borderTop: '1px solid var(--border-color)' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleApply}
            >
              <CheckCircle size={14} />
              <span>Apply to Complaint Form</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
