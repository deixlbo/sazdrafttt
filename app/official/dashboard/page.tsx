'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PortalHeader } from '@/components/portal/header';
import { Users, FileText, Calendar, AlertCircle, Store, Megaphone, ClipboardList } from 'lucide-react';

export default function OfficialDashboard() {
  const stats = [
    { label: 'Total Residents', value: '2,450', icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Pending Documents', value: '24', icon: FileText, color: 'bg-accent/20 text-accent-foreground' },
    { label: 'Active Programs', value: '8', icon: Calendar, color: 'bg-primary/10 text-primary' },
    { label: 'Blotter Cases', value: '12', icon: AlertCircle, color: 'bg-destructive/10 text-destructive' },
    { label: 'Businesses', value: '156', icon: Store, color: 'bg-secondary/20 text-secondary-foreground' },
  ];

  const recentRequests = [
    { id: 'DOC-001', type: 'Barangay Clearance', resident: 'Juan Dela Cruz', status: 'pending' },
    { id: 'DOC-002', type: 'Certificate of Residency', resident: 'Maria Santos', status: 'processing' },
    { id: 'DOC-003', type: 'Certificate of Indigency', resident: 'Pedro Reyes', status: 'pending' },
  ];

  return (
    <>
      <PortalHeader title="Welcome, Official!" description="Here's your dashboard overview" />
      
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="p-6 border-primary/20 hover:shadow-md transition-shadow animate-fadeUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 border-primary/20 animate-fadeUp">
            <h2 className="text-xl font-bold text-foreground mb-4">Recent Document Requests</h2>
            <div className="space-y-4">
              {recentRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">{req.id}</span>
                      <p className="font-medium text-foreground">{req.type}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{req.resident}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    req.status === 'pending' ? 'bg-accent/20 text-accent-foreground' : 'bg-primary/10 text-primary'
                  }`}>
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
            <Link href="/official/documents" className="block mt-4">
              <Button variant="outline" className="w-full">View All Requests</Button>
            </Link>
          </Card>

          <Card className="p-6 border-primary/20 animate-fadeUp">
            <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/official/announcements">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground justify-start gap-2">
                  <Megaphone className="w-4 h-4" />
                  Post Announcement
                </Button>
              </Link>
              <Link href="/official/programs">
                <Button className="w-full bg-primary/10 text-primary hover:bg-primary/20 justify-start gap-2">
                  <Calendar className="w-4 h-4" />
                  Create Program
                </Button>
              </Link>
              <Link href="/official/officials">
                <Button className="w-full bg-primary/10 text-primary hover:bg-primary/20 justify-start gap-2">
                  <Users className="w-4 h-4" />
                  Manage Officials
                </Button>
              </Link>
              <Link href="/official/audit-logs">
                <Button className="w-full bg-primary/10 text-primary hover:bg-primary/20 justify-start gap-2">
                  <ClipboardList className="w-4 h-4" />
                  View Audit Logs
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
