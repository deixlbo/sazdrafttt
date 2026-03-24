'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { PortalHeader } from '@/components/portal/header';
import { FileText, AlertCircle, Calendar, Bell, Clock, MapPin, Phone } from 'lucide-react';

export default function ResidentDashboard() {
  const stats = [
    { label: 'Pending Requests', value: 0, icon: FileText, color: 'bg-blue-100 text-blue-600', href: '/resident/documents' },
    { label: 'Open Cases', value: 0, icon: AlertCircle, color: 'bg-red-100 text-red-600', href: '/resident/blotter' },
    { label: 'Programs', value: 0, icon: Calendar, color: 'bg-primary/10 text-primary', href: '/resident/programs' },
    { label: 'Unread News', value: 0, icon: Bell, color: 'bg-accent/20 text-accent-foreground', href: '/resident/announcements' },
  ];

  return (
    <>
      <PortalHeader title="Welcome, Resident!" description="Here's your dashboard overview" />
      
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Link key={stat.href} href={stat.href}>
              <Card 
                className="p-6 hover:shadow-lg transition cursor-pointer border-primary/20 animate-fadeUp" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* About Barangay Santiago */}
        <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <h2 className="text-2xl font-bold text-foreground mb-4">About Barangay Santiago</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Barangay Santiago is a vibrant community dedicated to providing quality services to all residents. 
            With over 15,000 residents, we strive to create a safe, prosperous, and inclusive barangay for everyone.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Hours of Operation</p>
                <p className="text-sm text-muted-foreground">Mon-Fri: 8 AM - 5 PM</p>
                <p className="text-sm text-muted-foreground">Sat: 8 AM - 12 PM</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Location</p>
                <p className="text-sm text-muted-foreground">Barangay Santiago Hall</p>
                <p className="text-sm text-muted-foreground">Near Covered Court</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Contact</p>
                <p className="text-sm text-muted-foreground">info@santiago.gov</p>
                <p className="text-sm text-muted-foreground">0912-345-6789</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}