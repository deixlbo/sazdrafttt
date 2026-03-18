// Sample data for the Barangay Santiago Saz Portal

export const mockDocumentTypes = [
  { id: '1', name: 'Barangay Clearance', description: 'For employment and legal purposes', days: 1 },
  { id: '2', name: 'Certificate of Residency', description: 'Proof of residence in the barangay', days: 1 },
  { id: '3', name: 'Certificate of Indigency', description: 'For financial assistance applications', days: 1 },
  { id: '4', name: 'Business Permit', description: 'For business registration', days: 3 },
  { id: '5', name: 'Building Permit', description: 'For construction purposes', days: 5 },
];

export const mockAnnouncements = [
  {
    id: '1',
    title: 'Community Clean-Up Drive',
    content: 'Join us this Saturday for our monthly community clean-up drive. All residents are encouraged to participate. Meet at the barangay hall at 6:00 AM.',
    category: 'Event',
    priority: 'medium',
    date: '2026-03-20',
    author: 'Barangay Captain',
  },
  {
    id: '2',
    title: 'Vaccination Schedule Update',
    content: 'Free vaccination for all residents will be available at the health center every Tuesday and Thursday from 8:00 AM to 4:00 PM.',
    category: 'Alert',
    priority: 'high',
    date: '2026-03-18',
    author: 'Health Committee',
  },
  {
    id: '3',
    title: 'Barangay Assembly Meeting',
    content: 'All residents are invited to attend the quarterly barangay assembly meeting on March 25, 2026 at 2:00 PM at the covered court.',
    category: 'Meeting',
    priority: 'medium',
    date: '2026-03-15',
    author: 'Barangay Secretary',
  },
  {
    id: '4',
    title: 'Water Supply Maintenance',
    content: 'There will be a scheduled water supply interruption on March 22, 2026 from 8:00 AM to 5:00 PM due to maintenance works.',
    category: 'Maintenance',
    priority: 'high',
    date: '2026-03-14',
    author: 'Utilities Committee',
  },
];

export const mockPrograms = [
  {
    id: '1',
    title: 'Senior Citizen Health Check',
    description: 'Free medical check-up for senior citizens including blood pressure monitoring, blood sugar testing, and consultation.',
    category: 'Health',
    date: 'Every Monday, 8:00 AM - 12:00 PM',
    location: 'Barangay Health Center',
    attendees: 45,
  },
  {
    id: '2',
    title: 'Livelihood Training Program',
    description: 'Free skills training on food processing, sewing, and small business management for residents.',
    category: 'Livelihood',
    date: 'March 25-29, 2026',
    location: 'Barangay Multi-Purpose Hall',
    attendees: 30,
  },
  {
    id: '3',
    title: 'Youth Basketball League',
    description: 'Annual inter-purok basketball tournament for youth aged 15-25 years old.',
    category: 'Sports',
    date: 'April 1-30, 2026',
    location: 'Barangay Covered Court',
    attendees: 120,
  },
  {
    id: '4',
    title: 'Tree Planting Activity',
    description: 'Environmental awareness program with tree planting activity in the barangay perimeter.',
    category: 'Environment',
    date: 'March 28, 2026, 6:00 AM',
    location: 'Barangay Perimeter Area',
    attendees: 80,
  },
];

export const mockResidents = [
  { id: '1', name: 'Juan Dela Cruz', email: 'juan@email.com', phone: '0912-345-6789', address: 'Purok 1, Zone 1', status: 'active', avatar: '', birthDate: 'January 15, 1985', gender: 'Male', civilStatus: 'Married' },
  { id: '2', name: 'Maria Santos', email: 'maria@email.com', phone: '0923-456-7890', address: 'Purok 2, Zone 1', status: 'active', avatar: '', birthDate: 'March 22, 1990', gender: 'Female', civilStatus: 'Single' },
  { id: '3', name: 'Pedro Reyes', email: 'pedro@email.com', phone: '0934-567-8901', address: 'Purok 3, Zone 2', status: 'active', avatar: '', birthDate: 'July 8, 1978', gender: 'Male', civilStatus: 'Married' },
  { id: '4', name: 'Elena Flores', email: 'elena@email.com', phone: '0945-678-9012', address: 'Purok 1, Zone 2', status: 'active', avatar: '', birthDate: 'December 3, 1982', gender: 'Female', civilStatus: 'Widow' },
  { id: '5', name: 'Roberto Tan', email: 'roberto@email.com', phone: '0956-789-0123', address: 'Purok 4, Zone 1', status: 'inactive', avatar: '', birthDate: 'May 19, 1995', gender: 'Male', civilStatus: 'Single' },
];

export const mockOfficials = [
  { id: '1', name: 'Hon. Roberto Cruz', position: 'Punong Barangay', email: 'captain@santiago.gov', contact: '0912-111-1111', status: 'active' },
  { id: '2', name: 'Ana Garcia', position: 'Kagawad', email: 'ana.garcia@santiago.gov', contact: '0912-222-2222', status: 'active' },
  { id: '3', name: 'Carlos Mendoza', position: 'Secretary', email: 'secretary@santiago.gov', contact: '0912-333-3333', status: 'active' },
  { id: '4', name: 'Elena Flores', position: 'Treasurer', email: 'treasurer@santiago.gov', contact: '0912-444-4444', status: 'active' },
];

export const mockDocumentRequests = [
  { id: 'DOC-001', type: 'Barangay Clearance', residentId: '1', residentName: 'Juan Dela Cruz', purpose: 'Job application', status: 'pending', date: '2026-03-18' },
  { id: 'DOC-002', type: 'Certificate of Residency', residentId: '2', residentName: 'Maria Santos', purpose: 'School enrollment', status: 'processing', date: '2026-03-17' },
  { id: 'DOC-003', type: 'Certificate of Indigency', residentId: '3', residentName: 'Pedro Reyes', purpose: 'Medical assistance', status: 'approved', date: '2026-03-16' },
];

export const mockBlotterCases = [
  { id: 'BLT-001', incidentType: 'Noise Complaint', location: 'Purok 3, Zone 2', reportedBy: 'Juan Dela Cruz', status: 'reported', date: '2026-03-18', description: 'Excessive noise from construction at night' },
  { id: 'BLT-002', incidentType: 'Property Dispute', location: 'Purok 1, Zone 1', reportedBy: 'Maria Santos', status: 'investigating', date: '2026-03-17', description: 'Boundary dispute with neighbor' },
  { id: 'BLT-003', incidentType: 'Lost Item', location: 'Barangay Hall', reportedBy: 'Pedro Reyes', status: 'resolved', date: '2026-03-15', description: 'Lost wallet near the barangay hall' },
];

export const mockBusinesses = [
  { id: 'BUS-001', businessName: 'Sari-Sari Store Dela Cruz', ownerName: 'Juan Dela Cruz', type: 'Retail', address: 'Purok 1, Zone 1', permitNumber: 'BP-2026-001', status: 'active' },
  { id: 'BUS-002', businessName: 'Maria Catering Services', ownerName: 'Maria Santos', type: 'Food & Beverage', address: 'Purok 2, Zone 1', permitNumber: 'BP-2026-002', status: 'active' },
  { id: 'BUS-003', businessName: 'Reyes Auto Repair', ownerName: 'Pedro Reyes', type: 'Services', address: 'Purok 3, Zone 2', permitNumber: 'BP-2026-003', status: 'pending' },
];

export const mockNotifications = [
  { id: '1', title: 'Document Approved', message: 'Your Barangay Clearance request has been approved.', type: 'success', read: false, date: '2026-03-18T10:30:00' },
  { id: '2', title: 'New Announcement', message: 'Community Clean-Up Drive scheduled for this Saturday.', type: 'info', read: false, date: '2026-03-18T09:00:00' },
  { id: '3', title: 'Emergency Alert', message: 'Typhoon Warning: Stay updated and prepare for evacuation.', type: 'warning', read: true, date: '2026-03-17T15:00:00' },
  { id: '4', title: 'Program Registration', message: 'You have been enrolled in the Livelihood Training Program.', type: 'success', read: true, date: '2026-03-16T14:00:00' },
];

// AXL AI Chatbot FAQ Data
export const axlFaqData = [
  // General Barangay Information
  {
    question: 'What are the office hours of the barangay hall?',
    answer: 'The Barangay Santiago Hall is open Monday to Friday from 8:00 AM to 5:00 PM, and Saturday from 8:00 AM to 12:00 PM. We are closed on Sundays and holidays.',
    category: 'General Information',
  },
  {
    question: 'Where is the barangay hall located?',
    answer: 'The Barangay Santiago Hall is located at the heart of Barangay Santiago, near the covered court. You can reach us via the main road from the municipal center.',
    category: 'General Information',
  },
  {
    question: 'What is the contact number of the barangay office?',
    answer: 'You can reach us at 0912-345-6789 (Barangay Office) or email us at info@santiago.gov. For emergencies, please call our hotline.',
    category: 'General Information',
  },
  {
    question: 'Who is the Barangay Captain?',
    answer: 'The current Barangay Captain is Hon. Roberto Cruz. The Kagawads are Ana Garcia, Carlos Mendoza (Secretary), and Elena Flores (Treasurer).',
    category: 'General Information',
  },
  // Document Requests
  {
    question: 'How do I get a Barangay Clearance?',
    answer: 'To get a Barangay Clearance, visit the Documents section in this portal or come to the barangay hall. Requirements: Valid ID, proof of residency, and a minimal fee of PHP 50. Processing takes 1 working day.',
    category: 'Document Requests',
  },
  {
    question: 'What are the requirements for a Certificate of Residency?',
    answer: 'Requirements for Certificate of Residency: Valid government ID, proof of address (utility bill or rental contract), and completed application form. Fee: PHP 30. Processing: 1 working day.',
    category: 'Document Requests',
  },
  {
    question: 'How long does it take to process a barangay certificate?',
    answer: 'Most barangay certificates (Clearance, Residency, Indigency) are processed within 1 working day. Business permits take 3 days, and building permits take 5 working days.',
    category: 'Document Requests',
  },
  {
    question: 'Is there a fee for getting a barangay clearance?',
    answer: 'Yes, the fee for Barangay Clearance is PHP 50. Certificate of Residency is PHP 30, and Certificate of Indigency is FREE for qualified applicants.',
    category: 'Document Requests',
  },
  // Emergency Information
  {
    question: 'What is the barangay emergency hotline number?',
    answer: 'Emergency Hotlines:\n- Barangay Office: 0912-345-6789\n- Police Station: 911\n- Fire Department: 160\n- Medical Emergency: 143\n- BDRRMO: 0987-654-3210',
    category: 'Emergency',
  },
  {
    question: 'Where is the nearest health center?',
    answer: 'The Barangay Santiago Health Center is located beside the barangay hall. It is open 24/7 for emergencies. Contact: 0923-456-7890.',
    category: 'Emergency',
  },
  {
    question: 'Where is the evacuation center?',
    answer: 'Evacuation Centers in Barangay Santiago:\n1. Barangay Covered Court (Primary)\n2. Santiago Elementary School\n3. Multi-Purpose Hall\nPlease follow evacuation procedures during emergencies.',
    category: 'Emergency',
  },
  {
    question: 'Who should I contact during a flood or typhoon?',
    answer: 'During emergencies, contact:\n- Barangay Captain: 0912-111-1111\n- BDRRMO Office: 0987-654-3210\n- Local Rescue Team: 911\nStay tuned to official announcements.',
    category: 'Emergency',
  },
  // Complaints
  {
    question: 'How can I report a noise complaint?',
    answer: 'You can file a noise complaint through the Blotter section in this portal or visit the barangay hall. Provide details like location, time, and nature of the disturbance.',
    category: 'Complaints',
  },
  {
    question: 'How do I report a broken streetlight?',
    answer: 'Report broken streetlights to the barangay office at 0912-345-6789 or through our online complaint system. Provide the exact location and we will coordinate with the utility company.',
    category: 'Complaints',
  },
  // Programs and Events
  {
    question: 'What community programs are available?',
    answer: 'Current programs include:\n- Senior Citizen Health Check (Every Monday)\n- Livelihood Training (March 25-29)\n- Youth Basketball League (April)\n- Tree Planting Activity (March 28)\nVisit the Programs section for more details.',
    category: 'Programs',
  },
  {
    question: 'When is the next vaccination schedule?',
    answer: 'Free vaccination is available at the health center every Tuesday and Thursday from 8:00 AM to 4:00 PM. All residents are eligible. Please bring a valid ID.',
    category: 'Programs',
  },
];

// Suggested questions for the chatbot
export const suggestedQuestions = [
  'What are the office hours of the barangay hall?',
  'How do I get a Barangay Clearance?',
  'What is the barangay emergency hotline?',
  'Where is the evacuation center?',
  'What community programs are available?',
  'How can I report a noise complaint?',
];
