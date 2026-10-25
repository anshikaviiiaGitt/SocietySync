// src/data/constants.js
// Platform constants, options, categories and color palettes

export const SOCIETY_INFO = {
  name: 'Royal Palms Heights',
  subtext: 'Co-operative Housing Society Ltd.',
  registrationNo: 'BOM/HSG/TC/10492/2021',
  totalFlats: 184,
  totalWings: 4,
  wings: ['Tower A', 'Tower B', 'Tower C', 'Tower D'],
  location: 'Palm Avenue, Sector 18, Powai'
};

export const COMPLAINT_CATEGORIES = [
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

export const COMPLAINT_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export const COMPLAINT_STATUSES = ['Pending', 'In Progress', 'Resolved'];

export const STAFF_MEMBERS = [
  { id: 'st-1', name: 'Rajesh Patel', role: 'Plumbing & Sanitation Lead', department: 'Plumbing', phone: 'Ext 101' },
  { id: 'st-2', name: 'Ramesh Kumar', role: 'Chief Electrician', department: 'Electrical', phone: 'Ext 102' },
  { id: 'st-3', name: 'Kavita Rao', role: 'Security Supervisor', department: 'Security', phone: 'Ext 103' },
  { id: 'st-4', name: 'Deepak Verma', role: 'Elevator & HVAC Engineer', department: 'Lift & Escalator', phone: 'Ext 104' },
  { id: 'st-5', name: 'Sunita Bai', role: 'Housekeeping Lead', department: 'Cleanliness & Waste', phone: 'Ext 105' },
  { id: 'st-6', name: 'Arun Sharma', role: 'Horticulture & Club Lead', department: 'Gardening & Amenities', phone: 'Ext 106' },
  { id: 'st-7', name: 'Sanjay Singh', role: 'Parking & Gate Marshall', department: 'Parking', phone: 'Ext 107' },
  { id: 'st-8', name: 'Amit Desai', role: 'Estate Manager', department: 'General Management', phone: 'Ext 100' }
];

export const ANNOUNCEMENT_CATEGORIES = [
  'Maintenance',
  'Security',
  'General',
  'Financial',
  'Event',
  'Emergency'
];

export const EVENT_CATEGORIES = [
  'Cultural & Festival',
  'Fitness & Wellness',
  'General Meeting (AGM)',
  'Sports & Tournament',
  'Safety Drill'
];

export const EVENT_LOCATIONS = [
  'Central Clubhouse Banquet',
  'Open Air Amphitheatre',
  'Central Grand Lawn',
  'Sports Complex (Court 1)',
  'Basement Seminar Room',
  'Swimming Pool Deck'
];

// Refined architectural warm identity palette
export const THEME_COLORS = {
  background: '#F7F6F2',      // Warm Ivory
  primary: '#23483D',         // Deep Forest Green
  secondary: '#A9B9A5',       // Muted Sage
  textPrimary: '#292E2B',     // Charcoal
  cardBg: '#FFFFFF',          // Crisp White
  border: '#E5E3DC',          // Warm Grey
  accent: '#C77B5A',          // Muted Terracotta
  textMuted: '#636B66',
  borderHighlight: '#23483D'
};
