// server/aiService.js
// Provides Gemini API analysis with smart rule-based fallback

const CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Security',
  'Lift & Escalator',
  'Cleanliness & Waste',
  'Noise & Disturbance',
  'Gardening & Amenities',
  'Parking',
  'Other'
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const STAFF_MAPPING = {
  'Plumbing': 'Rajesh Patel (Plumbing & Sanitation)',
  'Electrical': 'Ramesh Kumar (Chief Electrician)',
  'Security': 'Kavita Rao (Chief Security Officer)',
  'Lift & Escalator': 'Kone Tech Support / Deepak Verma',
  'Cleanliness & Waste': 'Sunita Bai (Housekeeping Lead)',
  'Noise & Disturbance': 'Estate Manager Office',
  'Gardening & Amenities': 'Arun Sharma (Horticulture & Club)',
  'Parking': 'Sanjay Singh (Traffic & Gate Admin)',
  'Other': 'Management Committee Helpdesk'
};

/**
 * Intelligent Rule-Based Fallback Engine
 * Uses token matching, sentiment, and emergency keyword weighting
 */
export function analyzeWithRules(title = '', description = '') {
  const text = `${title} ${description}`.toLowerCase();

  // Keyword scoring for categories
  const scores = {
    'Plumbing': 0,
    'Electrical': 0,
    'Security': 0,
    'Lift & Escalator': 0,
    'Cleanliness & Waste': 0,
    'Noise & Disturbance': 0,
    'Gardening & Amenities': 0,
    'Parking': 0,
    'Other': 1 // base score
  };

  const keywords = {
    'Plumbing': ['leak', 'leaking', 'pipe', 'water', 'tap', 'drain', 'drainage', 'seepage', 'flush', 'basin', 'geyser', 'sewer', 'tank', 'overflow', 'plumber', 'drip', 'clog', 'clogged'],
    'Electrical': ['electric', 'power', 'spark', 'sparking', 'mcb', 'tripped', 'wiring', 'switch', 'socket', 'fuse', 'voltage', 'blackout', 'light', 'bulb', 'choke', 'short circuit', 'wire'],
    'Security': ['security', 'guard', 'cctv', 'camera', 'theft', 'stolen', 'stranger', 'intruder', 'gate', 'visitor', 'barrier', 'id card', 'suspicious', 'entry', 'patrol'],
    'Lift & Escalator': ['lift', 'elevator', 'stuck', 'lift door', 'leveling', 'floor 4', 'floor', 'buttons', 'hoist', 'jerky', 'lift alarm'],
    'Cleanliness & Waste': ['garbage', 'trash', 'dustbin', 'smell', 'odor', 'stinking', 'dirty', 'sweep', 'mop', 'housekeeping', 'corridor', 'litter', 'waste', 'staircase cleaning'],
    'Noise & Disturbance': ['noise', 'loud', 'music', 'party', 'shouting', 'barking', 'dog', 'nuisance', 'drilling', 'construction sound', 'banging', 'late night'],
    'Gardening & Amenities': ['garden', 'lawn', 'tree', 'plants', 'gym', 'swimming pool', 'pool', 'clubhouse', 'badminton', 'tennis', 'children park', 'swing', 'treadmill'],
    'Parking': ['parking', 'car', 'vehicle', 'bike', 'scooter', 'slot', 'basement', 'blocked car', 'unauthorized parking', 'wrong slot', 'visitor parking']
  };

  for (const [category, words] of Object.entries(keywords)) {
    for (const word of words) {
      if (text.includes(word)) {
        // Longer words get higher score
        scores[category] += word.length > 5 ? 3 : 2;
      }
    }
  }

  // Determine highest scoring category
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
  let estimatedHours = 24;

  const urgentTriggers = [
    'spark', 'fire', 'smoke', 'gas leak', 'stuck inside lift', 'lift stuck with', 
    'major pipe burst', 'flooding', 'electric shock', 'emergency', 'collapsed', 
    'physical fight', 'intruder', 'broken lock'
  ];

  const highTriggers = [
    'no water', 'water cut', 'lift down', 'lift not working', 'both lifts', 
    'power cut', 'complete blackout', 'sewage overflowing', 'security gate broken', 
    'cctv blindspot', 'urgent', 'immediately', 'severe'
  ];

  const lowTriggers = [
    'suggestion', 'request', 'cosmetic', 'paint peeling', 'tree trimming', 
    'noticeboard', 'pool timing', 'gym music', 'minor stain', 'in future'
  ];

  if (urgentTriggers.some(t => text.includes(t))) {
    priority = 'Urgent';
    estimatedHours = 2;
  } else if (highTriggers.some(t => text.includes(t))) {
    priority = 'High';
    estimatedHours = 6;
  } else if (lowTriggers.some(t => text.includes(t))) {
    priority = 'Low';
    estimatedHours = 48;
  } else {
    priority = 'Medium';
    estimatedHours = 24;
  }

  // Generate actionable next steps
  const actionsMap = {
    'Plumbing': [
      'Dispatch on-duty plumber for physical inspection and valve check.',
      'Check central water manifold and pressure pump gauges.',
      'Confirm if adjacent flats on the same riser are affected.'
    ],
    'Electrical': [
      'Deploy certified electrician with multimeter to inspect distribution box.',
      'Ensure MCB trip safety protocol is executed before servicing.',
      'Check if generator backup switchover was affected.'
    ],
    'Lift & Escalator': [
      'Call emergency lift technician AMC hotline immediately.',
      'Verify intercom connection in lift cabin and verify passenger safety.',
      'Place "Out of Service" digital and physical barriers at all floor landings.'
    ],
    'Security': [
      'Review CCTV surveillance archive for the specified timestamp and zone.',
      'Instruct gate security personnel to cross-reference digital visitor log.',
      'Increase perimeter patrol frequency in the reported sector.'
    ],
    'Cleanliness & Waste': [
      'Assign housekeeping supervisor to dispatch rapid-response cleaning crew.',
      'Perform deep sanitation and odor neutralization in the corridor/area.',
      'Check waste collection schedule compliance for the wing.'
    ],
    'Noise & Disturbance': [
      'Contact resident via society intercom to issue polite compliance reminder.',
      'Review quiet hours by-laws (10:00 PM - 7:00 AM) with security guard.',
      'Log incident in society compliance record if noise persists.'
    ],
    'Gardening & Amenities': [
      'Schedule maintenance audit with the facility manager.',
      'Tag equipment temporarily if unsafe for resident use.',
      'Update amenity booking system or noticeboard regarding service hours.'
    ],
    'Parking': [
      'Lookup registered vehicle license plate in SocietySync Resident Directory.',
      'Send immediate in-app parking push alert to the vehicle owner.',
      'Deploy security marshal to guide traffic and prevent bottleneck.'
    ],
    'Other': [
      'Acknowledge complaint and route to Estate Manager for assessment.',
      'Contact resident to gather supplementary photos or details.',
      'Set target resolution SLA based on initial evaluation.'
    ]
  };

  const recommendedActions = actionsMap[bestCategory] || actionsMap['Other'];

  return {
    success: true,
    mode: 'rule-based',
    model: 'SocietySync Smart NLP Heuristic v2.4',
    category: bestCategory,
    priority: priority,
    suggestedStaff: STAFF_MAPPING[bestCategory] || 'Estate Manager Helpdesk',
    confidence: highestScore > 3 ? 0.88 : 0.65,
    summary: `Identified ${bestCategory} issue with ${priority} priority based on keyword pattern matching and severity evaluation.`,
    recommendedActions,
    estimatedResolutionHours: estimatedHours
  };
}

/**
 * Gemini Live API Analysis
 */
export async function analyzeWithGemini(title, description, apiKey) {
  const prompt = `You are the AI triage engine for SocietySync, a smart residential society management system.
Analyze the following resident complaint:
Title: "${title}"
Description: "${description}"

Allowed Categories: ${JSON.stringify(CATEGORIES)}
Allowed Priorities: ${JSON.stringify(PRIORITIES)}

Respond ONLY with valid JSON (no markdown fences, no extra text) following this exact JSON structure:
{
  "category": "One category exactly from the allowed list",
  "priority": "One priority exactly from allowed priorities: Low, Medium, High, or Urgent",
  "confidence": 0.95,
  "summary": "1-2 sentence concise technical summary of the core issue",
  "suggestedDepartment": "Specific department/vendor to assign",
  "recommendedActions": [
    "Concrete action step 1 for facilities team",
    "Concrete action step 2 for facilities team",
    "Concrete action step 3 for resident/staff"
  ],
  "estimatedResolutionHours": 4
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 600,
        responseMimeType: "application/json"
      }
    }),
    signal: AbortSignal.timeout(10000) // 10 second timeout
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API returned status ${response.status}: ${errorText.substring(0, 150)}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Gemini API returned empty text response.');
  }

  // Parse JSON from response
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  const parsed = JSON.parse(cleaned);

  // Validate fields against allowed lists
  const validCategory = CATEGORIES.includes(parsed.category) ? parsed.category : 'Other';
  const validPriority = PRIORITIES.includes(parsed.priority) ? parsed.priority : 'Medium';

  return {
    success: true,
    mode: 'gemini',
    model: 'Gemini 1.5 Flash (Cloud AI)',
    category: validCategory,
    priority: validPriority,
    suggestedStaff: STAFF_MAPPING[validCategory] || 'Estate Manager Helpdesk',
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.94,
    summary: parsed.summary || 'AI-analyzed triage assessment complete.',
    recommendedActions: Array.isArray(parsed.recommendedActions) && parsed.recommendedActions.length > 0 
      ? parsed.recommendedActions 
      : ['Inspect reported issue location', 'Notify relevant technician', 'Update resident on progress'],
    estimatedResolutionHours: parsed.estimatedResolutionHours || 8
  };
}
