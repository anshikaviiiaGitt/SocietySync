// server/db.js
// SQLite database layer for SocietySync using better-sqlite3
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure data directory exists
const dataDir = join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database file path
const dbPath = join(dataDir, 'societysync.db');
const db = new Database(dbPath);

// Enable foreign keys & WAL mode for high concurrency
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

/**
 * Initialize Schema
 */
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      resident_name TEXT NOT NULL,
      flat_number TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      assigned_staff TEXT,
      image_url TEXT,
      resolution_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS complaint_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_id TEXT NOT NULL,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      note TEXT,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      location TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      organizer TEXT,
      cover_image TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS event_registrations (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      resident_name TEXT NOT NULL,
      flat_number TEXT NOT NULL,
      attendees INTEGER NOT NULL,
      registered_at TEXT NOT NULL,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      UNIQUE(event_id, flat_number)
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      author TEXT NOT NULL,
      is_pinned INTEGER DEFAULT 0,
      image_url TEXT,
      published_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS residents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      flat_number TEXT NOT NULL,
      wing TEXT NOT NULL,
      floor INTEGER NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      occupancy_type TEXT NOT NULL,
      family_members INTEGER DEFAULT 2,
      vehicle_no TEXT,
      joined_date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      reference_id TEXT,
      is_read INTEGER DEFAULT 0,
      timestamp TEXT NOT NULL
    );
  `);

  // Check if seeding is needed
  const complaintCount = db.prepare('SELECT COUNT(*) as count FROM complaints').get().count;
  if (complaintCount === 0) {
    seedDatabase();
  }
}

/**
 * Seed initial fictional data into SQLite
 */
export function seedDatabase() {
  const now = Date.now();
  const hour = 3600 * 1000;
  const day = 24 * hour;

  const insertComplaint = db.prepare(`
    INSERT INTO complaints (id, title, description, resident_name, flat_number, category, priority, status, assigned_staff, image_url, resolution_notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertHistory = db.prepare(`
    INSERT INTO complaint_history (complaint_id, actor, action, note, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertEvent = db.prepare(`
    INSERT INTO events (id, title, description, category, date, time, location, capacity, organizer, cover_image, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertReg = db.prepare(`
    INSERT INTO event_registrations (id, event_id, resident_name, flat_number, attendees, registered_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertAnnouncement = db.prepare(`
    INSERT INTO announcements (id, title, content, category, author, is_pinned, image_url, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertResident = db.prepare(`
    INSERT INTO residents (id, name, flat_number, wing, floor, email, phone, occupancy_type, family_members, vehicle_no, joined_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertNotification = db.prepare(`
    INSERT INTO notifications (id, title, message, type, reference_id, is_read, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    // Clear existing
    db.exec('DELETE FROM complaint_history');
    db.exec('DELETE FROM complaints');
    db.exec('DELETE FROM event_registrations');
    db.exec('DELETE FROM events');
    db.exec('DELETE FROM announcements');
    db.exec('DELETE FROM residents');
    db.exec('DELETE FROM notifications');

    // 1. Complaints
    const initialComplaints = [
      {
        id: 'CMP-2024-101',
        title: 'Severe pipeline leakage in Master Bathroom ceiling',
        description: 'Continuous water seepage and dripping from the ceiling above flat B-402. The moisture is spreading to electrical switchboards and needs urgent intervention.',
        resident_name: 'Vikram Malhotra',
        flat_number: 'B-402',
        category: 'Plumbing',
        priority: 'Urgent',
        status: 'In Progress',
        assigned_staff: 'Rajesh Patel',
        image_url: null,
        resolution_notes: 'Plumber inspected upper flat B-502. Concealed flush valve washer ruptured. Valve isolated, replacement cartridge being installed today.',
        created_at: new Date(now - 14 * hour).toISOString(),
        updated_at: new Date(now - 2 * hour).toISOString(),
        history: [
          { actor: 'Vikram Malhotra (Resident)', action: 'Complaint Filed', note: 'Issue reported with high urgency tag.', timestamp: new Date(now - 14 * hour).toISOString() },
          { actor: 'AI Auto-Triage', action: 'Priority Escalated', note: 'Flagged as Urgent due to proximity to electrical fixtures.', timestamp: new Date(now - 10 * hour).toISOString() },
          { actor: 'Amit Desai (Manager)', action: 'Assigned to Rajesh Patel', note: 'Dispatched plumbing rapid response kit.', timestamp: new Date(now - 8 * hour).toISOString() },
          { actor: 'Rajesh Patel (Staff)', action: 'Status updated to In Progress', note: 'Upper flat B-502 main valve isolated. Replacing damaged fitting.', timestamp: new Date(now - 2 * hour).toISOString() }
        ]
      },
      {
        id: 'CMP-2024-102',
        title: 'Tower C Passenger Lift 2 making grinding sound and vibrating',
        description: 'Lift 2 in Tower C vibrates noticeably between the 8th and 11th floors. Door sensor takes extra time to trigger on landing.',
        resident_name: 'Ananya Deshmukh',
        flat_number: 'C-901',
        category: 'Lift & Escalator',
        priority: 'High',
        status: 'In Progress',
        assigned_staff: 'Deepak Verma',
        image_url: null,
        resolution_notes: 'OEM field technician called under AMC contract. Guide shoes need recalibration. Lift temporarily parked at Ground floor for safety.',
        created_at: new Date(now - 28 * hour).toISOString(),
        updated_at: new Date(now - 6 * hour).toISOString(),
        history: [
          { actor: 'Ananya Deshmukh (Resident)', action: 'Complaint Filed', note: 'Reported vibration and lift door delay.', timestamp: new Date(now - 28 * hour).toISOString() },
          { actor: 'Deepak Verma (Staff)', action: 'Inspection Done', note: 'AMC technician arrived. Guide rails lubricated; full calibration in progress.', timestamp: new Date(now - 6 * hour).toISOString() }
        ]
      },
      {
        id: 'CMP-2024-103',
        title: 'Corridor emergency backup lights not activating during outage',
        description: 'During yesterday evening voltage fluctuation, the 6th floor corridor of Tower A was dark. Battery backup inverter failed to trip.',
        resident_name: 'Dr. Suresh Sen',
        flat_number: 'A-604',
        category: 'Electrical',
        priority: 'High',
        status: 'Pending',
        assigned_staff: 'Ramesh Kumar',
        image_url: null,
        resolution_notes: '',
        created_at: new Date(now - 36 * hour).toISOString(),
        updated_at: new Date(now - 36 * hour).toISOString(),
        history: [
          { actor: 'Dr. Suresh Sen (Resident)', action: 'Complaint Filed', note: 'Reported backup lighting battery failure.', timestamp: new Date(now - 36 * hour).toISOString() },
          { actor: 'SocietySync System', action: 'Assigned to Ramesh Kumar', note: 'Auto-routed to Electrical maintenance desk.', timestamp: new Date(now - 30 * hour).toISOString() }
        ]
      },
      {
        id: 'CMP-2024-104',
        title: 'Basement -2 Visitor slot blocked by unregistered SUV',
        description: 'White vehicle parked across slots V-12 and V-13 for past 36 hours without dashboard guest pass or security sticker.',
        resident_name: 'Karan Mehra',
        flat_number: 'D-302',
        category: 'Parking',
        priority: 'Medium',
        status: 'Resolved',
        assigned_staff: 'Sanjay Singh',
        image_url: null,
        resolution_notes: 'Identified as guest of flat D-1104. Security team spoke with resident, vehicle moved to dedicated upper surface parking and penalty slip issued.',
        created_at: new Date(now - 50 * hour).toISOString(),
        updated_at: new Date(now - 12 * hour).toISOString(),
        history: [
          { actor: 'Karan Mehra (Resident)', action: 'Complaint Filed', note: 'Unauthorized vehicle blocking two visitor spots.', timestamp: new Date(now - 50 * hour).toISOString() },
          { actor: 'Sanjay Singh (Staff)', action: 'Resolved', note: 'Vehicle relocated. Parking bay cleared.', timestamp: new Date(now - 12 * hour).toISOString() }
        ]
      },
      {
        id: 'CMP-2024-105',
        title: 'Garbage chute hopper jammed on 3rd floor Tower B',
        description: 'The stainless steel disposal hopper flap is stuck half open. Odor entering residential corridor and waste accumulating in utility alcove.',
        resident_name: 'Pooja Hegde',
        flat_number: 'B-303',
        category: 'Cleanliness & Waste',
        priority: 'Medium',
        status: 'Resolved',
        assigned_staff: 'Sunita Bai',
        image_url: null,
        resolution_notes: 'Debris obstruction cleared using chute unblocking pole. Chute deodorized with organic enzyme spray and flap spring adjusted.',
        created_at: new Date(now - 75 * hour).toISOString(),
        updated_at: new Date(now - 20 * hour).toISOString(),
        history: [
          { actor: 'Pooja Hegde (Resident)', action: 'Complaint Filed', note: 'Chute door jammed with odor reported.', timestamp: new Date(now - 75 * hour).toISOString() },
          { actor: 'Sunita Bai (Staff)', action: 'Resolved', note: 'Housekeeping crew cleared jam and disinfected chute line.', timestamp: new Date(now - 20 * hour).toISOString() }
        ]
      },
      {
        id: 'CMP-2024-106',
        title: 'High bass and loud music after 11:30 PM in Tower D',
        description: 'Continuous heavy subwoofer bass playing late into midnight from flat D-801, disturbing sleep for senior citizens.',
        resident_name: 'Nandita Roy',
        flat_number: 'D-803',
        category: 'Noise & Disturbance',
        priority: 'Medium',
        status: 'Resolved',
        assigned_staff: 'Amit Desai',
        image_url: null,
        resolution_notes: 'Security supervisor sent to flat D-801 at 11:45 PM. Resident lowered audio immediately and signed written acknowledgment of society quiet hours.',
        created_at: new Date(now - 90 * hour).toISOString(),
        updated_at: new Date(now - 70 * hour).toISOString(),
        history: [
          { actor: 'Nandita Roy (Resident)', action: 'Complaint Filed', note: 'Late night noise disturbance logged.', timestamp: new Date(now - 90 * hour).toISOString() },
          { actor: 'Amit Desai (Manager)', action: 'Resolved', note: 'Warning issued. Resident cooperated and agreed to guidelines.', timestamp: new Date(now - 70 * hour).toISOString() }
        ]
      },
      {
        id: 'CMP-2024-107',
        title: 'Gymnasium treadmill #2 belt slipping under incline mode',
        description: 'The primary commercial treadmill in Clubhouse Fitness Center loses traction and slips when set above 4% incline.',
        resident_name: 'Rohan Joshi',
        flat_number: 'A-1202',
        category: 'Gardening & Amenities',
        priority: 'Low',
        status: 'Pending',
        assigned_staff: 'Arun Sharma',
        image_url: null,
        resolution_notes: '',
        created_at: new Date(now - 110 * hour).toISOString(),
        updated_at: new Date(now - 110 * hour).toISOString(),
        history: [
          { actor: 'Rohan Joshi (Resident)', action: 'Complaint Filed', note: 'Gym treadmill belt tension issue reported.', timestamp: new Date(now - 110 * hour).toISOString() }
        ]
      },
      {
        id: 'CMP-2024-108',
        title: 'Intercom unit display blank and no dial tone',
        description: 'Wall-mounted digital security intercom in flat C-104 is completely dead. Unable to receive delivery approvals.',
        resident_name: 'Meera Iyer',
        flat_number: 'C-104',
        category: 'Security',
        priority: 'Medium',
        status: 'In Progress',
        assigned_staff: 'Kavita Rao',
        image_url: null,
        resolution_notes: 'CAT-6 cable patch in riser duct has loose termination. Technician scheduled to re-crimp connector.',
        created_at: new Date(now - 45 * hour).toISOString(),
        updated_at: new Date(now - 15 * hour).toISOString(),
        history: [
          { actor: 'Meera Iyer (Resident)', action: 'Complaint Filed', note: 'Intercom offline.', timestamp: new Date(now - 45 * hour).toISOString() },
          { actor: 'Kavita Rao (Staff)', action: 'Cable Riser Tested', note: 'Riser terminal identified. Re-crimping pending.', timestamp: new Date(now - 15 * hour).toISOString() }
        ]
      }
    ];

    for (const c of initialComplaints) {
      insertComplaint.run(
        c.id, c.title, c.description, c.resident_name, c.flat_number,
        c.category, c.priority, c.status, c.assigned_staff, c.image_url,
        c.resolution_notes, c.created_at, c.updated_at
      );
      for (const h of c.history) {
        insertHistory.run(c.id, h.actor, h.action, h.note, h.timestamp);
      }
    }

    // 2. Events
    const initialEvents = [
      {
        id: 'EVT-2024-01',
        title: 'Grand Diwali & Community Cultural Gala 2026',
        description: 'Join your fellow residents for an evening of cultural dance, musical performances, resident food stalls, and artisanal craft booths on the Grand Lawn.',
        category: 'Cultural & Festival',
        date: new Date(now + 4 * day).toISOString().split('T')[0],
        time: '6:30 PM - 10:30 PM',
        location: 'Central Grand Lawn & Amphitheatre',
        capacity: 250,
        organizer: 'Cultural Sub-Committee',
        cover_image: null,
        created_at: new Date(now - 5 * day).toISOString(),
        registrations: [
          { id: 'reg-1', resident_name: 'Vikram Malhotra', flat_number: 'B-402', attendees: 3, registered_at: new Date(now - 2 * day).toISOString() },
          { id: 'reg-2', resident_name: 'Ananya Deshmukh', flat_number: 'C-901', attendees: 2, registered_at: new Date(now - 1 * day).toISOString() },
          { id: 'reg-3', resident_name: 'Karan Mehra', flat_number: 'D-302', attendees: 4, registered_at: new Date(now - 12 * hour).toISOString() },
          { id: 'reg-4', resident_name: 'Pooja Hegde', flat_number: 'B-303', attendees: 2, registered_at: new Date(now - 6 * hour).toISOString() }
        ]
      },
      {
        id: 'EVT-2024-02',
        title: 'Sunday Morning Sunrise Yoga & Pranayama Session',
        description: 'Certified yoga instructor will guide residents through revitalizing Surya Namaskar, stress-relief breathing exercises, and guided mindfulness meditation.',
        category: 'Fitness & Wellness',
        date: new Date(now + 7 * day).toISOString().split('T')[0],
        time: '6:30 AM - 8:00 AM',
        location: 'Clubhouse Banquet & Poolside Deck',
        capacity: 40,
        organizer: 'Wellness Club',
        cover_image: null,
        created_at: new Date(now - 4 * day).toISOString(),
        registrations: [
          { id: 'reg-5', resident_name: 'Dr. Suresh Sen', flat_number: 'A-604', attendees: 1, registered_at: new Date(now - 3 * day).toISOString() },
          { id: 'reg-6', resident_name: 'Meera Iyer', flat_number: 'C-104', attendees: 1, registered_at: new Date(now - 1 * day).toISOString() }
        ]
      },
      {
        id: 'EVT-2024-03',
        title: 'Society Fire Evacuation & Extinguisher Safety Drill',
        description: 'Hands-on fire safety briefing. Learn proper operation of CO2 and DCP extinguishers, fire hose reels, and smoke alarm response.',
        category: 'Safety Drill',
        date: new Date(now + 12 * day).toISOString().split('T')[0],
        time: '10:00 AM - 12:00 PM',
        location: 'Tower B Stilt Assembly Area',
        capacity: 100,
        organizer: 'Security & Safety Cell',
        cover_image: null,
        created_at: new Date(now - 3 * day).toISOString(),
        registrations: [
          { id: 'reg-7', resident_name: 'Rohan Joshi', flat_number: 'A-1202', attendees: 2, registered_at: new Date(now - 2 * day).toISOString() }
        ]
      }
    ];

    for (const evt of initialEvents) {
      insertEvent.run(
        evt.id, evt.title, evt.description, evt.category, evt.date,
        evt.time, evt.location, evt.capacity, evt.organizer, evt.cover_image, evt.created_at
      );
      for (const reg of evt.registrations) {
        insertReg.run(reg.id, evt.id, reg.resident_name, reg.flat_number, reg.attendees, reg.registered_at);
      }
    }

    // 3. Announcements
    const initialAnnouncements = [
      {
        id: 'ANC-2024-01',
        title: 'Scheduled Water Supply Pipeline Maintenance - Tower A & B',
        content: 'Please be advised that municipal water pressure valves and overhead tank balance lines for Towers A and B will undergo semi-annual descaling on Thursday between 1:00 PM and 5:00 PM. Residents are requested to store adequate water.',
        category: 'Maintenance',
        author: 'Amit Desai (Estate Office)',
        is_pinned: 1,
        image_url: null,
        published_at: new Date(now - 18 * hour).toISOString()
      },
      {
        id: 'ANC-2024-02',
        title: 'Smart RFID Fastag Gate Access Live Across Main Entrances',
        content: 'The society automated boom barrier RFID scanner system is now active. All residents are requested to ensure their vehicles have the SocietySync holographic sticker affixed to the windshield.',
        category: 'Security',
        author: 'Kavita Rao (CSO)',
        is_pinned: 1,
        image_url: null,
        published_at: new Date(now - 3 * day).toISOString()
      },
      {
        id: 'ANC-2024-03',
        title: 'Annual General Body Meeting (AGM) Notice & Agenda Draft',
        content: 'The 12th Annual General Body Meeting of Royal Palms CHS will be held in the Clubhouse Banquet Hall on the upcoming second Sunday at 10:30 AM. Agenda copies and audited balance sheets have been uploaded to the resident portal.',
        category: 'General',
        author: 'Managing Committee Secretary',
        is_pinned: 0,
        image_url: null,
        published_at: new Date(now - 5 * day).toISOString()
      },
      {
        id: 'ANC-2024-04',
        title: 'Swimming Pool Closed for Filter Replacement & Chlorination',
        content: 'The main swimming pool and jacuzzi will be temporarily closed from Tuesday morning to Wednesday evening for quartz sand filter media replacement and water quality balancing.',
        category: 'Maintenance',
        author: 'Arun Sharma (Amenities)',
        is_pinned: 0,
        image_url: null,
        published_at: new Date(now - 6 * day).toISOString()
      }
    ];

    for (const a of initialAnnouncements) {
      insertAnnouncement.run(a.id, a.title, a.content, a.category, a.author, a.is_pinned, a.image_url, a.published_at);
    }

    // 4. Residents
    const initialResidents = [
      { id: 'res-1', name: 'Vikram Malhotra', flat_number: 'B-402', wing: 'Tower B', floor: 4, email: 'vikram.m@example.com', phone: '+91 98201 54321', occupancy_type: 'Owner', family_members: 3, vehicle_no: 'MH-02-CB-4020', joined_date: '2021-04-15' },
      { id: 'res-2', name: 'Ananya Deshmukh', flat_number: 'C-901', wing: 'Tower C', floor: 9, email: 'ananya.d@example.com', phone: '+91 98192 88412', occupancy_type: 'Owner', family_members: 2, vehicle_no: 'MH-03-FA-9010', joined_date: '2021-08-20' },
      { id: 'res-3', name: 'Dr. Suresh Sen', flat_number: 'A-604', wing: 'Tower A', floor: 6, email: 'dr.suresh@example.com', phone: '+91 98334 11200', occupancy_type: 'Owner', family_members: 2, vehicle_no: 'MH-01-AZ-6040', joined_date: '2020-11-10' },
      { id: 'res-4', name: 'Karan Mehra', flat_number: 'D-302', wing: 'Tower D', floor: 3, email: 'karan.mehra@example.com', phone: '+91 99200 44921', occupancy_type: 'Tenant', family_members: 4, vehicle_no: 'MH-02-DN-3020', joined_date: '2023-01-05' },
      { id: 'res-5', name: 'Pooja Hegde', flat_number: 'B-303', wing: 'Tower B', floor: 3, email: 'pooja.h@example.com', phone: '+91 97690 77319', occupancy_type: 'Owner', family_members: 3, vehicle_no: 'MH-02-BH-3030', joined_date: '2022-03-12' },
      { id: 'res-6', name: 'Nandita Roy', flat_number: 'D-803', wing: 'Tower D', floor: 8, email: 'nandita.roy@example.com', phone: '+91 98212 99043', occupancy_type: 'Owner', family_members: 1, vehicle_no: 'MH-03-NR-8030', joined_date: '2021-06-18' },
      { id: 'res-7', name: 'Rohan Joshi', flat_number: 'A-1202', wing: 'Tower A', floor: 12, email: 'rohan.j@example.com', phone: '+91 99308 65421', occupancy_type: 'Tenant', family_members: 2, vehicle_no: 'MH-01-RJ-1202', joined_date: '2023-06-01' },
      { id: 'res-8', name: 'Meera Iyer', flat_number: 'C-104', wing: 'Tower C', floor: 1, email: 'meera.iyer@example.com', phone: '+91 98205 32198', occupancy_type: 'Owner', family_members: 4, vehicle_no: 'MH-03-MI-1040', joined_date: '2020-09-14' },
      { id: 'res-9', name: 'Aditya Kapoor', flat_number: 'A-301', wing: 'Tower A', floor: 3, email: 'aditya.k@example.com', phone: '+91 98450 12890', occupancy_type: 'Owner', family_members: 3, vehicle_no: 'MH-02-AK-3010', joined_date: '2022-01-19' },
      { id: 'res-10', name: 'Shalini Gupta', flat_number: 'B-1102', wing: 'Tower B', floor: 11, email: 'shalini.g@example.com', phone: '+91 97110 44520', occupancy_type: 'Tenant', family_members: 2, vehicle_no: 'MH-02-SG-1102', joined_date: '2023-09-15' },
      { id: 'res-11', name: 'Harish Varma', flat_number: 'C-503', wing: 'Tower C', floor: 5, email: 'harish.v@example.com', phone: '+91 98670 99401', occupancy_type: 'Owner', family_members: 3, vehicle_no: 'MH-03-HV-5030', joined_date: '2021-12-04' },
      { id: 'res-12', name: 'Farhan Zaidi', flat_number: 'D-1104', wing: 'Tower D', floor: 11, email: 'farhan.z@example.com', phone: '+91 98920 66312', occupancy_type: 'Owner', family_members: 4, vehicle_no: 'MH-02-FZ-1104', joined_date: '2020-10-30' }
    ];

    for (const r of initialResidents) {
      insertResident.run(r.id, r.name, r.flat_number, r.wing, r.floor, r.email, r.phone, r.occupancy_type, r.family_members, r.vehicle_no, r.joined_date);
    }

    // 5. Notifications
    const initialNotifications = [
      { id: 'notif-1', title: 'Urgent Complaint Update', message: 'Rajesh Patel was assigned to Master Bathroom Leakage (B-402). Pipe isolation completed.', type: 'complaint', reference_id: 'CMP-2024-101', is_read: 0, timestamp: new Date(now - 2 * hour).toISOString() },
      { id: 'notif-2', title: 'Lift Safety Inspection Alert', message: 'Kone AMC technician has arrived to inspect Tower C Lift 2 vibration.', type: 'complaint', reference_id: 'CMP-2024-102', is_read: 0, timestamp: new Date(now - 6 * hour).toISOString() },
      { id: 'notif-3', title: 'New Society Announcement', message: 'Scheduled Water Supply Maintenance planned for Tower A & B on Thursday.', type: 'announcement', reference_id: 'ANC-2024-01', is_read: 0, timestamp: new Date(now - 18 * hour).toISOString() },
      { id: 'notif-4', title: 'Complaint Resolved', message: 'Basement Visitor slot blockage has been cleared by Security Marshall Sanjay Singh.', type: 'complaint', reference_id: 'CMP-2024-104', is_read: 1, timestamp: new Date(now - 22 * hour).toISOString() },
      { id: 'notif-5', title: 'Event Registration Confirmed', message: 'Registration for Diwali & Winter Carnival confirmed for Flat B-402.', type: 'event', reference_id: 'EVT-2024-01', is_read: 1, timestamp: new Date(now - 2 * day).toISOString() }
    ];

    for (const n of initialNotifications) {
      insertNotification.run(n.id, n.title, n.message, n.type, n.reference_id, n.is_read, n.timestamp);
    }
  });

  transaction();
  console.log('[SQLite DB] Database seeded successfully with realistic society records.');
}

export default db;
