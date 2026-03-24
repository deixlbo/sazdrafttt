'use client';

import { useState } from 'react';
import { 
  Heart, 
  Users, 
  Wallet, 
  FileText, 
  AlertTriangle,
  Shield,
  TrendingUp,
  Calendar,
  Download,
  Plus,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { mockGADBudget, mockVAWRecords, mockGADAccomplishments } from '@/lib/mock-data';

const statusColors: Record<string, string> = {
  'active': 'bg-blue-100 text-blue-700',
  'resolved': 'bg-green-100 text-green-700',
  'referred': 'bg-purple-100 text-purple-700',
  'closed': 'bg-gray-100 text-gray-700',
  'ongoing': 'bg-green-100 text-green-700',
  'planning': 'bg-yellow-100 text-yellow-700',
  'completed': 'bg-blue-100 text-blue-700',
};

export default function GADPage() {
  const [activeTab, setActiveTab] = useState('budget');
  const [selectedRecord, setSelectedRecord] = useState<typeof mockVAWRecords[0] | null>(null);

  const utilizationRate = (mockGADBudget.utilized / mockGADBudget.allocated) * 100;

  const exportGADReport = () => {
    const report = `GAD ACCOMPLISHMENT REPORT - BARANGAY SANTIAGO
=============================================
Year: ${mockGADBudget.year}
Generated: ${new Date().toLocaleDateString()}

BUDGET SUMMARY
--------------
Total Budget: PHP ${mockGADBudget.totalBudget.toLocaleString()}
Allocated: PHP ${mockGADBudget.allocated.toLocaleString()}
Utilized: PHP ${mockGADBudget.utilized.toLocaleString()}
Utilization Rate: ${utilizationRate.toFixed(1)}%

GAD PROGRAMS
------------
${mockGADBudget.programs.map(p => 
  `${p.name}
   Budget: PHP ${p.budget.toLocaleString()}
   Utilized: PHP ${p.utilized.toLocaleString()}
   Beneficiaries: ${p.beneficiaries}
   Status: ${p.status}`
).join('\n\n')}

VAW DESK RECORDS
----------------
Total Cases: ${mockVAWRecords.length}
Active: ${mockVAWRecords.filter(r => r.status === 'active').length}
Resolved: ${mockVAWRecords.filter(r => r.status === 'resolved').length}
Referred: ${mockVAWRecords.filter(r => r.status === 'referred').length}

ACCOMPLISHMENTS
---------------
${mockGADAccomplishments.map(a =>
  `${a.activity} (${a.year} ${a.quarter})
   Participants: ${a.participants}
   Budget: PHP ${a.budget.toLocaleString()}
   Outcome: ${a.outcome}`
).join('\n\n')}
`;
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gad-report-${mockGADBudget.year}.txt`;
    link.click();
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gender and Development (GAD)</h1>
          <p className="text-sm text-muted-foreground mt-1">GAD plan, budget allocation, and VAW desk records</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportGADReport}>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-pink-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">GAD Budget {mockGADBudget.year}</p>
                <p className="text-2xl font-bold">P{(mockGADBudget.totalBudget / 1000).toFixed(0)}K</p>
              </div>
              <Wallet className="w-8 h-8 text-pink-500/60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Utilization</p>
                <p className="text-2xl font-bold">{utilizationRate.toFixed(0)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500/60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Programs</p>
                <p className="text-2xl font-bold">{mockGADBudget.programs.length}</p>
              </div>
              <Heart className="w-8 h-8 text-purple-500/60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">VAW Cases</p>
                <p className="text-2xl font-bold">{mockVAWRecords.length}</p>
              </div>
              <Shield className="w-8 h-8 text-orange-500/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="budget" className="text-xs md:text-sm py-2">Budget</TabsTrigger>
          <TabsTrigger value="programs" className="text-xs md:text-sm py-2">Programs</TabsTrigger>
          <TabsTrigger value="vaw" className="text-xs md:text-sm py-2">VAW Desk</TabsTrigger>
          <TabsTrigger value="accomplishments" className="text-xs md:text-sm py-2">Accomplishments</TabsTrigger>
        </TabsList>

        {/* Budget Tab */}
        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Budget Overview - {mockGADBudget.year}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total GAD Budget</p>
                  <p className="text-3xl font-bold text-primary">P{mockGADBudget.totalBudget.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Allocated</p>
                  <p className="text-3xl font-bold text-green-600">P{mockGADBudget.allocated.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Utilized</p>
                  <p className="text-3xl font-bold text-blue-600">P{mockGADBudget.utilized.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Budget Utilization</span>
                  <span className="font-medium">{utilizationRate.toFixed(1)}%</span>
                </div>
                <Progress value={utilizationRate} className="h-3" />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Budget Allocation by Program</h4>
                  <div className="space-y-3">
                    {mockGADBudget.programs.map(program => (
                      <div key={program.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="truncate pr-2">{program.name}</span>
                          <span className="font-medium">P{program.budget.toLocaleString()}</span>
                        </div>
                        <Progress value={(program.budget / mockGADBudget.totalBudget) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Utilization by Program</h4>
                  <div className="space-y-3">
                    {mockGADBudget.programs.map(program => (
                      <div key={program.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="truncate pr-2">{program.name}</span>
                          <span className="font-medium">{((program.utilized / program.budget) * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={(program.utilized / program.budget) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Programs Tab */}
        <TabsContent value="programs" className="space-y-4">
          <div className="grid gap-4">
            {mockGADBudget.programs.map(program => (
              <Card key={program.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold">{program.name}</h3>
                        <Badge className={statusColors[program.status]}>{program.status}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {program.beneficiaries} beneficiaries
                        </span>
                        <span className="flex items-center gap-1">
                          <Wallet className="w-3 h-3" />
                          Budget: P{program.budget.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Utilized: P{program.utilized.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Utilization</p>
                      <p className="text-xl font-bold text-primary">{((program.utilized / program.budget) * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress value={(program.utilized / program.budget) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* VAW Desk Tab */}
        <TabsContent value="vaw" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Violence Against Women (VAW) Desk Records</CardTitle>
                <Badge variant="outline" className="text-xs">Confidential</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{mockVAWRecords.filter(r => r.status === 'active').length}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{mockVAWRecords.filter(r => r.status === 'resolved').length}</p>
                  <p className="text-xs text-muted-foreground">Resolved</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{mockVAWRecords.filter(r => r.status === 'referred').length}</p>
                  <p className="text-xs text-muted-foreground">Referred</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-600">{mockVAWRecords.filter(r => r.status === 'closed').length}</p>
                  <p className="text-xs text-muted-foreground">Closed</p>
                </div>
              </div>

              <div className="space-y-3">
                {mockVAWRecords.map(record => (
                  <div 
                    key={record.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedRecord(record)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{record.caseNumber}</p>
                          <Badge className={statusColors[record.status]}>{record.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{record.incidentType} - {record.reportDate}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Confidentiality Notice</p>
                    <p className="text-xs text-yellow-700">All VAW records are confidential and protected by RA 9262. Unauthorized disclosure is punishable by law.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accomplishments Tab */}
        <TabsContent value="accomplishments" className="space-y-4">
          <div className="grid gap-4">
            {mockGADAccomplishments.map(accomplishment => (
              <Card key={accomplishment.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold">{accomplishment.activity}</h3>
                        <Badge variant="outline">{accomplishment.year} {accomplishment.quarter}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{accomplishment.outcome}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {accomplishment.participants} participants
                        </span>
                        <span className="flex items-center gap-1">
                          <Wallet className="w-3 h-3" />
                          P{accomplishment.budget.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* VAW Record Detail Dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>VAW Case Details</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold">{selectedRecord.caseNumber}</p>
                  <Badge className={statusColors[selectedRecord.status]}>{selectedRecord.status}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Incident Type</p>
                  <p className="font-medium">{selectedRecord.incidentType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Report Date</p>
                  <p className="font-medium">{selectedRecord.reportDate}</p>
                </div>
                {selectedRecord.referredTo && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Referred To</p>
                    <p className="font-medium">{selectedRecord.referredTo}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Actions Taken</p>
                <div className="space-y-2">
                  {selectedRecord.actionsTaken.map((action, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-700">This record is confidential and protected under RA 9262.</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
