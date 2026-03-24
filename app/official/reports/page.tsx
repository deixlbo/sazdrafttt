'use client';

import { useState } from 'react';
import { 
  FileBarChart, 
  Download, 
  FileText, 
  Users, 
  Building2,
  Heart,
  ShieldAlert,
  Calendar,
  Printer,
  BarChart3,
  PieChart,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  mockResidents, 
  mockBusinesses, 
  mockBlotterCases, 
  mockDocumentRequests,
  mockGADBudget,
  mockProjects,
  mockAssets,
  mockEvacuationCenters
} from '@/lib/mock-data';

type ReportType = {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ElementType;
  requiredBy: string;
};

const reportTypes: ReportType[] = [
  { id: 'cbms', name: 'CBMS Report', description: 'Community-Based Monitoring System - Demographics and socioeconomic data', category: 'DILG', icon: Users, requiredBy: 'DILG (Quarterly)' },
  { id: 'gad', name: 'GAD Accomplishment Report', description: 'Gender and Development activities and budget utilization', category: 'DILG', icon: Heart, requiredBy: 'DILG (Quarterly)' },
  { id: 'drrm', name: 'DRRM Report', description: 'Disaster Risk Reduction and Management activities', category: 'DILG', icon: ShieldAlert, requiredBy: 'DILG/NDRRMC (Monthly)' },
  { id: 'monthly', name: 'Monthly Summary Report', description: 'Overall barangay activities and accomplishments', category: 'Internal', icon: Calendar, requiredBy: 'Municipal (Monthly)' },
  { id: 'demographics', name: 'Demographics Statistics', description: 'Population breakdown by age, gender, civil status', category: 'Statistics', icon: BarChart3, requiredBy: 'PSA (Annual)' },
  { id: 'profile', name: 'Barangay Profile Report', description: 'Complete barangay profile and status report', category: 'DILG', icon: FileText, requiredBy: 'DILG (Annual)' },
  { id: 'business', name: 'Business Establishments Report', description: 'List of registered businesses and permits', category: 'Internal', icon: Building2, requiredBy: 'Municipal (Quarterly)' },
  { id: 'blotter', name: 'Blotter Summary Report', description: 'Peace and order situation report', category: 'Internal', icon: FileBarChart, requiredBy: 'PNP (Monthly)' },
];

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState('03');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  // Calculate statistics for reports
  const stats = {
    totalResidents: mockResidents.length,
    activeResidents: mockResidents.filter(r => r.status === 'active').length,
    maleResidents: mockResidents.filter(r => r.gender === 'Male').length,
    femaleResidents: mockResidents.filter(r => r.gender === 'Female').length,
    seniors: mockResidents.filter(r => r.isSenior).length,
    pwd: mockResidents.filter(r => r.isPWD).length,
    fourPs: mockResidents.filter(r => r.is4Ps).length,
    voters: mockResidents.filter(r => r.voterStatus === 'registered').length,
    totalBusinesses: mockBusinesses.length,
    activeBusinesses: mockBusinesses.filter(b => b.status === 'active').length,
    totalBlotters: mockBlotterCases.length,
    resolvedBlotters: mockBlotterCases.filter(b => b.status === 'resolved').length,
    totalDocRequests: mockDocumentRequests.length,
    processedDocs: mockDocumentRequests.filter(d => d.status === 'released').length,
  };

  const generateReport = (reportId: string) => {
    setGeneratingReport(reportId);
    
    setTimeout(() => {
      let reportContent = '';
      const monthName = months.find(m => m.value === selectedMonth)?.label || '';
      const header = `
================================================================================
                         REPUBLIC OF THE PHILIPPINES
                           Province of Zambales
                        Municipality of San Felipe
                          BARANGAY SANTIAGO

                              ${reportTypes.find(r => r.id === reportId)?.name.toUpperCase()}
                              ${monthName} ${selectedYear}
================================================================================
Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
`;

      switch (reportId) {
        case 'cbms':
          reportContent = `${header}
COMMUNITY-BASED MONITORING SYSTEM (CBMS) REPORT
===============================================

I. POPULATION SUMMARY
---------------------
Total Registered Residents: ${stats.totalResidents}
Active Residents: ${stats.activeResidents}
Male: ${stats.maleResidents} (${((stats.maleResidents / stats.totalResidents) * 100).toFixed(1)}%)
Female: ${stats.femaleResidents} (${((stats.femaleResidents / stats.totalResidents) * 100).toFixed(1)}%)

II. SPECIAL SECTORS
-------------------
Senior Citizens (60+): ${stats.seniors}
Persons with Disabilities: ${stats.pwd}
4Ps Beneficiaries: ${stats.fourPs}
Registered Voters: ${stats.voters}

III. CIVIL STATUS BREAKDOWN
---------------------------
${['Single', 'Married', 'Widowed', 'Separated'].map(status => {
  const count = mockResidents.filter(r => r.civilStatus === status).length;
  return `${status}: ${count} (${((count / stats.totalResidents) * 100).toFixed(1)}%)`;
}).join('\n')}

IV. OCCUPATION DISTRIBUTION
---------------------------
${Array.from(new Set(mockResidents.map(r => r.occupation))).map(occ => {
  const count = mockResidents.filter(r => r.occupation === occ).length;
  return `${occ}: ${count}`;
}).join('\n')}

V. PUROK DISTRIBUTION
---------------------
${Array.from(new Set(mockResidents.map(r => r.address))).map(addr => {
  const count = mockResidents.filter(r => r.address === addr).length;
  return `${addr}: ${count} residents`;
}).join('\n')}

Prepared by: Carlos Mendoza, Barangay Secretary
Certified Correct: Hon. Roberto Cruz, Punong Barangay
`;
          break;

        case 'gad':
          reportContent = `${header}
GENDER AND DEVELOPMENT (GAD) ACCOMPLISHMENT REPORT
==================================================

I. GAD BUDGET SUMMARY
---------------------
Total GAD Budget: PHP ${mockGADBudget.totalBudget.toLocaleString()}
Allocated: PHP ${mockGADBudget.allocated.toLocaleString()}
Utilized: PHP ${mockGADBudget.utilized.toLocaleString()}
Utilization Rate: ${((mockGADBudget.utilized / mockGADBudget.allocated) * 100).toFixed(1)}%

II. GAD PROGRAMS
----------------
${mockGADBudget.programs.map(p => `
Program: ${p.name}
Budget: PHP ${p.budget.toLocaleString()}
Utilized: PHP ${p.utilized.toLocaleString()}
Beneficiaries: ${p.beneficiaries}
Status: ${p.status}
`).join('\n')}

III. GAD-RELATED STATISTICS
---------------------------
Female Population: ${stats.femaleResidents} (${((stats.femaleResidents / stats.totalResidents) * 100).toFixed(1)}%)
Women-led Households: ${mockResidents.filter(r => r.householdHead === 'Yes' && r.gender === 'Female').length}

IV. VAW DESK SUMMARY (Confidential)
-----------------------------------
Total Cases Handled: 3
Resolved: 1
Referred to DSWD: 1
Active: 1

Prepared by: GAD Focal Person
Certified Correct: Hon. Roberto Cruz, Punong Barangay
`;
          break;

        case 'drrm':
          reportContent = `${header}
DISASTER RISK REDUCTION AND MANAGEMENT (DRRM) REPORT
====================================================

I. EVACUATION CENTERS STATUS
----------------------------
${mockEvacuationCenters.map(ec => `
${ec.name}
- Address: ${ec.address}
- Capacity: ${ec.capacity} persons
- Current Status: ${ec.status}
- Contact: ${ec.contactPerson} (${ec.contactNumber})
`).join('\n')}

II. BDRRM ACTIVITIES
--------------------
- Regular inspection of evacuation centers
- Updated early warning systems
- Community disaster drills conducted
- Prepositioned relief goods inventory checked

III. HAZARD ASSESSMENT
----------------------
Flood-prone areas: Purok 3, Purok 4
Landslide-prone areas: Purok 7, Purok 8
Storm surge vulnerable: Purok 1, Purok 2

IV. EMERGENCY RESPONSE CAPACITY
-------------------------------
BDRRMC Members: 15
Trained First Responders: 8
Rescue Equipment: Available
Emergency Vehicles: 2 (Service Vehicle, Ambulance)

Prepared by: BDRRM Office
Certified Correct: Hon. Roberto Cruz, Punong Barangay
`;
          break;

        case 'monthly':
          reportContent = `${header}
MONTHLY SUMMARY REPORT
======================

I. DOCUMENT SERVICES
--------------------
Total Requests: ${stats.totalDocRequests}
Processed/Released: ${stats.processedDocs}
Pending: ${mockDocumentRequests.filter(d => d.status === 'pending').length}

II. PEACE AND ORDER
-------------------
Blotter Cases Filed: ${stats.totalBlotters}
Resolved: ${stats.resolvedBlotters}
Under Investigation: ${mockBlotterCases.filter(b => b.status === 'investigating').length}

III. BUSINESS PERMITS
---------------------
Total Registered: ${stats.totalBusinesses}
Active: ${stats.activeBusinesses}
Pending: ${mockBusinesses.filter(b => b.status === 'pending').length}

IV. PROJECTS UPDATE
-------------------
${mockProjects.filter(p => p.status === 'ongoing').map(p => `
${p.title}
- Status: ${p.status}
- Budget: PHP ${p.budget.toLocaleString()}
- Utilized: PHP ${p.actualCost.toLocaleString()}
- Lead: ${p.leadBy}
`).join('\n')}

V. BARANGAY ASSETS
------------------
Total Assets: ${mockAssets.length}
Total Value: PHP ${mockAssets.reduce((sum, a) => sum + a.acquisitionCost, 0).toLocaleString()}

Prepared by: Carlos Mendoza, Barangay Secretary
Certified Correct: Hon. Roberto Cruz, Punong Barangay
`;
          break;

        case 'demographics':
          reportContent = `${header}
DEMOGRAPHIC STATISTICS REPORT
=============================

I. POPULATION BY GENDER
-----------------------
Male: ${stats.maleResidents} (${((stats.maleResidents / stats.totalResidents) * 100).toFixed(1)}%)
Female: ${stats.femaleResidents} (${((stats.femaleResidents / stats.totalResidents) * 100).toFixed(1)}%)
Total: ${stats.totalResidents}

II. AGE DISTRIBUTION
--------------------
Children (0-17): ${mockResidents.filter(r => {
  const year = parseInt(r.birthDate.split(', ')[1]);
  const age = 2026 - year;
  return age < 18;
}).length}
Working Age (18-59): ${mockResidents.filter(r => {
  const year = parseInt(r.birthDate.split(', ')[1]);
  const age = 2026 - year;
  return age >= 18 && age < 60;
}).length}
Senior Citizens (60+): ${stats.seniors}

III. CIVIL STATUS
-----------------
Single: ${mockResidents.filter(r => r.civilStatus === 'Single').length}
Married: ${mockResidents.filter(r => r.civilStatus === 'Married').length}
Widowed: ${mockResidents.filter(r => r.civilStatus === 'Widowed').length}
Separated: ${mockResidents.filter(r => r.civilStatus === 'Separated').length}

IV. SPECIAL GROUPS
------------------
Senior Citizens: ${stats.seniors}
PWD: ${stats.pwd}
4Ps Beneficiaries: ${stats.fourPs}
Registered Voters: ${stats.voters}

V. GEOGRAPHIC DISTRIBUTION
--------------------------
${Array.from(new Set(mockResidents.map(r => r.address))).map(addr => {
  const count = mockResidents.filter(r => r.address === addr).length;
  return `${addr}: ${count}`;
}).join('\n')}

Prepared by: Carlos Mendoza, Barangay Secretary
`;
          break;

        case 'profile':
          reportContent = `${header}
BARANGAY PROFILE REPORT
=======================

I. GENERAL INFORMATION
----------------------
Barangay Name: Santiago
Municipality: San Felipe
Province: Zambales
Region: Region III (Central Luzon)
Land Area: 500 hectares (approx.)
Number of Puroks: 8

II. POPULATION DATA
-------------------
Total Population: ${stats.totalResidents}
Number of Households: ${mockResidents.filter(r => r.householdHead === 'Yes').length}
Population Density: ${(stats.totalResidents / 500).toFixed(2)} per hectare

III. GOVERNANCE
---------------
Punong Barangay: Hon. Roberto Cruz
Barangay Secretary: Carlos Mendoza
Barangay Treasurer: Elena Flores
SK Chairperson: Carmen Lopez

IV. FACILITIES
--------------
- Barangay Hall
- Health Center
- Day Care Center
- Covered Court
- Multi-Purpose Hall
- Water System

V. ECONOMIC ACTIVITIES
----------------------
Primary: Agriculture, Fishing
Secondary: Small businesses, Services
Total Businesses: ${stats.totalBusinesses}

VI. SOCIAL SERVICES
-------------------
Active Programs: ${mockProjects.filter(p => p.status === 'ongoing').length}
GAD Programs: ${mockGADBudget.programs.length}
Total Budget: PHP ${(mockGADBudget.totalBudget + mockProjects.reduce((sum, p) => sum + p.budget, 0)).toLocaleString()}

Prepared by: Carlos Mendoza, Barangay Secretary
Certified Correct: Hon. Roberto Cruz, Punong Barangay
`;
          break;

        case 'business':
          reportContent = `${header}
BUSINESS ESTABLISHMENTS REPORT
==============================

I. SUMMARY
----------
Total Registered: ${stats.totalBusinesses}
Active: ${stats.activeBusinesses}
Expired: ${mockBusinesses.filter(b => b.status === 'expired').length}
Expiring Soon: ${mockBusinesses.filter(b => b.status === 'expiring').length}
Pending: ${mockBusinesses.filter(b => b.status === 'pending').length}

II. BY BUSINESS TYPE
--------------------
${Array.from(new Set(mockBusinesses.map(b => b.type))).map(type => {
  const businesses = mockBusinesses.filter(b => b.type === type);
  return `${type}: ${businesses.length}`;
}).join('\n')}

III. DETAILED LIST
------------------
${mockBusinesses.map(b => `
${b.businessName}
- Owner: ${b.ownerName}
- Type: ${b.type}
- Address: ${b.address}
- Permit No: ${b.permitNumber}
- Status: ${b.status}
- Capital: PHP ${b.capitalInvestment.toLocaleString()}
- Gross Sales: PHP ${b.grossSales.toLocaleString()}
- Employees: ${b.employees}
`).join('\n')}

Prepared by: Carlos Mendoza, Barangay Secretary
`;
          break;

        case 'blotter':
          reportContent = `${header}
BLOTTER SUMMARY REPORT
======================

I. CASE SUMMARY
---------------
Total Cases: ${stats.totalBlotters}
Resolved: ${stats.resolvedBlotters}
Under Investigation: ${mockBlotterCases.filter(b => b.status === 'investigating').length}
Mediation: ${mockBlotterCases.filter(b => b.status === 'mediation').length}
Escalated: ${mockBlotterCases.filter(b => b.status === 'escalated').length}
New Reports: ${mockBlotterCases.filter(b => b.status === 'reported').length}

II. BY INCIDENT TYPE
--------------------
${Array.from(new Set(mockBlotterCases.map(b => b.incidentType))).map(type => {
  const cases = mockBlotterCases.filter(b => b.incidentType === type);
  return `${type}: ${cases.length}`;
}).join('\n')}

III. BY LOCATION
----------------
${Array.from(new Set(mockBlotterCases.map(b => b.location))).map(loc => {
  const cases = mockBlotterCases.filter(b => b.location === loc);
  return `${loc}: ${cases.length}`;
}).join('\n')}

IV. RESOLUTION RATE
-------------------
Resolution Rate: ${((stats.resolvedBlotters / stats.totalBlotters) * 100).toFixed(1)}%

Prepared by: Ana Garcia, Kagawad - Peace & Order
`;
          break;
      }

      // Download the report
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportId}-report-${selectedMonth}-${selectedYear}.txt`;
      link.click();
      
      setGeneratingReport(null);
    }, 1000);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Report Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate NGA-required reports and export data</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map(month => (
                <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Population</p>
                <p className="text-2xl font-bold">{stats.totalResidents}</p>
              </div>
              <Users className="w-8 h-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Businesses</p>
                <p className="text-2xl font-bold">{stats.totalBusinesses}</p>
              </div>
              <Building2 className="w-8 h-8 text-green-500/60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Documents Processed</p>
                <p className="text-2xl font-bold">{stats.processedDocs}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500/60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cases Resolved</p>
                <p className="text-2xl font-bold">{stats.resolvedBlotters}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Available Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {reportTypes.map(report => (
              <div 
                key={report.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <report.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{report.name}</h3>
                    <Badge variant="outline" className="text-xs">{report.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                  <p className="text-xs text-muted-foreground mb-3">Required by: {report.requiredBy}</p>
                  <Button 
                    size="sm" 
                    onClick={() => generateReport(report.id)}
                    disabled={generatingReport === report.id}
                    className="w-full sm:w-auto"
                  >
                    {generatingReport === report.id ? (
                      <>Generating...</>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Report Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium">Report</th>
                  <th className="text-left py-2 px-3 font-medium">Frequency</th>
                  <th className="text-left py-2 px-3 font-medium">Submit To</th>
                  <th className="text-left py-2 px-3 font-medium">Deadline</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/50">
                  <td className="py-2 px-3">CBMS Report</td>
                  <td className="py-2 px-3">Quarterly</td>
                  <td className="py-2 px-3">DILG</td>
                  <td className="py-2 px-3">15th of following month</td>
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="py-2 px-3">GAD Report</td>
                  <td className="py-2 px-3">Quarterly</td>
                  <td className="py-2 px-3">DILG</td>
                  <td className="py-2 px-3">15th of following month</td>
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="py-2 px-3">DRRM Report</td>
                  <td className="py-2 px-3">Monthly</td>
                  <td className="py-2 px-3">DILG/NDRRMC</td>
                  <td className="py-2 px-3">5th of following month</td>
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="py-2 px-3">Monthly Summary</td>
                  <td className="py-2 px-3">Monthly</td>
                  <td className="py-2 px-3">Municipal</td>
                  <td className="py-2 px-3">5th of following month</td>
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="py-2 px-3">Barangay Profile</td>
                  <td className="py-2 px-3">Annual</td>
                  <td className="py-2 px-3">DILG</td>
                  <td className="py-2 px-3">January 31</td>
                </tr>
                <tr className="hover:bg-muted/50">
                  <td className="py-2 px-3">Blotter Summary</td>
                  <td className="py-2 px-3">Monthly</td>
                  <td className="py-2 px-3">PNP</td>
                  <td className="py-2 px-3">5th of following month</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
