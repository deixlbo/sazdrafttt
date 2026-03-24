'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PortalHeader } from '@/components/portal/header';
import { Users, FileText, Calendar, AlertCircle, Store, Megaphone, ClipboardList } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getCountFromServer, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

interface DashboardStats {
  totalUsers: number;
  pendingDocs: number;
  activePrograms: number;
  blotterCases: number;
  businesses: number;
  announcements: number;
}

interface DocumentRequest {
  id: string;
  type: string;
  resident: string;
  status: string;
}

export default function OfficialDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    pendingDocs: 0,
    activePrograms: 0,
    blotterCases: 0,
    businesses: 0,
    announcements: 0,
  });
  const [recentRequests, setRecentRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [totalUsers, pendingDocs, activePrograms, blotterCases, businesses, announcements] = await Promise.all([
          getCountFromServer(collection(db, 'users')),
          getCountFromServer(query(collection(db, 'document_requests'), where('status', '==', 'pending'))),
          getCountFromServer(query(collection(db, 'programs'), where('status', '==', 'active'))),
          getCountFromServer(collection(db, 'blotter_reports')),
          getCountFromServer(collection(db, 'businesses')),
          getCountFromServer(collection(db, 'announcements')),
        ]);

        setStats({
          totalUsers: totalUsers.data().count,
          pendingDocs: pendingDocs.data().count,
          activePrograms: activePrograms.data().count,
          blotterCases: blotterCases.data().count,
          businesses: businesses.data().count,
          announcements: announcements.data().count,
        });

        const docsSnap = await getDocs(
          query(collection(db, 'document_requests'), orderBy('createdAt', 'desc'), limit(3))
        );
        const docs = docsSnap.docs.map(doc => ({
          id: doc.id,
          type: doc.data().type,
          resident: doc.data().residentName,
          status: doc.data().status,
        }));
        setRecentRequests(docs);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Pending Documents', value: stats.pendingDocs, icon: FileText, color: 'bg-accent/20 text-accent-foreground' },
    { label: 'Active Programs', value: stats.activePrograms, icon: Calendar, color: 'bg-primary/10 text-primary' },
    { label: 'Blotter Cases', value: stats.blotterCases, icon: AlertCircle, color: 'bg-destructive/10 text-destructive' },
    { label: 'Businesses', value: stats.businesses, icon: Store, color: 'bg-secondary/20 text-secondary-foreground' },
    { label: 'Announcements', value: stats.announcements, icon: Megaphone, color: 'bg-green-100 text-green-600' },
  ];

  return (
    <>
      <PortalHeader title="Welcome, Official!" description="Here's your dashboard overview" />

      <div className="p-4 sm:p-6 lg:p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {statCards.map((stat, index) => {
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
                <p className="text-2xl font-bold text-foreground mt-2">
                  {loading ? '...' : stat.value.toLocaleString()}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <Card className="p-6 border-primary/20 animate-fadeUp">
            <h2 className="text-xl font-bold text-foreground mb-4">Recent Document Requests</h2>
            <div className="space-y-4">
              {loading ? (
                <p className="text-sm text-muted-foreground text-center py-6">Loading...</p>
              ) : recentRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No recent document requests.</p>
              ) : (
                recentRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">{req.id}</span>
                        <p className="font-medium text-foreground">{req.type}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{req.resident}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      req.status === 'pending'
                        ? 'bg-accent/20 text-accent-foreground'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </div>
                ))
              )}
            </div>
            <Link href="/official/documents" className="block mt-4">
              <Button variant="outline" className="w-full">View All Requests</Button>
            </Link>
          </Card>
        </div>
      </div>
    </>
  );
}