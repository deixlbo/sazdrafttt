'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Megaphone, 
  ClipboardList, 
  Users,
  Phone,
  MapPin,
  Clock,
  Shield,
  Building2,
  Heart,
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, userData } = useAuth();

  // Get redirect URL based on user role
  const getDashboardUrl = () => {
    if (userData?.role === 'official') return '/official/dashboard';
    if (userData?.role === 'resident') return '/resident/dashboard';
    return '/login';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-sidebar/95 backdrop-blur-sm border-b border-sidebar-border">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image
                src="/santiago.jpg"
                alt="Barangay Santiago Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="text-sidebar-foreground font-bold text-lg hidden sm:block">
                Barangay Santiago Saz
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#home" className="text-sidebar-foreground/80 hover:text-sidebar-foreground transition">Home</a>
              <a href="#about" className="text-sidebar-foreground/80 hover:text-sidebar-foreground transition">About</a>
              <a href="#services" className="text-sidebar-foreground/80 hover:text-sidebar-foreground transition">Services</a>
              <a href="#contact" className="text-sidebar-foreground/80 hover:text-sidebar-foreground transition">Contact</a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-sidebar-foreground p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-sidebar border-t border-sidebar-border animate-fadeUp">
            <div className="px-4 py-4 flex flex-col gap-4">
              <a href="#home" className="text-sidebar-foreground/80 hover:text-sidebar-foreground transition py-2">Home</a>
              <a href="#about" className="text-sidebar-foreground/80 hover:text-sidebar-foreground transition py-2">About</a>
              <a href="#services" className="text-sidebar-foreground/80 hover:text-sidebar-foreground transition py-2">Services</a>
              <a href="#contact" className="text-sidebar-foreground/80 hover:text-sidebar-foreground transition py-2">Contact</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-16 min-h-[600px] flex items-center justify-center bg-gradient-to-br from-sidebar via-sidebar/90 to-primary/30">
        <div className="absolute inset-0 bg-[url('/santiago.jpg')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="animate-fadeUp">
            <Image
              src="/santiago.jpg"
              alt="Barangay Santiago Logo"
              width={250}
              height={250}
              className="rounded-full mx-auto mb-6 border-4 border-primary shadow-lg"
            />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-sidebar-foreground mb-4 text-balance">
              Barangay Santiago Saz Portal
            </h1>
            <p className="text-lg sm:text-xl text-sidebar-foreground/80 mb-8 max-w-2xl mx-auto text-pretty">
              AI-Assisted Barangay Santiago Portal: Smart Document Processing and Resident Service Automation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login/resident">
                <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-8">
                  <Users className="w-5 h-5 mr-2" />
                  Resident Login
                </Button>
              </Link>
              <Link href="/login/official">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-sidebar-foreground/30 text-foreground hover:bg-sidebar-foreground/10 px-8">
                  <Shield className="w-5 h-5 mr-2" />
                  Official Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* For Residents Section */}
      <section id="about" className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12 animate-fadeUp">
            <h2 className="text-3xl font-bold text-foreground mb-4">For Residents</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Residents of Barangay Santiago can easily request official documents, view barangay programs, 
              file blotter reports, and participate in community initiatives through this smart and accessible portal.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FileText, title: 'Request Documents', desc: 'Clearance, Certificate, and more' },
              { icon: Megaphone, title: 'View Announcements', desc: 'Stay updated with barangay news' },
              { icon: ClipboardList, title: 'File Blotter Reports', desc: 'Report incidents online' },
              { icon: Users, title: 'Join Programs', desc: 'Participate in community activities' },
            ].map((item, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition animate-fadeUp border-primary/20" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* For Officials Section */}
      <section id="services" className="py-16 bg-muted">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12 animate-fadeUp">
            <h2 className="text-3xl font-bold text-foreground mb-4">For Barangay Officials</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Barangay officials can efficiently manage resident services through the portal by handling document requests, 
              posting announcements, creating community programs, and maintaining records with AI-assisted tools.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FileText, title: 'Manage Document Requests', desc: 'Approve, reject, and process barangay clearances, certificates, and permits.' },
              { icon: Megaphone, title: 'Post Announcements', desc: 'Share important updates, alerts, and notices to all residents.' },
              { icon: ClipboardList, title: 'Create & Manage Programs', desc: 'Organize barangay events, outreach programs, and activities.' },
              { icon: AlertTriangle, title: 'Blotter Management', desc: 'Record, review, and update incident reports.' },
              { icon: Users, title: 'Resident Records', desc: 'View and manage resident profiles and data.' },
              { icon: Heart, title: 'AI-Assisted Processing', desc: 'Faster document verification and smart data handling.' },
            ].map((item, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition animate-fadeUp border-primary/20" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-accent-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Information */}
      <section id="contact" className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12 animate-fadeUp">
            <h2 className="text-3xl font-bold text-foreground mb-4">Community Information</h2>
            <p className="text-muted-foreground">Important contacts and emergency information</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Emergency Hotlines */}
            <Card className="p-6 border-destructive/20 animate-fadeUp">
              <div className="flex items-center gap-3 mb-4">
                <Phone className="w-6 h-6 text-destructive" />
                <h3 className="font-semibold text-foreground">Emergency Hotlines</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>Barangay Office: 0912-345-6789</li>
                <li>Police Station: 911</li>
                <li>Fire Department: 160</li>
                <li>Medical Emergency: 143</li>
              </ul>
            </Card>

            {/* Health Center */}
            <Card className="p-6 border-primary/20 animate-fadeUp" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-6 h-6 text-primary" />
                <h3 className="font-semibold text-foreground">Health Center</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>Barangay Santiago Health Center</li>
                <li>Contact: 0923-456-7890</li>
              </ul>
            </Card>

            {/* Evacuation Centers */}
            <Card className="p-6 border-accent animate-fadeUp" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-6 h-6 text-primary" />
                <h3 className="font-semibold text-foreground">Evacuation Centers</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>Barangay Covered Court</li>
                <li>Santiago Elementary School</li>
                <li>Multi-Purpose Hall</li>
              </ul>
            </Card>

            {/* Typhoon Contact */}
            <Card className="p-6 border-secondary/40 animate-fadeUp" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-secondary" />
                <h3 className="font-semibold text-foreground">During Typhoon</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>Barangay Captain</li>
                <li>BDRRMO Office</li>
                <li>Hotline: 0987-654-3210</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Office Hours */}
      <section className="py-12 bg-sidebar text-sidebar-foreground">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="animate-fadeUp">
              <Clock className="w-8 h-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Office Hours</h3>
              <p className="text-sm text-sidebar-foreground/80">Mon-Fri: 8 AM - 5 PM</p>
            </div>
            <div className="animate-fadeUp" style={{ animationDelay: '0.1s' }}>
              <MapPin className="w-8 h-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Location</h3>
              <p className="text-sm text-sidebar-foreground/80">Barangay Santiago Hall</p>
              <p className="text-sm text-sidebar-foreground/80">Near Covered Court</p>
            </div>
            <div className="animate-fadeUp" style={{ animationDelay: '0.2s' }}>
              <Phone className="w-8 h-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Contact Us</h3>
              <p className="text-sm text-sidebar-foreground/80">barangaysantiagosaz@gmail.com</p>
              <p className="text-sm text-sidebar-foreground/80">0912-345-6789</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-sidebar/90 border-t border-sidebar-border">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-sidebar-foreground/60">
            &copy; 2026 Barangay Santiago Saz. All rights reserved.
          </p>
          <p className="text-xs text-sidebar-foreground/40 mt-1">
            Privacy Policy | Terms of Service
          </p>
        </div>
      </footer>
    </div>
  );
}
