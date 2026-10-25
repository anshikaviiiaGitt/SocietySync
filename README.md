# SocietySync: AI-Powered Smart Society Management Platform

**SocietySync** is a modern, high-performance web platform designed for residential housing societies, apartment complexes, and gated communities. It combines an executive dashboard, end-to-end complaint management, community event registrations with duplicate prevention, a digital noticeboard, resident directory, and an AI-powered complaint triage assistant (supporting both live Google Gemini Cloud AI and an offline NLP heuristic engine).

---

## 1. Tech Stack

- **Frontend Core**: React 19, JavaScript (ES Modules), Vite 8
- **Styling**: Pure Custom CSS with CSS variables, refined dark navy palette (`#0B1020`, `#121A2B`), glassmorphism, and responsive breakpoints
- **Data Visualization**: Recharts (interactive Area, Donut, and Bar charts)
- **Icons**: Lucide React
- **Backend API**: Node.js, Express, CORS, Dotenv
- **Data Persistence**: Safe, versioned browser `localStorage` with seed recovery and confirmed demo reset

---

## 2. Visual Design System

The application strictly implements the requested modern SaaS aesthetic:
- **Background**: `#0B1020`
- **Surface / Card**: `#121A2B` (Hover: `#18233C`, Elevated: `#1E2B48`)
- **Brand Violet**: `#8B5CF6`
- **Electric Blue**: `#3B82F6`
- **Cyan**: `#22D3EE`
- **Coral**: `#FB7185`
- **Mint**: `#34D399`
- **Primary Text**: `#F1F5F9`
- **Secondary Text**: `#94A3B8` / `#64748B`

---

## 3. Key Modules & Features

### 🏢 1. Executive Dashboard
- **Live Metrics**: Total complaints, pending triage, in-progress tickets, resolved records, and percentage resolution rate.
- **Dynamic Charts**:
  - **Complaint Velocity**: 7-day area chart tracking logged vs resolved tickets.
  - **Category Breakdown**: Donut chart across 9 society domains (Plumbing, Electrical, Lift, Security, etc.).
  - **Priority Stratification**: Urgency bar chart (Urgent, High, Medium, Low).
- **High-Priority Critical Banner**: Highlights urgent and high-priority unresolved issues needing emergency dispatch.
- **Digital Noticeboard & Upcoming Events Previews**: Quick glances with direct deep-links.
- **Real-Time Activity Stream**: Chronological system activity log.

### 🛠️ 2. Complete Complaint Management
- **Full CRUD**: Create, read, update, and delete complaints with confirmation modals.
- **Rich Fields**: Resident name, flat/unit number, title, description, category, priority, status, assigned technician with phone extension, creation/update timestamps, and resolution notes.
- **Lifecycle Timeline**: Tracks every stage of a complaint (Registered, AI Auto-Triage, Technician Assigned, Inspection Done, Resolved).
- **Search & Multi-Filters**: Instant text search plus Category, Status, and Priority filtering.
- **Sorting**: Newest First, Oldest First, Highest Priority, and By Status.
- **Quick Resolve Action**: Directly input closure notes and resolve tickets with 1 click.
- **CSV Data Export**: One-click export of filtered complaint reports for management committee meetings.

### 🤖 3. AI Complaint Assistant (Dual-Mode Triage)
- **Automatic Fallback Architecture**:
  - **Mode 1 (Live Cloud AI)**: Secure server-side Google Gemini 1.5 Flash integration when `GEMINI_API_KEY` is provided in `.env`.
  - **Mode 2 (Smart Heuristic Fallback)**: Built-in rule-based NLP classifier that operates with zero API keys or completely offline.
- **Transparent Classification**: Categorizes domain, determines urgency, suggests technician assignment, predicts SLA turnaround hours, and generates standard operating procedure actions.
- **"Apply to Form" Workflow**: Directly pre-populates the new complaint form from AI diagnostic results.

### 📅 4. Events & Participant Registration
- **Event Management**: Create, edit, and cancel society events (Diwali Galas, Yoga workshops, Fire drills, Sports tournaments).
- **Attendee Tracking**: Real-time RSVP counters and visual capacity progress bars.
- **Duplicate Registration Prevention**: Automatically blocks duplicate RSVPs from the same flat number or resident name within demo records.
- **Registered Attendee Drawer**: Expandable attendee list per event.

### 📢 5. Digital Noticeboard
- **Notice Management**: Create, edit, and delete announcements.
- **Category Tags**: Maintenance, Security, General, Statutory AGM, Financial, Emergency.
- **Pinned Notices**: Prominently highlights critical advisories with visual glow and priority tags.

### 👥 6. Resident & Occupancy Directory
- **Fictional Registry**: 12 demo residents across Towers A, B, C, and D.
- **Occupancy Badges**: Clear "Owner" vs "Tenant" indicators.
- **Vehicle Registration & Contact Details**: Parking vehicle tags, emails, and phone extensions.
- **Linked Active Tickets**: Displays active complaint count for each flat.
- **"File Complaint for Flat"**: 1-click shortcut to log a new ticket for any resident.

### 🔔 7. Activity Center & Notifications
- Unread badge counter in top navbar.
- Dropdown panel and dedicated activity timeline tab.
- Filter by unread status, complaints, events, or announcements.
- "Mark All as Read" capability.

### 💾 8. Local Demo Persistence & Reset
- Automatically persists all state modifications in `localStorage`.
- Includes confirmed **"Reset Demo Data"** button in sidebar to restore pristine sample records at any time.

---

## 4. Architecture & Security

```
SocietySync/
├── server/
│   ├── index.js          # Express proxy server (port 5000)
│   └── aiService.js      # Gemini API caller + Heuristic Rule Engine
├── src/
│   ├── components/
│   │   ├── common/       # Navbar, Sidebar, Modal, ConfirmDialog, Badge, StatCard
│   │   ├── dashboard/    # DashboardOverview, ComplaintCharts, HighPriorityAlerts
│   │   ├── complaints/   # ComplaintList, FormModal, DetailModal, AiAssistantPanel
│   │   ├── analytics/    # AnalyticsView with SLA metrics & CSV exporter
│   │   ├── events/       # EventList, EventFormModal, EventRegisterModal
│   │   ├── announcements/# AnnouncementList, AnnouncementFormModal
│   │   ├── residents/    # ResidentList, ResidentDetailModal
│   │   └── notifications/# NotificationCenter
│   ├── context/          # AppContext (central store) & ToastContext
│   ├── data/             # Constants & initial fictional seed dataset
│   ├── services/         # storage.js, aiClient.js, csvExport.js
│   ├── styles/           # index.css, layout.css, components.css, animations.css
│   ├── App.jsx           # Root layout shell and tab routing
│   └── main.jsx
├── .env.example          # Safe environment template
├── .gitignore            # Ignores .env and build artifacts
├── package.json
└── vite.config.js        # Configured dev proxy to :5000
```

### Security Considerations:
- **Zero Client-Side API Key Exposure**: The Gemini API key is never bundled in frontend JavaScript.
- **Server Environment Variable**: The Express backend loads `process.env.GEMINI_API_KEY` from `.env`.
- **Git Protection**: `.env` is listed in `.gitignore`.
- **Graceful Error Handling**: If the API key is missing or invalid, SocietySync automatically switches to its offline rule engine without breaking the UI.

---

## 5. Setup & Running Instructions

### Prerequisites:
- Node.js (v18.0 or higher recommended, verified on Node v24)
- npm (v9.0 or higher)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
If you wish to enable live Gemini AI:
```bash
cp .env.example .env
```
Open `.env` and paste your Gemini API key:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
```
*(If left empty, SocietySync seamlessly uses its built-in rule-based NLP triage engine).*

### 3. Run the Application
To run both the Express AI backend and the Vite frontend simultaneously:
```bash
npm run dev
```

Alternatively, to run services separately:
- **Frontend only**: `npm run dev:client` (Runs on `http://localhost:5173`)
- **Backend API only**: `npm run server` (Runs on `http://localhost:5000`)

### 4. Build for Production
```bash
npm run build
```
Preview the production build:
```bash
npm run preview
```

---

## 6. Limitations & Technical Notes

- **localStorage Persistence**: Data is persisted in your local browser session. Changes are not synced across multiple computers or remote users.
- **In-App Notifications**: Notifications are reactive within the user's active session and do not use multi-tenant cloud WebSockets or push notifications.
- **Fictional Data**: All resident names, phone numbers, vehicle registrations, and flat numbers are entirely fictional.
