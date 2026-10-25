import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:5000/api';
const SERVER_BASE = 'http://localhost:5000';
const FRONTEND_BASE = 'http://localhost:5173';

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('SOCIETYSYNC COMPREHENSIVE AUTOMATED VERIFICATION SUITE');
  console.log('====================================================\n');

  // Test 1: Health check
  console.log('[1/10] Checking Backend Server & Database Health...');
  const healthRes = await fetch(`${API_BASE}/health`);
  assert(healthRes.status === 200, 'Health endpoint returns HTTP 200');
  const health = await healthRes.json();
  assert(health.status === 'healthy', 'Status is healthy');
  assert(health.database.includes('SQLite'), 'Database is active SQLite');
  assert(health.service === 'SocietySync API', 'Service name is SocietySync API');
  console.log(`       Database: ${health.database}`);
  console.log(`       AI Triage Active Mode: ${health.activeMode} (Gemini Configured: ${health.aiConfigured})`);

  // Test 2: Dashboard Statistics
  console.log('\n[2/10] Verifying Dashboard Analytics from SQLite...');
  const statsRes = await fetch(`${API_BASE}/dashboard/stats`);
  assert(statsRes.status === 200, 'Dashboard stats returns HTTP 200');
  const stats = await statsRes.json();
  assert(typeof stats.totalComplaints === 'number' && stats.totalComplaints > 0, `Total complaints count: ${stats.totalComplaints}`);
  assert(typeof stats.resolvedComplaints === 'number', `Resolved complaints: ${stats.resolvedComplaints}`);
  assert(typeof stats.activeComplaints === 'number', `Active complaints: ${stats.activeComplaints}`);
  assert(typeof stats.totalResidents === 'number' && stats.totalResidents > 0, `Total residents: ${stats.totalResidents}`);
  assert(typeof stats.upcomingEvents === 'number', `Upcoming events: ${stats.upcomingEvents}`);
  assert(typeof stats.totalAnnouncements === 'number', `Total announcements: ${stats.totalAnnouncements}`);

  // Test 3: Multer File Upload with binary image
  console.log('\n[3/10] Testing Multer Multipart Image Upload & Static Serving...');
  // Create a minimal 1x1 transparent PNG buffer
  const samplePngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    'base64'
  );
  
  const blob = new Blob([samplePngBuffer], { type: 'image/png' });
  const formData = new FormData();
  formData.append('image', blob, 'test_evidence.png');

  const uploadRes = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });
  assert(uploadRes.status === 200, 'Upload endpoint returns HTTP 200 for valid PNG');
  const uploadData = await uploadRes.json();
  assert(uploadData.success === true, 'Upload response indicates success');
  assert(typeof uploadData.imageUrl === 'string' && uploadData.imageUrl.startsWith('/uploads/'), `Valid imageUrl: ${uploadData.imageUrl}`);
  assert(uploadData.originalName === 'test_evidence.png', 'Original filename preserved');

  // Verify the uploaded image is actually accessible via static HTTP GET
  const staticImageRes = await fetch(`${SERVER_BASE}${uploadData.imageUrl}`);
  assert(staticImageRes.status === 200, 'Uploaded image is accessible via static Express URL');
  assert(staticImageRes.headers.get('content-type') === 'image/png', 'Static image served with image/png MIME type');

  // Test 4: Upload rejection for invalid file types
  console.log('\n[4/10] Testing Upload Validation (Disallowed file types)...');
  const textBlob = new Blob(['Not an image'], { type: 'text/plain' });
  const badFormData = new FormData();
  badFormData.append('image', textBlob, 'malicious.txt');
  const badUploadRes = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: badFormData,
  });
  assert(badUploadRes.status === 400, 'Upload endpoint rejects non-image text file with HTTP 400');
  const badUploadData = await badUploadRes.json();
  assert(badUploadData.error && badUploadData.error.includes('JPEG, PNG, and WebP'), 'Helpful error message returned');

  // Test 5: Complaint CRUD with Image Attachment
  console.log('\n[5/10] Testing Complaint Creation with Uploaded Image Attachment...');
  const newComplaintPayload = {
    title: 'Water seepage near Tower B lift lobby',
    description: 'Noticed persistent dampness and water seepage on the wall next to the service lift on the 4th floor.',
    category: 'Plumbing',
    priority: 'High',
    residentName: 'Arjun Mehta',
    flatNumber: 'B-402',
    imageUrl: uploadData.url || uploadData.imageUrl,
  };

  const createComplaintRes = await fetch(`${API_BASE}/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newComplaintPayload),
  });
  assert(createComplaintRes.status === 201, 'Complaint created with HTTP 201');
  const createdComplaint = await createComplaintRes.json();
  assert(createdComplaint.id && createdComplaint.id.startsWith('CMP-'), `Created Complaint ID: ${createdComplaint.id}`);
  assert(createdComplaint.imageUrl === (uploadData.url || uploadData.imageUrl), 'Attached image URL saved in database');
  assert(createdComplaint.history && createdComplaint.history.length >= 1, 'Initial lifecycle history recorded in SQLite');

  // Test 6: Complaint Status Transition
  console.log('\n[6/10] Testing Complaint Status Transition & Audit Trail...');
  const updateRes = await fetch(`${API_BASE}/complaints/${createdComplaint.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'in_progress',
      note: 'Maintenance technician assigned to inspect plumbing shaft.',
      actor: 'Estate Manager',
    }),
  });
  assert(updateRes.status === 200, 'Complaint status updated with HTTP 200');
  const updatedComplaint = await updateRes.json();
  assert(updatedComplaint.status === 'in_progress', 'Status transitioned to in_progress');
  assert(updatedComplaint.history.length >= 2, `Audit trail updated (${updatedComplaint.history.length} events logged)`);

  // Test 7: Events & RSVP Duplicate Prevention
  console.log('\n[7/10] Testing Event RSVP & Duplicate Prevention Constraint...');
  const eventsRes = await fetch(`${API_BASE}/events`);
  assert(eventsRes.status === 200, 'Events fetch returns HTTP 200');
  const events = await eventsRes.json();
  assert(events.length > 0, `Fetched ${events.length} events from SQLite`);
  const targetEvent = events[0];

  // 1st RSVP
  const testFlat = `Z-${Math.floor(Math.random() * 800) + 100}`;
  const rsvpRes1 = await fetch(`${API_BASE}/events/${targetEvent.id}/rsvp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      residentName: 'Test Resident',
      flatNumber: testFlat,
      guestsCount: 2,
    }),
  });
  assert(rsvpRes1.status === 200, `First RSVP for flat ${testFlat} succeeded with HTTP 200`);
  const rsvpData1 = await rsvpRes1.json();
  assert(rsvpData1.success === true, 'RSVP response indicates success');

  // 2nd Duplicate RSVP for same flat
  const rsvpRes2 = await fetch(`${API_BASE}/events/${targetEvent.id}/rsvp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      residentName: 'Test Resident Duplicate',
      flatNumber: testFlat,
      guestsCount: 1,
    }),
  });
  assert(rsvpRes2.status === 409, `Duplicate RSVP for flat ${testFlat} rejected with HTTP 409 Conflict`);
  const rsvpData2 = await rsvpRes2.json();
  assert(rsvpData2.error && rsvpData2.error.includes('already registered'), 'Proper duplicate registration error message');

  // Test 8: Announcements & Resident Directory
  console.log('\n[8/10] Verifying Announcements & Resident Directory...');
  const announcementsRes = await fetch(`${API_BASE}/announcements`);
  assert(announcementsRes.status === 200, 'Announcements endpoint returns HTTP 200');
  const announcements = await announcementsRes.json();
  assert(announcements.length > 0, `Loaded ${announcements.length} announcements from SQLite`);

  const residentsRes = await fetch(`${API_BASE}/residents`);
  assert(residentsRes.status === 200, 'Residents endpoint returns HTTP 200');
  const residents = await residentsRes.json();
  assert(residents.length > 0, `Loaded ${residents.length} residents from SQLite`);
  assert(residents[0].flatNumber && residents[0].name, 'Resident records have flat numbers and names');

  // Test 9: AI Complaint Triage Engine
  console.log('\n[9/10] Testing AI Complaint Analysis (Triage Engine)...');
  const aiAnalysisRes = await fetch(`${API_BASE}/ai/analyze-complaint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Water tank overflowing onto terrace floor',
      description: 'The overhead water tank sensor failed and fresh water is flooding the terrace and leaking down into flat 1401.',
    }),
  });
  assert(aiAnalysisRes.status === 200, 'AI analysis returns HTTP 200');
  const aiResult = await aiAnalysisRes.json();
  assert(aiResult.category === 'Plumbing' || aiResult.category === 'Water Supply', `Suggested category: ${aiResult.category}`);
  assert(['Urgent', 'High', 'Emergency'].includes(aiResult.priority), `Suggested priority: ${aiResult.priority}`);
  const actionList = aiResult.recommendedActions || aiResult.suggestedActions || [];
  assert(Array.isArray(actionList) && actionList.length > 0, `Action items suggested (${actionList.length} actions)`);
  const modelIdentifier = aiResult.model || aiResult.triageModel || aiResult.mode;
  assert(Boolean(modelIdentifier), `Triage engine identified as: ${modelIdentifier}`);

  // Test 10: Frontend Vite Dev Server Accessibility
  console.log('\n[10/10] Verifying Frontend Web App Delivery...');
  const frontendRes = await fetch(FRONTEND_BASE);
  assert(frontendRes.status === 200, 'Vite dev server returns HTTP 200');
  const html = await frontendRes.text();
  assert(html.includes('SocietySync'), 'HTML contains SocietySync title');
  assert(html.includes('/src/main.jsx'), 'HTML loads main.jsx entrypoint');

  console.log('\n====================================================');
  console.log(`ALL TESTS PASSED! (${passedTests}/${totalTests} assertions verified)`);
  console.log('====================================================\n');
}

runTests().catch((err) => {
  console.error('\nTest suite failed with error:', err);
  process.exit(1);
});
