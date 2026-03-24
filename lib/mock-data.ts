// Comprehensive Mock Data for Barangay Santiago Saz Portal
// Contains 200+ records across all modules

// ============ HELPER FUNCTIONS ============
const generateId = (prefix: string, num: number) => `${prefix}-${String(num).padStart(4, '0')}`;
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
};

// ============ DOCUMENT TYPES ============
export const mockDocumentTypes = [
  { id: '1', name: 'Barangay Clearance', description: 'For employment and legal purposes', days: 1, fee: 50, requirements: ['Valid ID', '2x2 Photo', 'Proof of Residency'] },
  { id: '2', name: 'Certificate of Residency', description: 'Proof of residence in the barangay', days: 1, fee: 30, requirements: ['Valid ID', 'Utility Bill'] },
  { id: '3', name: 'Certificate of Indigency', description: 'For financial assistance applications', days: 1, fee: 0, requirements: ['Valid ID', 'DSWD Assessment'] },
  { id: '4', name: 'Business Permit Clearance', description: 'For business registration', days: 3, fee: 100, requirements: ['Valid ID', 'DTI Registration', 'Proof of Address'] },
  { id: '5', name: 'Building Permit Clearance', description: 'For construction purposes', days: 5, fee: 150, requirements: ['Valid ID', 'Building Plan', 'Land Title'] },
  { id: '6', name: 'Certificate of Good Moral Character', description: 'Character reference', days: 1, fee: 50, requirements: ['Valid ID', '2x2 Photo'] },
  { id: '7', name: 'Barangay ID', description: 'Official barangay identification', days: 2, fee: 75, requirements: ['Valid ID', '1x1 Photo', 'Birth Certificate'] },
];

// ============ PUROK DATA ============
export const puroks = [
  'Purok 1 - Sampaguita', 'Purok 2 - Rosal', 'Purok 3 - Gumamela', 'Purok 4 - Orchid',
  'Purok 5 - Dahlia', 'Purok 6 - Jasmine', 'Purok 7 - Santan', 'Purok 8 - Camia'
];

// ============ RESIDENTS (100+ records) ============
const firstNames = ['Juan', 'Maria', 'Pedro', 'Elena', 'Roberto', 'Ana', 'Carlos', 'Rosa', 'Miguel', 'Carmen', 'Jose', 'Luz', 'Antonio', 'Teresa', 'Francisco', 'Gloria', 'Manuel', 'Cristina', 'Ricardo', 'Patricia', 'Eduardo', 'Jennifer', 'Ramon', 'Michelle', 'Fernando', 'Angela', 'Alejandro', 'Maricel', 'Gabriel', 'Rosalie', 'Daniel', 'Jasmine', 'Alfredo', 'Evelyn', 'Oscar', 'Grace', 'Benjamin', 'Faith', 'Ernesto', 'Hope'];
const lastNames = ['Dela Cruz', 'Santos', 'Reyes', 'Flores', 'Tan', 'Garcia', 'Mendoza', 'Lopez', 'Gonzales', 'Hernandez', 'Ramos', 'Bautista', 'Villanueva', 'Aquino', 'Cruz', 'Pascual', 'Rivera', 'Fernando', 'Torres', 'Castillo', 'Soriano', 'Mercado', 'Navarro', 'Aguilar', 'Santiago', 'Diaz', 'Morales', 'Jimenez', 'Valdez', 'Marquez'];
const civilStatuses = ['Single', 'Married', 'Widowed', 'Separated'];
const genders = ['Male', 'Female'];
const occupations = ['Farmer', 'Fisherman', 'Teacher', 'Driver', 'Vendor', 'OFW', 'Government Employee', 'Private Employee', 'Self-employed', 'Student', 'Housewife', 'Retired', 'Unemployed'];

export const mockResidents: Array<{
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'pending' | 'inactive';
  avatar: string;
  birthDate: string;
  gender: string;
  civilStatus: string;
  occupation: string;
  registeredDate: string;
  householdHead: string;
  birthCertificateUrl?: string;
  approvedBy?: string;
  approvedDate?: string;
  voterStatus: 'registered' | 'not-registered';
  isPWD: boolean;
  isSenior: boolean;
  is4Ps: boolean;
}> = [];

for (let i = 1; i <= 120; i++) {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const gender = genders[Math.floor(Math.random() * genders.length)];
  const birthYear = 1950 + Math.floor(Math.random() * 55);
  const age = 2026 - birthYear;
  const status = i <= 100 ? 'active' : i <= 110 ? 'pending' : 'inactive';
  
  mockResidents.push({
    id: generateId('RES', i),
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(' ', '')}${i}@email.com`,
    phone: `09${Math.floor(10 + Math.random() * 90)}-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
    address: puroks[Math.floor(Math.random() * puroks.length)],
    status,
    avatar: '',
    birthDate: `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][Math.floor(Math.random() * 12)]} ${Math.floor(1 + Math.random() * 28)}, ${birthYear}`,
    gender,
    civilStatus: civilStatuses[Math.floor(Math.random() * civilStatuses.length)],
    occupation: occupations[Math.floor(Math.random() * occupations.length)],
    registeredDate: randomDate(new Date('2020-01-01'), new Date('2026-03-20')),
    householdHead: i % 3 === 0 ? 'Yes' : 'No',
    birthCertificateUrl: status === 'pending' ? '/uploads/birth-cert-sample.pdf' : undefined,
    approvedBy: status === 'active' ? 'Hon. Roberto Cruz' : undefined,
    approvedDate: status === 'active' ? randomDate(new Date('2020-01-01'), new Date('2026-03-20')) : undefined,
    voterStatus: Math.random() > 0.3 ? 'registered' : 'not-registered',
    isPWD: Math.random() > 0.95,
    isSenior: age >= 60,
    is4Ps: Math.random() > 0.85,
  });
}

// ============ OFFICIALS ============
export const mockOfficials = [
  { id: 'OFF-001', name: 'Hon. Roberto Cruz', position: 'Punong Barangay', email: 'captain@brgy-santiago.gov.ph', contact: '0912-111-1111', status: 'active', termStart: '2023-01-01', termEnd: '2026-12-31' },
  { id: 'OFF-002', name: 'Ana Garcia', position: 'Kagawad - Peace & Order', email: 'ana.garcia@brgy-santiago.gov.ph', contact: '0912-222-2222', status: 'active', termStart: '2023-01-01', termEnd: '2026-12-31' },
  { id: 'OFF-003', name: 'Carlos Mendoza', position: 'Barangay Secretary', email: 'secretary@brgy-santiago.gov.ph', contact: '0912-333-3333', status: 'active', termStart: '2023-01-01', termEnd: '2026-12-31' },
  { id: 'OFF-004', name: 'Elena Flores', position: 'Barangay Treasurer', email: 'treasurer@brgy-santiago.gov.ph', contact: '0912-444-4444', status: 'active', termStart: '2023-01-01', termEnd: '2026-12-31' },
  { id: 'OFF-005', name: 'Miguel Santos', position: 'Kagawad - Health', email: 'miguel.santos@brgy-santiago.gov.ph', contact: '0912-555-5555', status: 'active', termStart: '2023-01-01', termEnd: '2026-12-31' },
  { id: 'OFF-006', name: 'Rosa Reyes', position: 'Kagawad - Education', email: 'rosa.reyes@brgy-santiago.gov.ph', contact: '0912-666-6666', status: 'active', termStart: '2023-01-01', termEnd: '2026-12-31' },
  { id: 'OFF-007', name: 'Jose Tan', position: 'Kagawad - Infrastructure', email: 'jose.tan@brgy-santiago.gov.ph', contact: '0912-777-7777', status: 'active', termStart: '2023-01-01', termEnd: '2026-12-31' },
  { id: 'OFF-008', name: 'Carmen Lopez', position: 'SK Chairperson', email: 'sk@brgy-santiago.gov.ph', contact: '0912-888-8888', status: 'active', termStart: '2023-01-01', termEnd: '2026-12-31' },
];

// ============ ANNOUNCEMENTS ============
export const mockAnnouncements = [
  { id: 'ANN-001', title: 'Community Clean-Up Drive', content: 'Join us this Saturday for our monthly community clean-up drive. All residents are encouraged to participate. Meet at the barangay hall at 6:00 AM. Refreshments will be provided.', category: 'Event', priority: 'medium', date: '2026-03-20', author: 'Hon. Roberto Cruz', postedBy: 'Carlos Mendoza' },
  { id: 'ANN-002', title: 'Vaccination Schedule Update', content: 'Free vaccination for all residents will be available at the health center every Tuesday and Thursday from 8:00 AM to 4:00 PM. Please bring valid ID and wear mask.', category: 'Health', priority: 'high', date: '2026-03-18', author: 'Health Committee', postedBy: 'Miguel Santos' },
  { id: 'ANN-003', title: 'Barangay Assembly Meeting', content: 'All residents are invited to attend the quarterly barangay assembly meeting on March 25, 2026 at 2:00 PM at the covered court. Agenda includes budget report and upcoming projects.', category: 'Meeting', priority: 'high', date: '2026-03-15', author: 'Barangay Council', postedBy: 'Carlos Mendoza' },
  { id: 'ANN-004', title: 'Water Supply Maintenance', content: 'There will be a scheduled water supply interruption on March 22, 2026 from 8:00 AM to 5:00 PM due to maintenance works. Please store water in advance.', category: 'Utilities', priority: 'high', date: '2026-03-14', author: 'Utilities Committee', postedBy: 'Jose Tan' },
  { id: 'ANN-005', title: 'Senior Citizen Pension Distribution', content: 'Distribution of senior citizen social pension will be on March 28, 2026 at the barangay hall. Please bring valid ID and senior citizen card.', category: 'Services', priority: 'medium', date: '2026-03-12', author: 'Social Welfare', postedBy: 'Elena Flores' },
  { id: 'ANN-006', title: 'Youth Sports Fest Registration', content: 'Registration for the annual Youth Sports Fest is now open. Categories include basketball, volleyball, and badminton. Register at the SK office until March 30.', category: 'Event', priority: 'low', date: '2026-03-10', author: 'SK Council', postedBy: 'Carmen Lopez' },
  { id: 'ANN-007', title: 'Free Medical Mission', content: 'A free medical mission will be conducted on April 5, 2026 at the barangay health center. Services include check-up, dental, and free medicines.', category: 'Health', priority: 'high', date: '2026-03-08', author: 'Health Committee', postedBy: 'Miguel Santos' },
  { id: 'ANN-008', title: 'Curfew Reminder for Minors', content: 'Reminder: Curfew for minors is from 10:00 PM to 4:00 AM. Parents are advised to ensure their children are at home during these hours.', category: 'Peace & Order', priority: 'medium', date: '2026-03-05', author: 'Peace & Order Committee', postedBy: 'Ana Garcia' },
];

// ============ PROJECTS (Replaces Programs) ============
export const mockProjects: Array<{
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'planning' | 'ongoing' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  location: string;
  budget: number;
  actualCost: number;
  contractor?: string;
  contractorContact?: string;
  leadBy: string;
  beneficiaries: number;
  requirements: string[];
  milestones: Array<{ name: string; status: 'pending' | 'completed'; date: string }>;
  fundSource: string;
}> = [
  {
    id: 'PRJ-001',
    title: 'Feeding Program 2026',
    description: 'Monthly feeding program for malnourished children aged 0-5 years. Includes nutritious meals, vitamins, and growth monitoring.',
    category: 'Health & Nutrition',
    status: 'ongoing',
    startDate: '2026-01-15',
    endDate: '2026-12-15',
    location: 'Barangay Day Care Center',
    budget: 150000,
    actualCost: 45000,
    leadBy: 'Miguel Santos',
    beneficiaries: 45,
    requirements: ['Rice (10 sacks/month)', 'Vegetables', 'Meat/Fish', 'Cooking Oil', 'Vitamins', 'Feeding Utensils'],
    milestones: [
      { name: 'Program Launch', status: 'completed', date: '2026-01-15' },
      { name: 'Q1 Assessment', status: 'completed', date: '2026-03-15' },
      { name: 'Q2 Assessment', status: 'pending', date: '2026-06-15' },
      { name: 'Year-end Evaluation', status: 'pending', date: '2026-12-15' },
    ],
    fundSource: 'Barangay Development Fund',
  },
  {
    id: 'PRJ-002',
    title: 'Road Concreting - Purok 3',
    description: 'Concreting of 500 linear meters of barangay road in Purok 3 to improve accessibility and drainage.',
    category: 'Infrastructure',
    status: 'ongoing',
    startDate: '2026-02-01',
    endDate: '2026-05-30',
    location: 'Purok 3 - Gumamela',
    budget: 2500000,
    actualCost: 1200000,
    contractor: 'ABC Construction Corp.',
    contractorContact: '0917-123-4567',
    leadBy: 'Jose Tan',
    beneficiaries: 250,
    requirements: ['Cement', 'Gravel', 'Sand', 'Steel Bars', 'Heavy Equipment'],
    milestones: [
      { name: 'Ground Breaking', status: 'completed', date: '2026-02-01' },
      { name: 'Phase 1 (0-200m)', status: 'completed', date: '2026-03-01' },
      { name: 'Phase 2 (200-400m)', status: 'pending', date: '2026-04-15' },
      { name: 'Phase 3 (400-500m)', status: 'pending', date: '2026-05-15' },
      { name: 'Project Completion', status: 'pending', date: '2026-05-30' },
    ],
    fundSource: 'DILG LGSF',
  },
  {
    id: 'PRJ-003',
    title: 'Livelihood Training - Food Processing',
    description: 'Skills training on food processing and preservation for women and out-of-school youth. Includes capital assistance for graduates.',
    category: 'Livelihood',
    status: 'planning',
    startDate: '2026-04-01',
    endDate: '2026-06-30',
    location: 'Barangay Multi-Purpose Hall',
    budget: 200000,
    actualCost: 0,
    leadBy: 'Rosa Reyes',
    beneficiaries: 30,
    requirements: ['Training Materials', 'Food Ingredients', 'Packaging Materials', 'Equipment (Sealer, etc.)', 'Trainer Honorarium'],
    milestones: [
      { name: 'Registration', status: 'pending', date: '2026-03-15' },
      { name: 'Training Proper', status: 'pending', date: '2026-04-01' },
      { name: 'Product Development', status: 'pending', date: '2026-05-15' },
      { name: 'Capital Release', status: 'pending', date: '2026-06-30' },
    ],
    fundSource: 'DOLE TUPAD',
  },
  {
    id: 'PRJ-004',
    title: 'Barangay Health Center Renovation',
    description: 'Complete renovation of the barangay health center including new equipment and expanded consultation rooms.',
    category: 'Infrastructure',
    status: 'completed',
    startDate: '2025-10-01',
    endDate: '2026-01-31',
    location: 'Barangay Health Center',
    budget: 1500000,
    actualCost: 1450000,
    contractor: 'XYZ Builders Inc.',
    contractorContact: '0918-987-6543',
    leadBy: 'Miguel Santos',
    beneficiaries: 5000,
    requirements: ['Construction Materials', 'Medical Equipment', 'Furniture', 'Electrical Works', 'Plumbing'],
    milestones: [
      { name: 'Contract Signing', status: 'completed', date: '2025-10-01' },
      { name: 'Demolition', status: 'completed', date: '2025-10-15' },
      { name: 'Construction', status: 'completed', date: '2025-12-15' },
      { name: 'Equipment Installation', status: 'completed', date: '2026-01-15' },
      { name: 'Inauguration', status: 'completed', date: '2026-01-31' },
    ],
    fundSource: 'DOH Assistance',
  },
  {
    id: 'PRJ-005',
    title: 'Senior Citizen Monthly Program',
    description: 'Monthly activities for senior citizens including health check-up, recreational activities, and social pension distribution.',
    category: 'Social Welfare',
    status: 'ongoing',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    location: 'Barangay Covered Court',
    budget: 120000,
    actualCost: 30000,
    leadBy: 'Elena Flores',
    beneficiaries: 180,
    requirements: ['Medicines', 'Blood Pressure Monitor', 'Refreshments', 'Exercise Materials', 'Program Supplies'],
    milestones: [
      { name: 'January Activity', status: 'completed', date: '2026-01-15' },
      { name: 'February Activity', status: 'completed', date: '2026-02-15' },
      { name: 'March Activity', status: 'completed', date: '2026-03-15' },
    ],
    fundSource: 'Barangay General Fund',
  },
  {
    id: 'PRJ-006',
    title: 'Youth Basketball League 2026',
    description: 'Annual inter-purok basketball tournament for youth aged 15-25 years old with cash prizes for winners.',
    category: 'Sports & Recreation',
    status: 'planning',
    startDate: '2026-04-01',
    endDate: '2026-04-30',
    location: 'Barangay Covered Court',
    budget: 80000,
    actualCost: 0,
    leadBy: 'Carmen Lopez',
    beneficiaries: 120,
    requirements: ['Basketballs', 'Jerseys', 'Trophies', 'Medals', 'Referees', 'First Aid Kit'],
    milestones: [
      { name: 'Team Registration', status: 'pending', date: '2026-03-25' },
      { name: 'Opening Ceremony', status: 'pending', date: '2026-04-01' },
      { name: 'Elimination Round', status: 'pending', date: '2026-04-07' },
      { name: 'Finals', status: 'pending', date: '2026-04-28' },
    ],
    fundSource: 'SK Fund',
  },
  {
    id: 'PRJ-007',
    title: 'Tree Planting and Coastal Clean-up',
    description: 'Environmental protection program including tree planting in hillsides and coastal clean-up activities.',
    category: 'Environment',
    status: 'planning',
    startDate: '2026-06-05',
    endDate: '2026-06-05',
    location: 'Barangay Perimeter & Coastal Area',
    budget: 50000,
    actualCost: 0,
    leadBy: 'Jose Tan',
    beneficiaries: 200,
    requirements: ['Seedlings (500 pcs)', 'Shovels', 'Gloves', 'Trash Bags', 'Snacks', 'T-shirts'],
    milestones: [
      { name: 'Preparation', status: 'pending', date: '2026-06-01' },
      { name: 'Activity Day', status: 'pending', date: '2026-06-05' },
    ],
    fundSource: 'DENR Partnership',
  },
  {
    id: 'PRJ-008',
    title: 'Solar Street Lights Installation',
    description: 'Installation of 20 solar-powered street lights in dark areas of the barangay for safety and security.',
    category: 'Infrastructure',
    status: 'ongoing',
    startDate: '2026-02-15',
    endDate: '2026-04-15',
    location: 'Various Puroks',
    budget: 400000,
    actualCost: 280000,
    contractor: 'Solar Solutions PH',
    contractorContact: '0919-555-1234',
    leadBy: 'Jose Tan',
    beneficiaries: 3000,
    requirements: ['Solar Panels', 'LED Lights', 'Poles', 'Batteries', 'Installation Materials'],
    milestones: [
      { name: 'Site Survey', status: 'completed', date: '2026-02-15' },
      { name: 'Phase 1 Installation (10 units)', status: 'completed', date: '2026-03-15' },
      { name: 'Phase 2 Installation (10 units)', status: 'pending', date: '2026-04-15' },
    ],
    fundSource: 'Municipal Allocation',
  },
];

// ============ DOCUMENT REQUESTS ============
export const mockDocumentRequests: Array<{
  id: string;
  type: string;
  residentId: string;
  residentName: string;
  purpose: string;
  status: 'pending' | 'processing' | 'approved' | 'ready' | 'released' | 'rejected';
  date: string;
  processedBy?: string;
  processedDate?: string;
  uploadedRequirements: string[];
  remarks?: string;
  fee: number;
  refNo?: string;
}> = [];

const purposes = ['Employment', 'School Enrollment', 'Medical Assistance', 'Legal Requirement', 'Bank Requirement', 'Travel', 'Business Application', 'Government Transaction'];
const docStatuses: Array<'pending' | 'processing' | 'approved' | 'ready' | 'released' | 'rejected'> = ['pending', 'processing', 'approved', 'ready', 'released', 'rejected'];

for (let i = 1; i <= 50; i++) {
  const resident = mockResidents[Math.floor(Math.random() * 100)];
  const docType = mockDocumentTypes[Math.floor(Math.random() * mockDocumentTypes.length)];
  const status = docStatuses[Math.floor(Math.random() * docStatuses.length)];
  
  mockDocumentRequests.push({
    id: generateId('DOC', i),
    type: docType.name,
    residentId: resident.id,
    residentName: resident.name,
    purpose: purposes[Math.floor(Math.random() * purposes.length)],
    status,
    date: randomDate(new Date('2026-01-01'), new Date('2026-03-20')),
    processedBy: status !== 'pending' ? mockOfficials[Math.floor(Math.random() * mockOfficials.length)].name : undefined,
    processedDate: status !== 'pending' ? randomDate(new Date('2026-01-01'), new Date('2026-03-20')) : undefined,
    uploadedRequirements: docType.requirements.slice(0, Math.floor(Math.random() * docType.requirements.length) + 1),
    remarks: status === 'rejected' ? 'Incomplete requirements' : undefined,
    fee: docType.fee,
    refNo: status === 'released' ? `REF-${Date.now()}-${i}` : undefined,
  });
}

// ============ BLOTTER CASES ============
export const mockBlotterCases: Array<{
  id: string;
  incidentType: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  reportedBy: string;
  reportedById: string;
  respondent?: string;
  status: 'reported' | 'investigating' | 'mediation' | 'resolved' | 'escalated';
  date: string;
  time: string;
  description: string;
  narrative: string;
  witnesses: string[];
  assignedTo?: string;
  resolution?: string;
  notifyParties: boolean;
}> = [];

const incidentTypes = ['Noise Complaint', 'Property Dispute', 'Physical Altercation', 'Theft', 'Trespassing', 'Verbal Abuse', 'Damage to Property', 'Domestic Issue', 'Lost Item', 'Found Item', 'Animal Complaint', 'Traffic Incident'];

// Santiago, Zambales approximate coordinates
const baseCoords = { lat: 15.1950, lng: 119.8700 };

for (let i = 1; i <= 30; i++) {
  const reporter = mockResidents[Math.floor(Math.random() * 100)];
  const respondent = Math.random() > 0.3 ? mockResidents[Math.floor(Math.random() * 100)] : undefined;
  const statuses: Array<'reported' | 'investigating' | 'mediation' | 'resolved' | 'escalated'> = ['reported', 'investigating', 'mediation', 'resolved', 'escalated'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  mockBlotterCases.push({
    id: generateId('BLT', i),
    incidentType: incidentTypes[Math.floor(Math.random() * incidentTypes.length)],
    location: puroks[Math.floor(Math.random() * puroks.length)],
    coordinates: {
      lat: baseCoords.lat + (Math.random() - 0.5) * 0.02,
      lng: baseCoords.lng + (Math.random() - 0.5) * 0.02,
    },
    reportedBy: reporter.name,
    reportedById: reporter.id,
    respondent: respondent?.name,
    status,
    date: randomDate(new Date('2026-01-01'), new Date('2026-03-20')),
    time: `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
    description: 'Incident requiring barangay intervention',
    narrative: `On the stated date and time, the complainant reported an incident at the location. The respondent was allegedly involved in the incident. Further investigation is being conducted to determine the facts of the case.`,
    witnesses: Math.random() > 0.5 ? [mockResidents[Math.floor(Math.random() * 100)].name] : [],
    assignedTo: status !== 'reported' ? mockOfficials[Math.floor(Math.random() * 4)].name : undefined,
    resolution: status === 'resolved' ? 'Case settled through mediation. Both parties agreed to the terms.' : undefined,
    notifyParties: true,
  });
}

// ============ BUSINESSES ============
const businessTypes = ['Sari-Sari Store', 'Carinderia', 'Bakery', 'Hardware', 'Auto Repair', 'Salon/Barber', 'Internet Cafe', 'Water Refilling', 'Laundry', 'Pharmacy', 'Rice Mill', 'Livestock'];

export const mockBusinesses: Array<{
  id: string;
  businessName: string;
  ownerName: string;
  ownerId: string;
  type: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  permitNumber: string;
  status: 'active' | 'expiring' | 'expired' | 'pending';
  registeredDate: string;
  expiryDate: string;
  capitalInvestment: number;
  grossSales: number;
  employees: number;
  requirements: string[];
}> = [];

for (let i = 1; i <= 40; i++) {
  const owner = mockResidents[Math.floor(Math.random() * 100)];
  const type = businessTypes[Math.floor(Math.random() * businessTypes.length)];
  const registeredDate = randomDate(new Date('2023-01-01'), new Date('2026-01-01'));
  const expiryDate = new Date(registeredDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  const expiryStr = expiryDate.toISOString().split('T')[0];
  
  // Determine status based on expiry
  const today = new Date('2026-03-20');
  const expiry = new Date(expiryStr);
  const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  let status: 'active' | 'expiring' | 'expired' | 'pending' = 'active';
  if (daysUntilExpiry < 0) status = 'expired';
  else if (daysUntilExpiry < 30) status = 'expiring';
  else if (i > 35) status = 'pending';
  
  mockBusinesses.push({
    id: generateId('BUS', i),
    businessName: `${owner.name.split(' ')[0]}'s ${type}`,
    ownerName: owner.name,
    ownerId: owner.id,
    type,
    address: puroks[Math.floor(Math.random() * puroks.length)],
    coordinates: {
      lat: baseCoords.lat + (Math.random() - 0.5) * 0.02,
      lng: baseCoords.lng + (Math.random() - 0.5) * 0.02,
    },
    permitNumber: `BP-${2025 + Math.floor(i / 40)}-${String(i).padStart(3, '0')}`,
    status,
    registeredDate,
    expiryDate: expiryStr,
    capitalInvestment: Math.floor(10000 + Math.random() * 490000),
    grossSales: Math.floor(50000 + Math.random() * 950000),
    employees: Math.floor(1 + Math.random() * 10),
    requirements: ['DTI Certificate', 'Barangay Clearance', 'Fire Safety Certificate', 'Sanitary Permit'].slice(0, 2 + Math.floor(Math.random() * 3)),
  });
}

// ============ PROPERTY / ASSETS ============
export const mockAssets: Array<{
  id: string;
  name: string;
  category: 'Equipment' | 'Vehicle' | 'Furniture' | 'Building' | 'Land' | 'IT Equipment';
  description: string;
  acquisitionDate: string;
  acquisitionCost: number;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'For Disposal';
  location: string;
  accountableOfficer: string;
  serialNumber?: string;
  warranty?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
}> = [
  { id: 'AST-001', name: 'Barangay Service Vehicle', category: 'Vehicle', description: 'Toyota Innova 2023 - Official vehicle', acquisitionDate: '2023-06-15', acquisitionCost: 1500000, condition: 'Excellent', location: 'Barangay Hall Parking', accountableOfficer: 'Hon. Roberto Cruz', serialNumber: 'TOY-2023-INV-001', warranty: '2026-06-15', lastMaintenance: '2026-02-01', nextMaintenance: '2026-05-01' },
  { id: 'AST-002', name: 'Rescue Ambulance', category: 'Vehicle', description: 'Mitsubishi L300 Ambulance - Emergency response', acquisitionDate: '2022-03-20', acquisitionCost: 800000, condition: 'Good', location: 'Barangay Health Center', accountableOfficer: 'Miguel Santos', serialNumber: 'MIT-2022-L300-001', lastMaintenance: '2026-01-15', nextMaintenance: '2026-04-15' },
  { id: 'AST-003', name: 'Sound System', category: 'Equipment', description: 'Complete PA system with speakers and microphones', acquisitionDate: '2024-01-10', acquisitionCost: 75000, condition: 'Excellent', location: 'Barangay Multi-Purpose Hall', accountableOfficer: 'Carlos Mendoza' },
  { id: 'AST-004', name: 'Generator Set', category: 'Equipment', description: '10KVA Generator for emergency power', acquisitionDate: '2023-09-01', acquisitionCost: 120000, condition: 'Good', location: 'Barangay Hall', accountableOfficer: 'Jose Tan', serialNumber: 'GEN-2023-10K-001', lastMaintenance: '2026-03-01', nextMaintenance: '2026-06-01' },
  { id: 'AST-005', name: 'Office Desks (10 units)', category: 'Furniture', description: 'Steel office desks with drawers', acquisitionDate: '2023-01-15', acquisitionCost: 50000, condition: 'Good', location: 'Barangay Hall Office', accountableOfficer: 'Carlos Mendoza' },
  { id: 'AST-006', name: 'Desktop Computers (5 units)', category: 'IT Equipment', description: 'HP Desktop computers for office use', acquisitionDate: '2024-06-01', acquisitionCost: 200000, condition: 'Excellent', location: 'Barangay Hall Office', accountableOfficer: 'Carlos Mendoza', warranty: '2027-06-01' },
  { id: 'AST-007', name: 'Printer/Scanner (2 units)', category: 'IT Equipment', description: 'Epson L3210 All-in-one printers', acquisitionDate: '2024-06-01', acquisitionCost: 30000, condition: 'Excellent', location: 'Barangay Hall Office', accountableOfficer: 'Carlos Mendoza', warranty: '2026-06-01' },
  { id: 'AST-008', name: 'Covered Court', category: 'Building', description: 'Multi-purpose covered court', acquisitionDate: '2020-05-15', acquisitionCost: 5000000, condition: 'Good', location: 'Barangay Proper', accountableOfficer: 'Hon. Roberto Cruz' },
  { id: 'AST-009', name: 'Day Care Center', category: 'Building', description: 'Barangay Day Care Center building', acquisitionDate: '2018-03-01', acquisitionCost: 2000000, condition: 'Fair', location: 'Purok 2', accountableOfficer: 'Rosa Reyes' },
  { id: 'AST-010', name: 'Water Pump System', category: 'Equipment', description: 'Deep well pump system for water supply', acquisitionDate: '2022-08-15', acquisitionCost: 150000, condition: 'Good', location: 'Barangay Water Station', accountableOfficer: 'Jose Tan', lastMaintenance: '2026-02-15', nextMaintenance: '2026-05-15' },
  { id: 'AST-011', name: 'CCTV System', category: 'IT Equipment', description: '16-channel CCTV with 8 cameras', acquisitionDate: '2025-01-15', acquisitionCost: 80000, condition: 'Excellent', location: 'Barangay Hall', accountableOfficer: 'Ana Garcia', warranty: '2028-01-15' },
  { id: 'AST-012', name: 'Folding Chairs (100 units)', category: 'Furniture', description: 'Plastic folding chairs for events', acquisitionDate: '2023-05-20', acquisitionCost: 40000, condition: 'Good', location: 'Barangay Bodega', accountableOfficer: 'Carlos Mendoza' },
  { id: 'AST-013', name: 'Tanod Bicycles (5 units)', category: 'Vehicle', description: 'Mountain bikes for barangay tanod patrol', acquisitionDate: '2024-02-01', acquisitionCost: 50000, condition: 'Good', location: 'Tanod Outpost', accountableOfficer: 'Ana Garcia' },
  { id: 'AST-014', name: 'Emergency Lights (20 units)', category: 'Equipment', description: 'Rechargeable emergency lights', acquisitionDate: '2025-06-01', acquisitionCost: 20000, condition: 'Excellent', location: 'Various Evacuation Centers', accountableOfficer: 'Ana Garcia' },
  { id: 'AST-015', name: 'First Aid Kits (10 units)', category: 'Equipment', description: 'Complete first aid kits for emergencies', acquisitionDate: '2025-01-01', acquisitionCost: 15000, condition: 'Excellent', location: 'Barangay Health Center', accountableOfficer: 'Miguel Santos' },
];

// ============ DRRM (Disaster Risk Reduction Management) ============
export const mockEvacuationCenters = [
  { id: 'EC-001', name: 'Barangay Covered Court', capacity: 500, currentOccupancy: 0, status: 'available', address: 'Barangay Proper', coordinates: { lat: 15.1950, lng: 119.8700 }, facilities: ['Restrooms', 'Water Supply', 'Electrical Outlets', 'Kitchen Area'], contactPerson: 'Jose Tan', contactNumber: '0912-777-7777' },
  { id: 'EC-002', name: 'Santiago Elementary School', capacity: 800, currentOccupancy: 0, status: 'available', address: 'Purok 1', coordinates: { lat: 15.1960, lng: 119.8710 }, facilities: ['Classrooms', 'Restrooms', 'Water Supply', 'Open Ground'], contactPerson: 'Principal Maria Santos', contactNumber: '0923-111-2222' },
  { id: 'EC-003', name: 'Barangay Multi-Purpose Hall', capacity: 300, currentOccupancy: 0, status: 'available', address: 'Barangay Proper', coordinates: { lat: 15.1945, lng: 119.8695 }, facilities: ['Restrooms', 'Kitchen', 'Stage Area'], contactPerson: 'Carlos Mendoza', contactNumber: '0912-333-3333' },
  { id: 'EC-004', name: 'Chapel of San Santiago', capacity: 200, currentOccupancy: 0, status: 'standby', address: 'Purok 4', coordinates: { lat: 15.1940, lng: 119.8720 }, facilities: ['Restrooms', 'Covered Area'], contactPerson: 'Fr. Antonio', contactNumber: '0934-555-6666' },
];

export const mockHazardZones = [
  { id: 'HZ-001', type: 'Flood', riskLevel: 'High', description: 'Low-lying area prone to flooding during heavy rains', affectedPuroks: ['Purok 3', 'Purok 4'], coordinates: [{ lat: 15.1935, lng: 119.8680 }, { lat: 15.1940, lng: 119.8690 }, { lat: 15.1930, lng: 119.8695 }] },
  { id: 'HZ-002', type: 'Landslide', riskLevel: 'Medium', description: 'Hillside area with potential landslide risk', affectedPuroks: ['Purok 7', 'Purok 8'], coordinates: [{ lat: 15.1970, lng: 119.8730 }, { lat: 15.1975, lng: 119.8740 }] },
  { id: 'HZ-003', type: 'Storm Surge', riskLevel: 'High', description: 'Coastal area vulnerable to storm surge', affectedPuroks: ['Purok 1', 'Purok 2'], coordinates: [{ lat: 15.1920, lng: 119.8650 }, { lat: 15.1925, lng: 119.8660 }] },
];

export const mockCalamityRelief: Array<{
  id: string;
  calamityName: string;
  calamityDate: string;
  totalBeneficiaries: number;
  distributions: Array<{
    id: string;
    residentId: string;
    residentName: string;
    items: string[];
    distributionDate: string;
    receivedBy: string;
  }>;
}> = [
  {
    id: 'CR-001',
    calamityName: 'Typhoon Aghon',
    calamityDate: '2025-07-15',
    totalBeneficiaries: 150,
    distributions: [
      { id: 'CRD-001', residentId: 'RES-0001', residentName: 'Juan Dela Cruz', items: ['Rice (5kg)', 'Canned Goods', 'Water (5 gallons)'], distributionDate: '2025-07-18', receivedBy: 'Juan Dela Cruz' },
      { id: 'CRD-002', residentId: 'RES-0002', residentName: 'Maria Santos', items: ['Rice (5kg)', 'Canned Goods', 'Water (5 gallons)'], distributionDate: '2025-07-18', receivedBy: 'Maria Santos' },
    ],
  },
];

export const mockEmergencyContacts = [
  { id: 'EMC-001', name: 'Barangay Emergency Hotline', number: '0912-345-6789', type: 'Primary' },
  { id: 'EMC-002', name: 'BDRRMO Office', number: '0987-654-3210', type: 'DRRM' },
  { id: 'EMC-003', name: 'Police Station', number: '911', type: 'Police' },
  { id: 'EMC-004', name: 'Fire Department', number: '160', type: 'Fire' },
  { id: 'EMC-005', name: 'Medical Emergency', number: '143', type: 'Medical' },
  { id: 'EMC-006', name: 'Municipal MDRRMO', number: '0918-888-9999', type: 'DRRM' },
  { id: 'EMC-007', name: 'Red Cross Zambales', number: '(047) 811-1234', type: 'Medical' },
];

export const mockResponsePlans = [
  { id: 'RP-001', type: 'Flood', title: 'Flood Response Plan', steps: ['Monitor weather updates', 'Alert residents in flood-prone areas', 'Prepare evacuation centers', 'Conduct pre-emptive evacuation if needed', 'Deploy rescue teams', 'Distribute relief goods', 'Conduct damage assessment'], lastUpdated: '2026-01-15' },
  { id: 'RP-002', type: 'Fire', title: 'Fire Response Plan', steps: ['Call fire department immediately', 'Alert affected households', 'Evacuate residents to safe area', 'Assist fire responders', 'Document damage', 'Coordinate relief assistance'], lastUpdated: '2026-01-15' },
  { id: 'RP-003', type: 'Earthquake', title: 'Earthquake Response Plan', steps: ['Duck, Cover, and Hold', 'Evacuate to open areas after shaking stops', 'Check for injuries and damage', 'Avoid damaged structures', 'Report to barangay officials', 'Wait for official announcements'], lastUpdated: '2026-01-15' },
];

// ============ GAD (Gender and Development) ============
export const mockGADBudget = {
  year: 2026,
  totalBudget: 500000,
  allocated: 450000,
  utilized: 180000,
  programs: [
    { id: 'GAD-P001', name: "Women's Health Program", budget: 100000, utilized: 45000, beneficiaries: 120, status: 'ongoing' },
    { id: 'GAD-P002', name: 'Anti-VAW Campaign', budget: 80000, utilized: 35000, beneficiaries: 500, status: 'ongoing' },
    { id: 'GAD-P003', name: 'Livelihood for Women', budget: 150000, utilized: 60000, beneficiaries: 30, status: 'ongoing' },
    { id: 'GAD-P004', name: "Children's Rights Awareness", budget: 70000, utilized: 25000, beneficiaries: 200, status: 'ongoing' },
    { id: 'GAD-P005', name: 'LGBTQ+ Sensitivity Training', budget: 50000, utilized: 15000, beneficiaries: 50, status: 'planning' },
  ],
};

export const mockVAWRecords: Array<{
  id: string;
  caseNumber: string;
  reportDate: string;
  incidentType: string;
  status: 'active' | 'resolved' | 'referred' | 'closed';
  referredTo?: string;
  actionsTaken: string[];
}> = [
  { id: 'VAW-001', caseNumber: 'VAW-2026-001', reportDate: '2026-01-15', incidentType: 'Physical Abuse', status: 'referred', referredTo: 'DSWD', actionsTaken: ['Initial interview', 'Medical assistance', 'Referred to DSWD'] },
  { id: 'VAW-002', caseNumber: 'VAW-2026-002', reportDate: '2026-02-20', incidentType: 'Psychological Abuse', status: 'active', actionsTaken: ['Counseling session', 'Legal consultation'] },
  { id: 'VAW-003', caseNumber: 'VAW-2026-003', reportDate: '2026-03-05', incidentType: 'Economic Abuse', status: 'resolved', actionsTaken: ['Mediation', 'Financial support', 'Livelihood assistance'] },
];

export const mockGADAccomplishments = [
  { id: 'GAD-A001', year: 2025, quarter: 'Q4', activity: "Women's Day Celebration", participants: 150, budget: 25000, outcome: 'Successful celebration with livelihood showcase' },
  { id: 'GAD-A002', year: 2026, quarter: 'Q1', activity: 'Anti-VAW Seminar', participants: 80, budget: 15000, outcome: 'Increased awareness on VAW reporting' },
  { id: 'GAD-A003', year: 2026, quarter: 'Q1', activity: 'Health Screening for Women', participants: 100, budget: 20000, outcome: 'Early detection of health issues' },
];

// ============ ORDINANCES / RESOLUTIONS ============
export const mockOrdinances: Array<{
  id: string;
  number: string;
  title: string;
  type: 'Ordinance' | 'Resolution' | 'Executive Order';
  dateEnacted: string;
  author: string;
  status: 'Active' | 'Amended' | 'Repealed';
  summary: string;
  fullText: string;
  attachmentUrl?: string;
}> = [
  { id: 'ORD-001', number: 'BO-2026-001', title: 'Anti-Littering Ordinance', type: 'Ordinance', dateEnacted: '2026-01-15', author: 'Hon. Roberto Cruz', status: 'Active', summary: 'Prohibits littering in all public areas with corresponding penalties', fullText: 'SECTION 1. Title. This ordinance shall be known as the "Anti-Littering Ordinance of Barangay Santiago."\n\nSECTION 2. Prohibited Acts. The following acts are prohibited:\na) Throwing garbage in public places\nb) Improper disposal of waste\nc) Burning of garbage in residential areas\n\nSECTION 3. Penalties. Violators shall be fined as follows:\nFirst offense: PHP 500\nSecond offense: PHP 1,000\nThird offense: PHP 2,000 and community service' },
  { id: 'ORD-002', number: 'BO-2026-002', title: 'Curfew for Minors', type: 'Ordinance', dateEnacted: '2026-01-20', author: 'Ana Garcia', status: 'Active', summary: 'Sets curfew hours for minors from 10PM to 4AM', fullText: 'SECTION 1. Curfew Hours. All minors (below 18 years old) are prohibited from loitering in public places from 10:00 PM to 4:00 AM.\n\nSECTION 2. Exceptions. The following are exempted:\na) Minors accompanied by parents/guardians\nb) Students going to/from school\nc) Emergency situations\n\nSECTION 3. Penalties. Parents/guardians of violating minors shall be fined PHP 500 for the first offense.' },
  { id: 'ORD-003', number: 'BR-2026-001', title: 'Commendation for COVID-19 Frontliners', type: 'Resolution', dateEnacted: '2026-02-01', author: 'Barangay Council', status: 'Active', summary: 'Resolution commending barangay health workers and frontliners', fullText: 'WHEREAS, the barangay health workers and frontliners have shown exemplary dedication during the pandemic...\n\nRESOLVED, that the Barangay Council of Santiago hereby commends all frontliners for their service and sacrifice.' },
  { id: 'ORD-004', number: 'EO-2026-001', title: 'Creation of Barangay Task Force on Environment', type: 'Executive Order', dateEnacted: '2026-02-15', author: 'Hon. Roberto Cruz', status: 'Active', summary: 'Creates a task force to oversee environmental programs', fullText: 'By virtue of the powers vested in me as Punong Barangay...\n\nSECTION 1. There is hereby created a Barangay Task Force on Environment.\n\nSECTION 2. Composition: Kagawad on Environment as Chair, 2 Tanods, 3 Volunteer members.' },
  { id: 'ORD-005', number: 'BO-2025-005', title: 'Noise Pollution Control', type: 'Ordinance', dateEnacted: '2025-06-15', author: 'Ana Garcia', status: 'Active', summary: 'Regulates noise levels in residential areas', fullText: 'SECTION 1. Prohibited Noise. Loud sounds that disturb public peace are prohibited between 10:00 PM and 6:00 AM.\n\nSECTION 2. Exemptions: Religious activities, emergency situations, approved events.\n\nSECTION 3. Penalties: PHP 500 - 2,000 depending on severity.' },
];

// ============ NOTIFICATIONS ============
export const mockNotifications = [
  { id: 'NOT-001', title: 'Document Approved', message: 'Your Barangay Clearance request has been approved. Please proceed to the barangay hall for pickup.', type: 'success', read: false, date: '2026-03-20T10:30:00', userId: 'RES-0001', actionUrl: '/resident/documents' },
  { id: 'NOT-002', title: 'New Announcement', message: 'Community Clean-Up Drive scheduled for this Saturday. Join us!', type: 'info', read: false, date: '2026-03-20T09:00:00', userId: 'all', actionUrl: '/resident/announcements' },
  { id: 'NOT-003', title: 'Blotter Update', message: 'Your reported case (BLT-0015) is now under investigation.', type: 'warning', read: false, date: '2026-03-19T15:00:00', userId: 'RES-0005', actionUrl: '/resident/blotter' },
  { id: 'NOT-004', title: 'Document Ready', message: 'Your Certificate of Residency is ready for pickup.', type: 'success', read: true, date: '2026-03-18T14:00:00', userId: 'RES-0002', actionUrl: '/resident/documents' },
  { id: 'NOT-005', title: 'Registration Approved', message: 'Your resident registration has been approved. Welcome to Barangay Santiago!', type: 'success', read: false, date: '2026-03-17T11:00:00', userId: 'RES-0110', actionUrl: '/resident/profile' },
  { id: 'NOT-006', title: 'Missing Requirements', message: 'Your document request requires additional documents. Please upload the missing requirements.', type: 'warning', read: false, date: '2026-03-16T16:30:00', userId: 'RES-0003', actionUrl: '/resident/documents' },
];

// ============ AXL AI CHATBOT DATA ============
export const axlFaqData = [
  // General Information
  { question: 'What are the office hours of the barangay hall?', answer: 'The Barangay Santiago Hall is open Monday to Friday from 8:00 AM to 5:00 PM, and Saturday from 8:00 AM to 12:00 PM. We are closed on Sundays and holidays.', category: 'General Information' },
  { question: 'Where is the barangay hall located?', answer: 'The Barangay Santiago Hall is located at the heart of Barangay Santiago, near the covered court. You can reach us via the main road from the municipal center.', category: 'General Information' },
  { question: 'What is the contact number of the barangay office?', answer: 'You can reach us at 0912-345-6789 (Barangay Office) or email us at info@brgy-santiago.gov.ph. For emergencies, call our hotline.', category: 'General Information' },
  { question: 'Who is the Barangay Captain?', answer: 'The current Punong Barangay is Hon. Roberto Cruz. The council includes Kagawads Ana Garcia (Peace & Order), Miguel Santos (Health), Rosa Reyes (Education), and Jose Tan (Infrastructure).', category: 'General Information' },
  
  // Document Requests
  { question: 'How do I get a Barangay Clearance?', answer: 'To get a Barangay Clearance: 1) Go to Documents section in this portal, 2) Select "Request Document", 3) Choose Barangay Clearance, 4) Upload requirements (Valid ID, 2x2 Photo, Proof of Residency), 5) Pay PHP 50 fee. Processing takes 1 working day.', category: 'Document Requests' },
  { question: 'What documents can I request online?', answer: 'You can request: Barangay Clearance (PHP 50), Certificate of Residency (PHP 30), Certificate of Indigency (FREE), Business Permit Clearance (PHP 100), Building Permit Clearance (PHP 150), Certificate of Good Moral (PHP 50), and Barangay ID (PHP 75).', category: 'Document Requests' },
  { question: 'What are the requirements for each document?', answer: 'Requirements vary: Clearance needs Valid ID, 2x2 Photo, Proof of Residency. Residency needs Valid ID and Utility Bill. Business Clearance needs Valid ID, DTI Registration, and Proof of Address. Check the Documents page for complete list.', category: 'Document Requests' },
  { question: 'How long does document processing take?', answer: 'Processing times: Clearances and Certificates = 1 day, Business Permit Clearance = 3 days, Building Permit Clearance = 5 days, Barangay ID = 2 days.', category: 'Document Requests' },
  
  // Blotter
  { question: 'How do I file a blotter report?', answer: 'To file a blotter: 1) Go to Blotter section, 2) Click "Report Incident", 3) Fill out the form with incident details, 4) Pin the location on the map, 5) Submit. You can track your case status in the same section.', category: 'Blotter' },
  { question: 'What types of incidents can be reported?', answer: 'You can report: Noise Complaints, Property Disputes, Physical Altercations, Theft, Trespassing, Verbal Abuse, Damage to Property, Domestic Issues, Lost/Found Items, Animal Complaints, and Traffic Incidents.', category: 'Blotter' },
  
  // Emergency/DRRM
  { question: 'What is the barangay emergency hotline?', answer: 'Emergency Contacts:\n- Barangay Office: 0912-345-6789\n- BDRRMO: 0987-654-3210\n- Police: 911\n- Fire: 160\n- Medical: 143', category: 'Emergency' },
  { question: 'Where are the evacuation centers?', answer: 'Evacuation Centers:\n1. Barangay Covered Court (500 capacity) - Primary\n2. Santiago Elementary School (800 capacity)\n3. Multi-Purpose Hall (300 capacity)\n4. Chapel of San Santiago (200 capacity)', category: 'Emergency' },
  { question: 'What should I do during a flood?', answer: 'During floods: 1) Monitor weather updates, 2) Prepare emergency kit, 3) Move to higher ground if in flood-prone area, 4) Follow evacuation orders, 5) Go to designated evacuation center, 6) Bring important documents. Avoid crossing flooded areas.', category: 'Emergency' },
  
  // Projects
  { question: 'What projects are currently ongoing?', answer: 'Current projects: 1) Feeding Program 2026 - ongoing, 2) Road Concreting Purok 3 - ongoing, 3) Solar Street Lights Installation - ongoing, 4) Senior Citizen Monthly Program - ongoing. Visit Projects section for details.', category: 'Projects' },
  { question: 'How can I participate in barangay programs?', answer: 'To participate: 1) Check the Projects/Announcements section for available programs, 2) Register at the barangay hall or through this portal, 3) Attend orientation if required. Most programs are free for residents.', category: 'Projects' },
  
  // Business
  { question: 'How do I register a business?', answer: 'Business registration: 1) Prepare DTI Certificate, Barangay Clearance, Fire Safety Certificate, Sanitary Permit, 2) Fill out application at barangay hall, 3) Pay corresponding fees, 4) Wait for inspection and approval. Processing takes 3-5 working days.', category: 'Business' },
  { question: 'When should I renew my business permit?', answer: 'Business permits should be renewed every January. Late renewal incurs penalties. Check the Business section to see your permit status (green = active, orange = expiring soon, red = expired).', category: 'Business' },
  
  // GAD
  { question: 'What is GAD and how can I avail of its programs?', answer: 'GAD (Gender and Development) provides programs for women, children, and LGBTQ+ community. Programs include: Health Screening, Livelihood Training, Anti-VAW Campaign. Visit the barangay hall or GAD section to register.', category: 'GAD' },
  { question: 'How do I report violence against women?', answer: 'To report VAW: 1) Contact VAW Desk at barangay hall, 2) Call hotline 0912-345-6789, 3) Report through this portal confidentially. All reports are treated with utmost confidentiality. Assistance includes counseling, medical help, and legal support.', category: 'GAD' },
  
  // Assets
  { question: 'What facilities does the barangay have?', answer: 'Barangay facilities: Covered Court, Multi-Purpose Hall, Health Center, Day Care Center, Water Station. Equipment available: Service Vehicle, Ambulance, Sound System, Generator. Contact barangay office for facility reservations.', category: 'Assets' },
  
  // Reports
  { question: 'What reports does the barangay submit?', answer: 'The barangay submits: CBMS Report (demographics), GAD Accomplishment Report, DRRM Report, Monthly Summary Report, Barangay Profile Report to DILG and other agencies. These ensure proper monitoring and fund allocation.', category: 'Reports' },
];

export const suggestedQuestions = [
  'What are the office hours of the barangay hall?',
  'How do I get a Barangay Clearance?',
  'What is the barangay emergency hotline?',
  'Where are the evacuation centers?',
  'What projects are currently ongoing?',
  'How do I file a blotter report?',
  'How can I report violence against women?',
  'What facilities does the barangay have?',
];
