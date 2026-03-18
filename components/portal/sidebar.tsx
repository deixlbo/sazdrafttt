'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Megaphone, 
  Calendar, 
  AlertTriangle, 
  User, 
  LogOut,
  Menu,
  X,
  Building2,
  ClipboardList,
  Users,
  Shield
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

type SidebarLink = {
  href: string;
  label: string;
  icon: React.ElementType;
};

type SidebarProps = {
  type: 'resident' | 'official';
  children: React.ReactNode;
};

const residentLinks: SidebarLink[] = [
  { href: '/resident/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/resident/documents', label: 'Documents', icon: FileText },
  { href: '/resident/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/resident/programs', label: 'Programs', icon: Calendar },
  { href: '/resident/blotter', label: 'Blotter', icon: AlertTriangle },
  { href: '/resident/profile', label: 'My Profile', icon: User },
];

const officialLinks: SidebarLink[] = [
  { href: '/official/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/official/documents', label: 'Documents', icon: FileText },
  { href: '/official/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/official/programs', label: 'Programs', icon: Calendar },
  { href: '/official/blotter', label: 'Blotter', icon: AlertTriangle },
  { href: '/official/residents', label: 'Residents', icon: Users },
  { href: '/official/business', label: 'Business', icon: Building2 },
  { href: '/official/audit-logs', label: 'Audit Logs', icon: ClipboardList },
  { href: '/official/profile', label: 'My Profile', icon: User },
];

export function PortalSidebar({ type, children }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { userData, logout } = useAuth();
  const links = type === 'resident' ? residentLinks : officialLinks;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (err) {
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-sidebar text-sidebar-foreground fixed left-0 top-0 h-full">
        {/* Logo Section */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <Image
              src="/santiago.jpg"
              alt="Barangay Santiago Logo"
              width={48}
              height={48}
              className="rounded-full border-2 border-primary"
            />
            <div>
              <h2 className="font-bold text-sm leading-tight">Barangay Santiago</h2>
              <p className="text-xs text-sidebar-foreground/70">Saz Portal</p>
            </div>
          </div>
        </div>

        {/* User Type Badge */}
        <div className="px-6 py-3 border-b border-sidebar-border">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
            type === 'official' ? 'bg-sidebar-primary/20 text-sidebar-primary' : 'bg-sidebar-accent text-sidebar-accent-foreground'
          }`}>
            {type === 'official' ? <Shield className="w-4 h-4" /> : <Users className="w-4 h-4" />}
            <span className="text-sm font-medium capitalize">{type} Portal</span>
          </div>
          {userData && (
            <p className="text-xs text-sidebar-foreground/60 mt-2 px-1 truncate">
              {userData.fullName || userData.email}
            </p>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }`}
                  >
                    <link.icon className="w-5 h-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/80 hover:bg-destructive/20 hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar text-sidebar-foreground h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Image
            src="/santiago.jpg"
            alt="Barangay Santiago Logo"
            width={36}
            height={36}
            className="rounded-full border-2 border-primary"
          />
          <span className="font-bold text-sm">Brgy Santiago Saz</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-sidebar-accent"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed top-16 left-0 bottom-0 w-64 bg-sidebar text-sidebar-foreground z-50 transform transition-transform duration-300 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* User Type Badge */}
        <div className="px-4 py-3 border-b border-sidebar-border">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
            type === 'official' ? 'bg-sidebar-primary/20 text-sidebar-primary' : 'bg-sidebar-accent text-sidebar-accent-foreground'
          }`}>
            {type === 'official' ? <Shield className="w-4 h-4" /> : <Users className="w-4 h-4" />}
            <span className="text-sm font-medium capitalize">{type} Portal</span>
          </div>
          {userData && (
            <p className="text-xs text-sidebar-foreground/60 mt-2 px-1 truncate">
              {userData.fullName || userData.email}
            </p>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }`}
                  >
                    <link.icon className="w-5 h-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/80 hover:bg-destructive/20 hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
