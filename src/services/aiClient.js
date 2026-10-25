// src/services/aiClient.js
// Client-side AI service communicating with backend AI proxy, with full in-browser rule fallback

import { COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES, STAFF_MEMBERS } from '../data/constants';

/**
 * Pure client-side rule-based fallback in case backend is offline
 */
export function runClientSideRuleAnalysis(title = '', description = '') {
  const text = `${title} ${description}`.toLowerCase();

  const scores = {};
  COMPLAINT_CATEGORIES.forEach(cat => (scores[cat] = 0));
  scores['Other'] = 1;

  const keywords = {
    'Plumbing': ['leak', 'leaking', 'pipe', 'water', 'tap', 'drain', 'drainage', 'seepage', 'flush', 'basin', 'geyser', 'sewer', 'tank', 'overflow', 'plumber', 'drip', 'clog', 'clogged', 'moisture'],
    'Electrical': ['electric', 'power', 'spark', 'sparking', 'mcb', 'tripped', 'wiring', 'switch', 'socket', 'fuse', 'voltage', 'blackout', 'light', 'bulb', 'short circuit', 'wire', 'inverter'],
    'Security': ['security', 'guard', 'cctv', 'camera', 'theft', 'stolen', 'stranger', 'intruder', 'gate', 'visitor', 'barrier', 'id card', 'suspicious', 'entry', 'patrol', 'intercom'],
    'Lift & Escalator': ['lift', 'elevator', 'stuck', 'lift door', 'leveling', 'floor', 'buttons', 'hoist', 'jerky', 'vibration', 'lift alarm'],
    'Cleanliness & Waste': ['garbage', 'trash', 'dustbin', 'smell', 'odor', 'stinking', 'dirty', 'sweep', 'mop', 'housekeeping', 'corridor', 'litter', 'waste', 'chute'],
    'Noise & Disturbance': ['noise', 'loud', 'music', 'party', 'shouting', 'barking', 'dog', 'nuisance', 'drilling', 'construction sound', 'banging', 'late night', 'subwoofer', 'bass'],
    'Gardening & Amenities': ['garden', 'lawn', 'tree', 'plants', 'gym', 'swimming pool', 'pool', 'clubhouse', 'badminton', 'tennis', 'children park', 'swing', 'treadmill'],
    'Parking': ['parking', 'car', 'vehicle', 'bike', 'scooter', 'slot', 'basement', 'blocked car', 'unauthorized parking', 'wrong slot', 'visitor parking', 'suv']
  };

  for (const [category, words] of Object.entries(keywords)) {
    for (const word of words) {
      if (text.includes(word)) {
        scores[category] = (scores[category] || 0) + (word.length > 5 ? 3 : 2);
      }
    }
  }

  let bestCategory = 'Other';
  let highestScore = 0;
  for (const [category, score] of Object.entries(scores)) {
    if (score > highestScore) {
      highestScore = score;
      bestCategory = category;
    }
  }

  // Priority detection
  let priority = 'Medium';
  let estHours = 24;

  const urgentTriggers = [
    'spark', 'fire', 'smoke', 'gas leak', 'stuck inside lift', 'lift stuck with', 
    'major pipe burst', 'flooding', 'electric shock', 'emergency', 'collapsed', 
    'physical fight', 'intruder', 'broken lock', 'severe'
  ];

  const highTriggers = [
    'no water', 'water cut', 'lift down', 'lift not working', 'both lifts', 
    'power cut', 'complete blackout', 'sewage overflowing', 'security gate broken', 
    'cctv blindspot', 'urgent', 'immediately', 'moisture spreading'
  ];

  const lowTriggers = [
    'suggestion', 'request', 'cosmetic', 'paint peeling', 'tree trimming', 
    'noticeboard', 'pool timing', 'gym music', 'minor stain', 'in future', 'treadmill'
  ];

  if (urgentTriggers.some(t => text.includes(t))) {
    priority = 'Urgent';
    estHours = 2;
  } else if (highTriggers.some(t => text.includes(t))) {
    priority = 'High';
    estHours = 6;
  } else if (lowTriggers.some(t => text.includes(t))) {
    priority = 'Low';
    estHours = 48;
  }

  const staffMatch = STAFF_MEMBERS.find(s => s.department === bestCategory) || STAFF_MEMBERS[0];

  const actionsMap = {
    'Plumbing': [
      'Dispatch licensed plumber to inspect primary supply manifold and stopcock.',
      'Check if water isolation valve needs immediate shutoff.',
      'Document damage and confirm adjacent flat status.'
    ],
    'Electrical': [
      'Send senior electrician to test phase voltage and distribution box breaker.',
      'Tag out breaker and verify zero voltage before maintenance.',
      'Assess emergency generator bus bar connectivity.'
    ],
    'Lift & Escalator': [
      'Contact OEM Lift AMC 24x7 control room for immediate technician dispatch.',
      'Verify car alarm and communication intercom operation.',
      'Place out-of-order signage on all affected floor elevator lobbies.'
    ],
    'Security': [
      'Extract CCTV camera footage for the specified sector and review timeline.',
      'Brief gate security officers regarding visitor verification protocol.',
      'Initiate targeted patrolling in the reported zone.'
    ],
    'Cleanliness & Waste': [
      'Dispatch housekeeping squad with disinfection equipment.',
      'Inspect chute disposal flaps or bin enclosure for mechanical blockage.',
      'Apply anti-odor and anti-bacterial spray.'
    ],
    'Noise & Disturbance': [
      'Issue polite intercom reminder referencing society residential quiet hours.',
      'Deploy security marshal to verify sound level if disturbance continues.',
      'Record incident in estate compliance register.'
    ],
    'Gardening & Amenities': [
      'Tag equipment temporarily with maintenance warning.',
      'Log replacement parts requirement with facility management.',
      'Notify clubhouse members of temporary downtime.'
    ],
    'Parking': [
      'Check vehicle registration number against resident directory records.',
      'Issue parking penalty notice and contact owner via registered phone.',
      'Direct visitor vehicle to allocated guest parking bay.'
    ],
    'Other': [
      'Route ticket to Estate Manager for physical assessment.',
      'Contact resident to gather supplementary photos or context.',
      'Establish target resolution timeline based on findings.'
    ]
  };

  return {
    success: true,
    isLiveAi: false,
    mode: 'rule-based',
    sourceLabel: 'Rule-Based Fallback Engine (Offline Mode)',
    category: bestCategory,
    priority: priority,
    suggestedStaff: staffMatch.name,
    confidence: highestScore > 3 ? 0.88 : 0.62,
    summary: `Assessed as a ${bestCategory} issue with ${priority} priority via heuristic pattern recognition.`,
    recommendedActions: actionsMap[bestCategory] || actionsMap['Other'],
    estimatedResolutionHours: estHours
  };
}

/**
 * Check backend AI service health
 */
export async function checkAiBackendHealth() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch('/api/health', { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error('Health check status not OK');
    const data = await res.json();
    return {
      connected: true,
      aiConfigured: Boolean(data.aiConfigured),
      activeMode: data.activeMode || 'Rule-Based Engine'
    };
  } catch (err) {
    return {
      connected: false,
      aiConfigured: false,
      activeMode: 'In-Browser Heuristic Engine (Standalone)'
    };
  }
}

/**
 * Main complaint analysis caller
 */
export async function analyzeComplaintText(title, description) {
  if (!title && !description) {
    throw new Error('Please enter a complaint title or description first.');
  }

  // Attempt backend analysis
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch('/api/ai/analyze-complaint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const isLive = data.mode === 'gemini';
      return {
        ...data,
        isLiveAi: isLive,
        sourceLabel: isLive 
          ? 'Google Gemini 1.5 Flash (Cloud AI)' 
          : 'SocietySync Smart Heuristic (Server Rule-Based)'
      };
    }
  } catch (backendError) {
    console.warn('[SocietySync AI] Backend unavailable or timed out. Falling back to in-browser rule engine:', backendError.message);
  }

  // Seamless in-browser fallback
  const fallback = runClientSideRuleAnalysis(title, description);
  fallback.sourceLabel = 'In-Browser Smart Heuristic Engine (Standalone Fallback)';
  return fallback;
}
