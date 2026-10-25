// server/index.js
// Express REST API backend for SocietySync with SQLite Database & Image Uploads
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import fs from 'fs';
import db, { initDatabase, seedDatabase } from './db.js';
import { analyzeWithGemini, analyzeWithRules } from './aiService.js';

// Load .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize SQLite database
initDatabase();

// Ensure uploads folder exists
const uploadsDir = join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname).toLowerCase();
    cb(null, `img-${uniqueSuffix}${ext}`);
  }
});

// Multer file filter & size limits
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPEG, PNG, and WebP images are permitted.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(uploadsDir));

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ====================================================
// 1. HEALTH & SYSTEM STATUS
// ====================================================
app.get('/api/health', (req, res) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 10);
  res.json({
    status: 'healthy',
    service: 'SocietySync API',
    database: 'SQLite (better-sqlite3) Connected',
    aiConfigured: hasGeminiKey,
    activeMode: hasGeminiKey ? 'Gemini 1.5 Flash' : 'Rule-Based Fallback Engine',
    timestamp: new Date().toISOString()
  });
});

// ====================================================
// 2. FILE UPLOADS
// ====================================================
app.post('/api/upload', (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, error: 'File size exceeds maximum 5MB limit.' });
      }
      return res.status(400).json({ success: false, error: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file uploaded.' });
    }

    const publicUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      url: publicUrl,
      imageUrl: publicUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  });
});

// ====================================================
// 3. DASHBOARD METRICS
// ====================================================
app.get('/api/dashboard/stats', (req, res) => {
  try {
    const totalComplaints = db.prepare('SELECT COUNT(*) as count FROM complaints').get().count;
    const pendingComplaints = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status = 'Pending'").get().count;
    const inProgressComplaints = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status = 'In Progress'").get().count;
    const resolvedComplaints = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status = 'Resolved'").get().count;
    const totalEvents = db.prepare('SELECT COUNT(*) as count FROM events').get().count;
    const totalAnnouncements = db.prepare('SELECT COUNT(*) as count FROM announcements').get().count;
    const totalResidents = db.prepare('SELECT COUNT(*) as count FROM residents').get().count;

    const resolutionRate = totalComplaints > 0 
      ? Number(((resolvedComplaints / totalComplaints) * 100).toFixed(1)) 
      : 0;

    res.json({
      success: true,
      totalComplaints,
      pendingComplaints,
      inProgressComplaints,
      resolvedComplaints,
      activeComplaints: pendingComplaints + inProgressComplaints,
      resolutionRate,
      totalEvents,
      upcomingEvents: totalEvents,
      totalAnnouncements,
      totalResidents
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ====================================================
// 4. COMPLAINTS REST API
// ====================================================
app.get('/api/complaints', (req, res) => {
  try {
    const { search, category, status, priority } = req.query;
    let query = 'SELECT * FROM complaints WHERE 1=1';
    const params = [];

    if (category && category !== 'ALL') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (status && status !== 'ALL') {
      query += ' AND status = ?';
      params.push(status);
    }
    if (priority && priority !== 'ALL') {
      query += ' AND priority = ?';
      params.push(priority);
    }
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ' AND (title LIKE ? OR description LIKE ? OR resident_name LIKE ? OR flat_number LIKE ? OR assigned_staff LIKE ? OR id LIKE ?)';
      params.push(term, term, term, term, term, term);
    }

    query += ' ORDER BY created_at DESC';

    const rawComplaints = db.prepare(query).all(...params);

    // Fetch history for each complaint
    const getHistory = db.prepare('SELECT id, actor, action, note, timestamp FROM complaint_history WHERE complaint_id = ? ORDER BY timestamp ASC');

    const complaints = rawComplaints.map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      residentName: c.resident_name,
      flatNumber: c.flat_number,
      category: c.category,
      priority: c.priority,
      status: c.status,
      assignedStaff: c.assigned_staff,
      imageUrl: c.image_url,
      resolutionNotes: c.resolution_notes,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      history: getHistory.all(c.id)
    }));

    res.json({ success: true, count: complaints.length, data: complaints });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/complaints/:id', (req, res) => {
  try {
    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    const history = db.prepare('SELECT id, actor, action, note, timestamp FROM complaint_history WHERE complaint_id = ? ORDER BY timestamp ASC').all(req.params.id);

    res.json({
      success: true,
      data: {
        id: complaint.id,
        title: complaint.title,
        description: complaint.description,
        residentName: complaint.resident_name,
        flatNumber: complaint.flat_number,
        category: complaint.category,
        priority: complaint.priority,
        status: complaint.status,
        assignedStaff: complaint.assigned_staff,
        imageUrl: complaint.image_url,
        resolutionNotes: complaint.resolution_notes,
        createdAt: complaint.created_at,
        updatedAt: complaint.updated_at,
        history
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/complaints', (req, res) => {
  try {
    const {
      title,
      description,
      residentName,
      flatNumber,
      category = 'Plumbing',
      priority = 'Medium',
      status = 'Pending',
      assignedStaff = 'Rajesh Patel',
      imageUrl = null,
      resolutionNotes = ''
    } = req.body;

    if (!title || !description || !residentName || !flatNumber) {
      return res.status(400).json({
        success: false,
        error: 'Title, description, resident name, and flat number are required.'
      });
    }

    const count = db.prepare('SELECT COUNT(*) as count FROM complaints').get().count;
    const newId = `CMP-2024-${count + 101}`;
    const timestamp = new Date().toISOString();

    const insert = db.prepare(`
      INSERT INTO complaints (id, title, description, resident_name, flat_number, category, priority, status, assigned_staff, image_url, resolution_notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      newId, title.trim(), description.trim(), residentName.trim(), flatNumber.trim().toUpperCase(),
      category, priority, status, assignedStaff, imageUrl, resolutionNotes, timestamp, timestamp
    );

    // Initial history record
    db.prepare(`
      INSERT INTO complaint_history (complaint_id, actor, action, note, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `).run(newId, `${residentName} (${flatNumber})`, 'Complaint Registered', `Logged with ${priority} priority in ${category}.`, timestamp);

    // Add in-app notification
    db.prepare(`
      INSERT INTO notifications (id, title, message, type, reference_id, is_read, timestamp)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `).run(
      `notif-${Date.now()}`,
      'New Complaint Registered',
      `${residentName} (${flatNumber}) logged: "${title.substring(0, 45)}..."`,
      'complaint',
      newId,
      timestamp
    );

    res.status(201).json({
      success: true,
      message: `Complaint #${newId} created successfully.`,
      id: newId
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/complaints/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM complaints WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    const {
      title = existing.title,
      description = existing.description,
      residentName = existing.resident_name,
      flatNumber = existing.flat_number,
      category = existing.category,
      priority = existing.priority,
      status = existing.status,
      assignedStaff = existing.assigned_staff,
      imageUrl = existing.image_url,
      resolutionNotes = existing.resolution_notes
    } = req.body;

    const timestamp = new Date().toISOString();

    db.prepare(`
      UPDATE complaints
      SET title = ?, description = ?, resident_name = ?, flat_number = ?, category = ?, priority = ?, status = ?, assigned_staff = ?, image_url = ?, resolution_notes = ?, updated_at = ?
      WHERE id = ?
    `).run(title, description, residentName, flatNumber, category, priority, status, assignedStaff, imageUrl, resolutionNotes, timestamp, id);

    // Check what changed for history log
    if (status !== existing.status) {
      db.prepare(`
        INSERT INTO complaint_history (complaint_id, actor, action, note, timestamp)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, 'Society Administrator', `Status changed to ${status}`, resolutionNotes ? `Resolution: ${resolutionNotes.substring(0, 70)}` : 'Status updated.', timestamp);

      // Notification
      db.prepare(`
        INSERT INTO notifications (id, title, message, type, reference_id, is_read, timestamp)
        VALUES (?, ?, ?, ?, ?, 0, ?)
      `).run(`notif-${Date.now()}`, `Complaint #${id} ${status}`, `Ticket #${id} status changed to ${status}.`, 'complaint', id, timestamp);
    }

    if (assignedStaff !== existing.assigned_staff) {
      db.prepare(`
        INSERT INTO complaint_history (complaint_id, actor, action, note, timestamp)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, 'Society Administrator', `Assigned to ${assignedStaff}`, 'Technician reassignment.', timestamp);
    }

    res.json({ success: true, message: `Complaint #${id} updated successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/complaints/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM complaints WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Complaint not found.' });
    }
    res.json({ success: true, message: `Complaint #${id} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ====================================================
// 5. EVENTS REST API
// ====================================================
app.get('/api/events', (req, res) => {
  try {
    const rawEvents = db.prepare('SELECT * FROM events ORDER BY date ASC').all();
    const getRegs = db.prepare('SELECT id, resident_name as residentName, flat_number as flatNumber, attendees, registered_at as registeredAt FROM event_registrations WHERE event_id = ? ORDER BY registered_at ASC');

    const events = rawEvents.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description,
      category: e.category,
      date: e.date,
      time: e.time,
      location: e.location,
      capacity: e.capacity,
      organizer: e.organizer,
      coverImage: e.cover_image,
      createdAt: e.created_at,
      registrations: getRegs.all(e.id)
    }));

    res.json({ success: true, count: events.length, data: events });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/events', (req, res) => {
  try {
    const { title, description, category, date, time, location, capacity, organizer, coverImage } = req.body;
    if (!title || !description || !date || !location || !capacity) {
      return res.status(400).json({ success: false, error: 'Title, description, date, location, and capacity are required.' });
    }

    const count = db.prepare('SELECT COUNT(*) as count FROM events').get().count;
    const newId = `EVT-2024-${String(count + 1).padStart(2, '0')}`;
    const timestamp = new Date().toISOString();

    db.prepare(`
      INSERT INTO events (id, title, description, category, date, time, location, capacity, organizer, cover_image, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(newId, title.trim(), description.trim(), category || 'Cultural & Festival', date, time, location, Number(capacity), organizer || 'Management Committee', coverImage || null, timestamp);

    res.status(201).json({ success: true, message: 'Event created successfully.', id: newId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/events/:id/rsvp', (req, res) => {
  try {
    const { id } = req.params;
    const { residentName, flatNumber, attendees = 1 } = req.body;

    if (!residentName || !flatNumber) {
      return res.status(400).json({ success: false, error: 'Resident name and flat number are required for RSVP.' });
    }

    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found.' });
    }

    // Check duplicate registration
    const cleanFlat = flatNumber.trim().toUpperCase();
    const existing = db.prepare('SELECT id FROM event_registrations WHERE event_id = ? AND flat_number = ?').get(id, cleanFlat);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `Flat ${cleanFlat} is already registered for this event. Duplicate registrations are not permitted.`
      });
    }

    // Check capacity
    const currentTotal = db.prepare('SELECT COALESCE(SUM(attendees), 0) as total FROM event_registrations WHERE event_id = ?').get(id).total;
    const requested = Number(attendees) || 1;
    if (currentTotal + requested > event.capacity) {
      return res.status(400).json({
        success: false,
        error: `Event capacity exceeded. Only ${event.capacity - currentTotal} spots remaining.`
      });
    }

    const regId = `reg-${Date.now()}`;
    const timestamp = new Date().toISOString();

    db.prepare(`
      INSERT INTO event_registrations (id, event_id, resident_name, flat_number, attendees, registered_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(regId, id, residentName.trim(), cleanFlat, requested, timestamp);

    // Add notification
    db.prepare(`
      INSERT INTO notifications (id, title, message, type, reference_id, is_read, timestamp)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `).run(`notif-${Date.now()}`, 'Event Registration Confirmed', `${residentName} (${cleanFlat}) booked ${requested} seat(s) for "${event.title}".`, 'event', id, timestamp);

    res.json({ success: true, message: `Successfully registered ${requested} attendee(s) for ${event.title}.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/events/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM events WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Event not found.' });
    }
    res.json({ success: true, message: `Event #${id} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ====================================================
// 6. ANNOUNCEMENTS REST API
// ====================================================
app.get('/api/announcements', (req, res) => {
  try {
    const raw = db.prepare('SELECT * FROM announcements ORDER BY is_pinned DESC, published_at DESC').all();
    const announcements = raw.map(a => ({
      id: a.id,
      title: a.title,
      content: a.content,
      category: a.category,
      author: a.author,
      isPinned: Boolean(a.is_pinned),
      imageUrl: a.image_url,
      publishedAt: a.published_at
    }));
    res.json({ success: true, count: announcements.length, data: announcements });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/announcements', (req, res) => {
  try {
    const { title, content, category, author, isPinned, imageUrl } = req.body;
    if (!title || !content || !author) {
      return res.status(400).json({ success: false, error: 'Title, content, and author are required.' });
    }

    const count = db.prepare('SELECT COUNT(*) as count FROM announcements').get().count;
    const newId = `ANC-2024-${String(count + 1).padStart(2, '0')}`;
    const timestamp = new Date().toISOString();

    db.prepare(`
      INSERT INTO announcements (id, title, content, category, author, is_pinned, image_url, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(newId, title.trim(), content.trim(), category || 'General', author.trim(), isPinned ? 1 : 0, imageUrl || null, timestamp);

    // Notification
    db.prepare(`
      INSERT INTO notifications (id, title, message, type, reference_id, is_read, timestamp)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `).run(`notif-${Date.now()}`, 'New Announcement', `Notice: "${title.substring(0, 45)}..."`, 'announcement', newId, timestamp);

    res.status(201).json({ success: true, message: 'Notice published successfully.', id: newId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/announcements/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM announcements WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Announcement not found.' });
    }
    res.json({ success: true, message: `Announcement #${id} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ====================================================
// 7. RESIDENTS REST API
// ====================================================
app.get('/api/residents', (req, res) => {
  try {
    const raw = db.prepare('SELECT * FROM residents ORDER BY flat_number ASC').all();
    const residents = raw.map(r => ({
      id: r.id,
      name: r.name,
      flatNumber: r.flat_number,
      wing: r.wing,
      floor: r.floor,
      email: r.email,
      phone: r.phone,
      occupancyType: r.occupancy_type,
      familyMembers: r.family_members,
      vehicleNo: r.vehicle_no,
      joinedDate: r.joined_date
    }));
    res.json({ success: true, count: residents.length, data: residents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ====================================================
// 8. NOTIFICATIONS REST API
// ====================================================
app.get('/api/notifications', (req, res) => {
  try {
    const raw = db.prepare('SELECT * FROM notifications ORDER BY timestamp DESC LIMIT 30').all();
    const notifs = raw.map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      referenceId: n.reference_id,
      read: Boolean(n.is_read),
      timestamp: n.timestamp
    }));
    res.json({ success: true, count: notifs.length, data: notifs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/notifications/:id/read', (req, res) => {
  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/notifications/read-all', (req, res) => {
  try {
    db.prepare('UPDATE notifications SET is_read = 1').run();
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ====================================================
// 9. RESET DEMO DATA
// ====================================================
app.post('/api/reset-data', (req, res) => {
  try {
    seedDatabase();
    res.json({ success: true, message: 'Database reset to clean demo records.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ====================================================
// 10. AI COMPLAINT TRIAGE
// ====================================================
app.post('/api/ai/analyze-complaint', async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title && !description) {
      return res.status(400).json({
        success: false,
        error: 'Please provide either a complaint title or description for analysis.'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : null;

    if (apiKey && apiKey.length > 10) {
      try {
        console.log('Invoking Gemini API for complaint analysis...');
        const aiResult = await analyzeWithGemini(title, description, apiKey);
        return res.json(aiResult);
      } catch (geminiError) {
        console.warn('Gemini API call failed or timed out. Falling back to rule-based engine:', geminiError.message);
        const fallbackResult = analyzeWithRules(title, description);
        fallbackResult.fallbackReason = `Gemini call failed: ${geminiError.message}. Seamlessly switched to offline NLP heuristic.`;
        return res.json(fallbackResult);
      }
    }

    console.log('No GEMINI_API_KEY configured. Running rule-based NLP engine.');
    const ruleResult = analyzeWithRules(title, description);
    return res.json(ruleResult);
  } catch (error) {
    console.error('Unhandled error in /api/ai/analyze-complaint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while analyzing complaint.',
      details: error.message
    });
  }
});

// Start Express server
const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` SocietySync Backend Server running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(` SQLite Database: Connected (server/data/societysync.db)`);
  console.log(` Image Uploads: Enabled (server/uploads)`);
  console.log(` Gemini Key: ${process.env.GEMINI_API_KEY ? 'Configured (Active)' : 'Not Set (Using Smart Fallback Engine)'}`);
  console.log(`===============================================`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    db.close();
    console.log('SocietySync backend server closed.');
  });
});
