// src/data/initialData.js
// Realistic initial fictional sample records for SocietySync

const now = Date.now();
const hour = 3600 * 1000;
const day = 24 * hour;

export const INITIAL_COMPLAINTS = [
  {
    id: 'CMP-2024-101',
    title: 'Severe pipeline leakage in Master Bathroom ceiling',
    description: 'Continuous water seepage and dripping from the ceiling above flat B-402. The moisture is spreading to electrical switchboards and needs urgent intervention.',
    residentName: 'Vikram Malhotra',
    flatNumber: 'B-402',
    category: 'Plumbing',
    priority: 'Urgent',
    status: 'In Progress',
    assignedStaff: 'Rajesh Patel',
    createdAt: new Date(now - 14 * hour).toISOString(),
    updatedAt: new Date(now - 2 * hour).toISOString(),
    resolutionNotes: 'Plumber inspected upper flat B-502. Concealed flush valve washer ruptured. Valve isolated, replacement cartridge being installed today.',
    history: [
      {
        id: 'h-101-1',
        timestamp: new Date(now - 14 * hour).toISOString(),
        actor: 'Vikram Malhotra (Resident)',
        action: 'Complaint Filed',
        note: 'Issue reported with high urgency tag.'
      },
      {
        id: 'h-101-2',
        timestamp: new Date(now - 10 * hour).toISOString(),
        actor: 'AI Auto-Triage',
        action: 'Priority Escalated',
        note: 'Flagged as Urgent due to proximity to electrical fixtures.'
      },
      {
        id: 'h-101-3',
        timestamp: new Date(now - 8 * hour).toISOString(),
        actor: 'Amit Desai (Manager)',
        action: 'Assigned to Rajesh Patel',
        note: 'Dispatched plumbing rapid response kit.'
      },
      {
        id: 'h-101-4',
        timestamp: new Date(now - 2 * hour).toISOString(),
        actor: 'Rajesh Patel (Staff)',
        action: 'Status updated to In Progress',
        note: 'Upper flat B-502 main valve isolated. Replacing damaged fitting.'
      }
    ]
  },
  {
    id: 'CMP-2024-102',
    title: 'Tower C Passenger Lift 2 making grinding sound and vibrating',
    description: 'Lift 2 in Tower C vibrates violently between the 8th and 11th floors. Sensor light flickers and door takes 15 seconds to open on landing.',
    residentName: 'Ananya Deshmukh',
    flatNumber: 'C-901',
    category: 'Lift & Escalator',
    priority: 'High',
    status: 'In Progress',
    assignedStaff: 'Deepak Verma',
    createdAt: new Date(now - 28 * hour).toISOString(),
    updatedAt: new Date(now - 6 * hour).toISOString(),
    resolutionNotes: 'Kone OEM field technician called under AMC contract. Guide shoes need recalibration. Lift temporarily parked at Ground floor for safety.',
    history: [
      {
        id: 'h-102-1',
        timestamp: new Date(now - 28 * hour).toISOString(),
        actor: 'Ananya Deshmukh (Resident)',
        action: 'Complaint Filed',
        note: 'Reported vibration and lift door delay.'
      },
      {
        id: 'h-102-2',
        timestamp: new Date(now - 24 * hour).toISOString(),
        actor: 'Amit Desai (Manager)',
        action: 'Assigned to Deepak Verma',
        note: 'Elevator engineer notified.'
      },
      {
        id: 'h-102-3',
        timestamp: new Date(now - 6 * hour).toISOString(),
        actor: 'Deepak Verma (Staff)',
        action: 'Inspection Done',
        note: 'AMC technician arrived. Guide rails lubricated; full calibration in progress.'
      }
    ]
  },
  {
    id: 'CMP-2024-103',
    title: 'Corridor emergency backup lights not activating during outage',
    description: 'During yesterday evening voltage fluctuation, the 6th floor corridor of Tower A was pitch dark. Battery backup inverter failed to trip.',
    residentName: 'Dr. Suresh Sen',
    flatNumber: 'A-604',
    category: 'Electrical',
    priority: 'High',
    status: 'Pending',
    assignedStaff: 'Ramesh Kumar',
    createdAt: new Date(now - 36 * hour).toISOString(),
    updatedAt: new Date(now - 36 * hour).toISOString(),
    resolutionNotes: '',
    history: [
      {
        id: 'h-103-1',
        timestamp: new Date(now - 36 * hour).toISOString(),
        actor: 'Dr. Suresh Sen (Resident)',
        action: 'Complaint Filed',
        note: 'Reported backup lighting battery failure.'
      },
      {
        id: 'h-103-2',
        timestamp: new Date(now - 30 * hour).toISOString(),
        actor: 'SocietySync System',
        action: 'Assigned to Ramesh Kumar',
        note: 'Auto-routed to Electrical maintenance desk.'
      }
    ]
  },
  {
    id: 'CMP-2024-104',
    title: 'Basement -2 Visitor slot blocked by unregistered SUV',
    description: 'White Fortuner (MH-02-EE-9912) parked across slots V-12 and V-13 for past 36 hours without dashboard guest pass or security sticker.',
    residentName: 'Karan Mehra',
    flatNumber: 'D-302',
    category: 'Parking',
    priority: 'Medium',
    status: 'Resolved',
    assignedStaff: 'Sanjay Singh',
    createdAt: new Date(now - 50 * hour).toISOString(),
    updatedAt: new Date(now - 12 * hour).toISOString(),
    resolutionNotes: 'Identified as guest of flat D-1104. Security team spoke with resident, vehicle moved to dedicated upper surface parking and penalty slip issued.',
    history: [
      {
        id: 'h-104-1',
        timestamp: new Date(now - 50 * hour).toISOString(),
        actor: 'Karan Mehra (Resident)',
        action: 'Complaint Filed',
        note: 'Unauthorized vehicle blocking two visitor spots.'
      },
      {
        id: 'h-104-2',
        timestamp: new Date(now - 40 * hour).toISOString(),
        actor: 'Sanjay Singh (Staff)',
        action: 'Vehicle Traced',
        note: 'Traced to flat D-1104 guest via main gate security log.'
      },
      {
        id: 'h-104-3',
        timestamp: new Date(now - 12 * hour).toISOString(),
        actor: 'Sanjay Singh (Staff)',
        action: 'Resolved',
        note: 'Vehicle relocated. Parking bay cleared.'
      }
    ]
  },
  {
    id: 'CMP-2024-105',
    title: 'Garbage chute hopper jammed on 3rd floor Tower B',
    description: 'The stainless steel disposal hopper flap is stuck half open. Bad odor entering residential corridor and waste accumulating in the utility alcove.',
    residentName: 'Pooja Hegde',
    flatNumber: 'B-303',
    category: 'Cleanliness & Waste',
    priority: 'Medium',
    status: 'Resolved',
    assignedStaff: 'Sunita Bai',
    createdAt: new Date(now - 75 * hour).toISOString(),
    updatedAt: new Date(now - 20 * hour).toISOString(),
    resolutionNotes: 'Debris obstruction cleared using chute unblocking pole. Chute deodorized with organic enzyme spray and pneumatic flap spring replaced.',
    history: [
      {
        id: 'h-105-1',
        timestamp: new Date(now - 75 * hour).toISOString(),
        actor: 'Pooja Hegde (Resident)',
        action: 'Complaint Filed',
        note: 'Chute door jammed with odor reported.'
      },
      {
        id: 'h-105-2',
        timestamp: new Date(now - 20 * hour).toISOString(),
        actor: 'Sunita Bai (Staff)',
        action: 'Resolved',
        note: 'Housekeeping crew cleared jam and disinfected chute line.'
      }
    ]
  },
  {
    id: 'CMP-2024-106',
    title: 'High bass and loud drumming after 11:30 PM in Tower D',
    description: 'Continuous heavy subwoofer bass playing late into midnight from flat D-801, disturbing sleep for senior citizens and school children.',
    residentName: 'Nandita Roy',
    flatNumber: 'D-803',
    category: 'Noise & Disturbance',
    priority: 'Medium',
    status: 'Resolved',
    assignedStaff: 'Amit Desai',
    createdAt: new Date(now - 90 * hour).toISOString(),
    updatedAt: new Date(now - 70 * hour).toISOString(),
    resolutionNotes: 'Security supervisor sent to flat D-801 at 11:45 PM. Resident lowered audio immediately and signed written acknowledgment of society quiet hours.',
    history: [
      {
        id: 'h-106-1',
        timestamp: new Date(now - 90 * hour).toISOString(),
        actor: 'Nandita Roy (Resident)',
        action: 'Complaint Filed',
        note: 'Late night noise disturbance logged.'
      },
      {
        id: 'h-106-2',
        timestamp: new Date(now - 70 * hour).toISOString(),
        actor: 'Amit Desai (Manager)',
        action: 'Resolved',
        note: 'Warning issued. Resident cooperated and agreed to guidelines.'
      }
    ]
  },
  {
    id: 'CMP-2024-107',
    title: 'Gymnasium treadmill #2 belt slipping under incline mode',
    description: 'The primary commercial treadmill in Clubhouse Fitness Center loses traction and jerks when set above 4% incline. Potential slip hazard.',
    residentName: 'Rohan Joshi',
    flatNumber: 'A-1202',
    category: 'Gardening & Amenities',
    priority: 'Low',
    status: 'Pending',
    assignedStaff: 'Arun Sharma',
    createdAt: new Date(now - 110 * hour).toISOString(),
    updatedAt: new Date(now - 110 * hour).toISOString(),
    resolutionNotes: '',
    history: [
      {
        id: 'h-107-1',
        timestamp: new Date(now - 110 * hour).toISOString(),
        actor: 'Rohan Joshi (Resident)',
        action: 'Complaint Filed',
        note: 'Gym treadmill belt tension issue reported.'
      }
    ]
  },
  {
    id: 'CMP-2024-108',
    title: 'Intercom unit display blank and no dial tone',
    description: 'Wall-mounted digital security intercom in flat C-104 is completely dead. Unable to receive delivery boy approvals or security calls.',
    residentName: 'Meera Iyer',
    flatNumber: 'C-104',
    category: 'Security',
    priority: 'Medium',
    status: 'In Progress',
    assignedStaff: 'Kavita Rao',
    createdAt: new Date(now - 45 * hour).toISOString(),
    updatedAt: new Date(now - 15 * hour).toISOString(),
    resolutionNotes: 'CAT-6 cable patch in riser duct has loose termination. Technician scheduled to re-crimp connector.',
    history: [
      {
        id: 'h-108-1',
        timestamp: new Date(now - 45 * hour).toISOString(),
        actor: 'Meera Iyer (Resident)',
        action: 'Complaint Filed',
        note: 'Intercom offline.'
      },
      {
        id: 'h-108-2',
        timestamp: new Date(now - 15 * hour).toISOString(),
        actor: 'Kavita Rao (Staff)',
        action: 'Cable Riser Tested',
        note: 'Riser terminal identified. Re-crimping pending.'
      }
    ]
  }
];

export const INITIAL_ANNOUNCEMENTS = [
  {
    id: 'ANC-2024-01',
    title: 'Scheduled Water Supply Pipeline Maintenance - Tower A & B',
    content: 'Please be advised that municipal water pressure valves and overhead tank balance lines for Towers A and B will undergo semi-annual descaling on Thursday between 1:00 PM and 5:00 PM. Residents are requested to store adequate water.',
    category: 'Maintenance',
    author: 'Amit Desai (Estate Office)',
    publishedAt: new Date(now - 18 * hour).toISOString(),
    isPinned: true,
    tag: 'Urgent Notice'
  },
  {
    id: 'ANC-2024-02',
    title: 'Smart RFID Fastag Gate Access Live Across Main Entrances',
    content: 'The society automated boom barrier RFID scanner system is now active. All residents are requested to ensure their vehicles have the SocietySync holographic sticker affixed to the windshield.',
    category: 'Security',
    author: 'Kavita Rao (CSO)',
    publishedAt: new Date(now - 3 * day).toISOString(),
    isPinned: true,
    tag: 'Access Control'
  },
  {
    id: 'ANC-2024-03',
    title: 'Annual General Body Meeting (AGM) Notice & Agenda Draft',
    content: 'The 12th Annual General Body Meeting of Royal Palms CHS will be held in the Clubhouse Banquet Hall on the upcoming second Sunday at 10:30 AM. Agenda copies and audited balance sheets have been uploaded to the resident portal.',
    category: 'General',
    author: 'Managing Committee Secretary',
    publishedAt: new Date(now - 5 * day).toISOString(),
    isPinned: false,
    tag: 'Statutory'
  },
  {
    id: 'ANC-2024-04',
    title: 'Swimming Pool Closed for Filter Replacement & Shock Chlorination',
    content: 'The main swimming pool and jacuzzi will be temporarily closed from Tuesday morning to Wednesday evening for quartz sand filter media replacement and water quality balancing.',
    category: 'Maintenance',
    author: 'Arun Sharma (Amenities)',
    publishedAt: new Date(now - 6 * day).toISOString(),
    isPinned: false,
    tag: 'Facilities'
  },
  {
    id: 'ANC-2024-05',
    title: 'Monsoon Pest & Mosquito Control Fogging Drive',
    content: 'Extensive thermal fogging and anti-larval spray will be conducted across basement parking levels, stormwater drains, and perimeter shrubbery this Saturday from 7:00 AM onwards.',
    category: 'Maintenance',
    author: 'Sunita Bai (Housekeeping)',
    publishedAt: new Date(now - 8 * day).toISOString(),
    isPinned: false,
    tag: 'Sanitation'
  }
];

export const INITIAL_EVENTS = [
  {
    id: 'EVT-2024-01',
    title: 'Grand Diwali & Winter Carnival 2026',
    description: 'Join your fellow residents for an evening of cultural dance, musical performances, food stalls curated by resident masterchefs, and artisanal craft booths on the Grand Lawn.',
    category: 'Cultural & Festival',
    date: new Date(now + 4 * day).toISOString().split('T')[0],
    time: '6:30 PM - 10:30 PM',
    location: 'Central Grand Lawn & Amphitheatre',
    capacity: 250,
    organizer: 'Cultural Sub-Committee',
    registrations: [
      { id: 'reg-1', residentName: 'Vikram Malhotra', flatNumber: 'B-402', registeredAt: new Date(now - 2 * day).toISOString(), attendees: 3 },
      { id: 'reg-2', residentName: 'Ananya Deshmukh', flatNumber: 'C-901', registeredAt: new Date(now - 1 * day).toISOString(), attendees: 2 },
      { id: 'reg-3', residentName: 'Karan Mehra', flatNumber: 'D-302', registeredAt: new Date(now - 12 * hour).toISOString(), attendees: 4 },
      { id: 'reg-4', residentName: 'Pooja Hegde', flatNumber: 'B-303', registeredAt: new Date(now - 6 * hour).toISOString(), attendees: 2 }
    ]
  },
  {
    id: 'EVT-2024-02',
    title: 'Sunday Morning Sunrise Yoga & Pranayama Workshop',
    description: 'Certified yoga instructor Dr. Sunita will guide residents through revitalizing Surya Namaskar, stress-relief breathing exercises, and guided mindfulness meditation.',
    category: 'Fitness & Wellness',
    date: new Date(now + 7 * day).toISOString().split('T')[0],
    time: '6:30 AM - 8:00 AM',
    location: 'Clubhouse Banquet & Poolside Deck',
    capacity: 40,
    organizer: 'Wellness Club',
    registrations: [
      { id: 'reg-5', residentName: 'Dr. Suresh Sen', flatNumber: 'A-604', registeredAt: new Date(now - 3 * day).toISOString(), attendees: 1 },
      { id: 'reg-6', residentName: 'Meera Iyer', flatNumber: 'C-104', registeredAt: new Date(now - 1 * day).toISOString(), attendees: 1 },
      { id: 'reg-7', residentName: 'Nandita Roy', flatNumber: 'D-803', registeredAt: new Date(now - 8 * hour).toISOString(), attendees: 1 }
    ]
  },
  {
    id: 'EVT-2024-03',
    title: 'Hands-On Society Fire Evacuation & Extinguisher Drill',
    description: 'Mandatory fire safety briefing conducted by the Municipal Fire Brigade. Learn proper operation of CO2 and DCP extinguishers, fire hose reels, and smoke alarm response.',
    category: 'Safety Drill',
    date: new Date(now + 12 * day).toISOString().split('T')[0],
    time: '10:00 AM - 12:00 PM',
    location: 'Tower B Stilt Assembly Area',
    capacity: 100,
    organizer: 'Security & Safety Cell',
    registrations: [
      { id: 'reg-8', residentName: 'Vikram Malhotra', flatNumber: 'B-402', registeredAt: new Date(now - 2 * day).toISOString(), attendees: 2 },
      { id: 'reg-9', residentName: 'Rohan Joshi', flatNumber: 'A-1202', registeredAt: new Date(now - 1 * day).toISOString(), attendees: 1 }
    ]
  },
  {
    id: 'EVT-2024-04',
    title: 'Inter-Tower Badminton Doubles Championship',
    description: 'Exciting weekend tournament featuring Men\'s, Women\'s, and Mixed doubles brackets. Trophy, medals, and refreshments provided for all participants.',
    category: 'Sports & Tournament',
    date: new Date(now + 18 * day).toISOString().split('T')[0],
    time: '8:00 AM - 4:00 PM',
    location: 'Sports Complex (Court 1)',
    capacity: 32,
    organizer: 'Sports Committee',
    registrations: [
      { id: 'reg-10', residentName: 'Rohan Joshi', flatNumber: 'A-1202', registeredAt: new Date(now - 4 * day).toISOString(), attendees: 2 }
    ]
  }
];

export const INITIAL_RESIDENTS = [
  {
    id: 'res-1',
    name: 'Vikram Malhotra',
    flatNumber: 'B-402',
    wing: 'Tower B',
    floor: 4,
    email: 'vikram.m@example.com',
    phone: '+91 98201 54321',
    occupancyType: 'Owner',
    familyMembers: 3,
    vehicleNo: 'MH-02-CB-4020',
    joinedDate: '2021-04-15'
  },
  {
    id: 'res-2',
    name: 'Ananya Deshmukh',
    flatNumber: 'C-901',
    wing: 'Tower C',
    floor: 9,
    email: 'ananya.d@example.com',
    phone: '+91 98192 88412',
    occupancyType: 'Owner',
    familyMembers: 2,
    vehicleNo: 'MH-03-FA-9010',
    joinedDate: '2021-08-20'
  },
  {
    id: 'res-3',
    name: 'Dr. Suresh Sen',
    flatNumber: 'A-604',
    wing: 'Tower A',
    floor: 6,
    email: 'dr.suresh@example.com',
    phone: '+91 98334 11200',
    occupancyType: 'Owner',
    familyMembers: 2,
    vehicleNo: 'MH-01-AZ-6040',
    joinedDate: '2020-11-10'
  },
  {
    id: 'res-4',
    name: 'Karan Mehra',
    flatNumber: 'D-302',
    wing: 'Tower D',
    floor: 3,
    email: 'karan.mehra@example.com',
    phone: '+91 99200 44921',
    occupancyType: 'Tenant',
    familyMembers: 4,
    vehicleNo: 'MH-02-DN-3020',
    joinedDate: '2023-01-05'
  },
  {
    id: 'res-5',
    name: 'Pooja Hegde',
    flatNumber: 'B-303',
    wing: 'Tower B',
    floor: 3,
    email: 'pooja.h@example.com',
    phone: '+91 97690 77319',
    occupancyType: 'Owner',
    familyMembers: 3,
    vehicleNo: 'MH-02-BH-3030',
    joinedDate: '2022-03-12'
  },
  {
    id: 'res-6',
    name: 'Nandita Roy',
    flatNumber: 'D-803',
    wing: 'Tower D',
    floor: 8,
    email: 'nandita.roy@example.com',
    phone: '+91 98212 99043',
    occupancyType: 'Owner',
    familyMembers: 1,
    vehicleNo: 'MH-03-NR-8030',
    joinedDate: '2021-06-18'
  },
  {
    id: 'res-7',
    name: 'Rohan Joshi',
    flatNumber: 'A-1202',
    wing: 'Tower A',
    floor: 12,
    email: 'rohan.j@example.com',
    phone: '+91 99308 65421',
    occupancyType: 'Tenant',
    familyMembers: 2,
    vehicleNo: 'MH-01-RJ-1202',
    joinedDate: '2023-06-01'
  },
  {
    id: 'res-8',
    name: 'Meera Iyer',
    flatNumber: 'C-104',
    wing: 'Tower C',
    floor: 1,
    email: 'meera.iyer@example.com',
    phone: '+91 98205 32198',
    occupancyType: 'Owner',
    familyMembers: 4,
    vehicleNo: 'MH-03-MI-1040',
    joinedDate: '2020-09-14'
  },
  {
    id: 'res-9',
    name: 'Aditya Kapoor',
    flatNumber: 'A-301',
    wing: 'Tower A',
    floor: 3,
    email: 'aditya.k@example.com',
    phone: '+91 98450 12890',
    occupancyType: 'Owner',
    familyMembers: 3,
    vehicleNo: 'MH-02-AK-3010',
    joinedDate: '2022-01-19'
  },
  {
    id: 'res-10',
    name: 'Shalini Gupta',
    flatNumber: 'B-1102',
    wing: 'Tower B',
    floor: 11,
    email: 'shalini.g@example.com',
    phone: '+91 97110 44520',
    occupancyType: 'Tenant',
    familyMembers: 2,
    vehicleNo: 'MH-02-SG-1102',
    joinedDate: '2023-09-15'
  },
  {
    id: 'res-11',
    name: 'Harish Varma',
    flatNumber: 'C-503',
    wing: 'Tower C',
    floor: 5,
    email: 'harish.v@example.com',
    phone: '+91 98670 99401',
    occupancyType: 'Owner',
    familyMembers: 3,
    vehicleNo: 'MH-03-HV-5030',
    joinedDate: '2021-12-04'
  },
  {
    id: 'res-12',
    name: 'Farhan Zaidi',
    flatNumber: 'D-1104',
    wing: 'Tower D',
    floor: 11,
    email: 'farhan.z@example.com',
    phone: '+91 98920 66312',
    occupancyType: 'Owner',
    familyMembers: 4,
    vehicleNo: 'MH-02-FZ-1104',
    joinedDate: '2020-10-30'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Urgent Complaint Update',
    message: 'Rajesh Patel was assigned to Master Bathroom Leakage (B-402). Pipe isolation completed.',
    type: 'complaint',
    referenceId: 'CMP-2024-101',
    read: false,
    timestamp: new Date(now - 2 * hour).toISOString()
  },
  {
    id: 'notif-2',
    title: 'Lift Safety Inspection Alert',
    message: 'Kone AMC technician has arrived to inspect Tower C Lift 2 vibration.',
    type: 'complaint',
    referenceId: 'CMP-2024-102',
    read: false,
    timestamp: new Date(now - 6 * hour).toISOString()
  },
  {
    id: 'notif-3',
    title: 'New Society Announcement',
    message: 'Scheduled Water Supply Maintenance planned for Tower A & B on Thursday.',
    type: 'announcement',
    referenceId: 'ANC-2024-01',
    read: false,
    timestamp: new Date(now - 18 * hour).toISOString()
  },
  {
    id: 'notif-4',
    title: 'Complaint Resolved',
    message: 'Basement Visitor slot blockage has been cleared by Security Marshall Sanjay Singh.',
    type: 'complaint',
    referenceId: 'CMP-2024-104',
    read: true,
    timestamp: new Date(now - 22 * hour).toISOString()
  },
  {
    id: 'notif-5',
    title: 'Event Registration Confirmed',
    message: 'Registration for Diwali & Winter Carnival confirmed for Flat B-402.',
    type: 'event',
    referenceId: 'EVT-2024-01',
    read: true,
    timestamp: new Date(now - 2 * day).toISOString()
  }
];
