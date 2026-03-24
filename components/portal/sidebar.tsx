'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Megaphone, 
  AlertTriangle, 
  User, 
  LogOut,
  Menu,
  X,
  Building2,
  ClipboardList,
  Users,
  Shield,
  Package,
  ShieldAlert,
  Heart,
  BookOpen,
  FileBarChart,
  FolderKanban,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

type SidebarLink = {
  href: string;
  label: string;
  icon: React.ElementType;
};

type SidebarGroup = {
  label: string;
  links: SidebarLink[];
};

type SidebarProps = {
  type: 'resident' | 'official';
  children: React.ReactNode;
};

const residentLinks: SidebarLink[] = [
  { href: '/resident/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/resident/documents', label: 'Documents', icon: FileText },
  { href: '/resident/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/resident/projects', label: 'Projects', icon: FolderKanban },
  { href: '/resident/blotter', label: 'Blotter', icon: AlertTriangle },
  { href: '/resident/profile', label: 'My Profile', icon: User },
];

const officialGroups: SidebarGroup[] = [
  {
    label: 'Main',
    links: [
      { href: '/official/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/official/residents', label: 'Residents', icon: Users },
      { href: '/official/documents', label: 'Documents', icon: FileText },
      { href: '/official/blotter', label: 'Blotter', icon: AlertTriangle },
      { href: '/official/business', label: 'Business', icon: Building2 },
    ],
  },
  {
    label: 'Programs & Projects',
    links: [
      { href: '/official/projects', label: 'Projects', icon: FolderKanban },
      { href: '/official/announcements', label: 'Announcements', icon: Megaphone },
    ],
  },
  {
    label: 'Governance',
    links: [
      { href: '/official/assets', label: 'Assets', icon: Package },
      { href: '/official/drrm', label: 'DRRM', icon: ShieldAlert },
      { href: '/official/gad', label: 'GAD', icon: Heart },
      { href: '/official/ordinances', label: 'Ordinances', icon: BookOpen },
      { href: '/official/reports', label: 'Reports', icon: FileBarChart },
    ],
  },
  {
    label: 'System',
    links: [
      { href: '/official/audit-logs', label: 'Audit Logs', icon: ClipboardList },
      { href: '/official/profile', label: 'My Profile', icon: User },
    ],
  },
];

export function PortalSidebar({ type, children }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const { userData, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch {
      toast.error('Failed to logout');
    }
  };

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev => 
      prev.includes(label) 
        ? prev.filter(g => g !== label)
        : [...prev, label]
    );
  };

  const renderResidentNav = () => (
    <ul className="space-y-1 px-3">
      {residentLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <link.icon className="w-4 h-4 flex-shrink-0" />
              <span>{link.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const renderOfficialNav = () => (
    <div className="space-y-4 px-3">
      {officialGroups.map((group) => {
        const isCollapsed = collapsedGroups.includes(group.label);
        return (
          <div key={group.label}>
            <button
              onClick={() => toggleGroup(group.label)}
              className="flex items-center justify-between w-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50 hover:text-sidebar-foreground/70 transition-colors"
            >
              <span>{group.label}</span>
              {isCollapsed ? (
                <ChevronRight className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
            {!isCollapsed && (
              <ul className="mt-1 space-y-0.5">
                {group.links.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        }`}
                      >
                        <link.icon className="w-4 h-4 flex-shrink-0" />
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 bg-sidebar text-sidebar-foreground fixed left-0 top-0 h-full shadow-lg">
        {/* Logo Section */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <Image
              src="/santiago.jpg"
              alt="Barangay Santiago Logo"
              width={40}
              height={40}
              className="rounded-full border-2 border-sidebar-primary"
            />
            <div className="min-w-0">
              <h2 className="font-bold text-sm leading-tight truncate">Brgy. Santiago</h2>
              <p className="text-[11px] text-sidebar-foreground/60">Saz Portal</p>
            </div>
          </div>
        </div>

        {/* User Type Badge */}
        <div className="px-4 py-3 border-b border-sidebar-border">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${
            type === 'official' 
              ? 'bg-sidebar-primary/20 text-sidebar-primary' 
              : 'bg-sidebar-accent text-sidebar-accent-foreground'
          }`}>
            {type === 'official' ? <Shield className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
            <span className="capitalize">{type} Portal</span>
          </div>
          {userData && (
            <p className="text-[11px] text-sidebar-foreground/50 mt-2 px-1 truncate">
              {userData.fullName || userData.email}
            </p>
          )}
        </div>

        {/* Navigation Links - No scroll */}
        <nav className="flex-1 py-4">
          {type === 'resident' ? renderResidentNav() : renderOfficialNav()}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar text-sidebar-foreground h-14 flex items-center justify-between px-4 shadow-md">
        <div className="flex items-center gap-2">
          <Image
            src="/santiago.jpg"
            alt="Barangay Santiago Logo"
            width={32}
            height={32}
            className="rounded-full border-2 border-sidebar-primary"
          />
          <span className="font-bold text-sm">Brgy Santiago Saz</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" 
          onClick={() => setMobileOpen(false)} 
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed top-14 left-0 bottom-0 w-64 bg-sidebar text-sidebar-foreground z-50 transform transition-transform duration-300 ease-out overflow-y-auto ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* User Type Badge */}
        <div className="px-4 py-3 border-b border-sidebar-border">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${
            type === 'official' 
              ? 'bg-sidebar-primary/20 text-sidebar-primary' 
              : 'bg-sidebar-accent text-sidebar-accent-foreground'
          }`}>
            {type === 'official' ? <Shield className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
            <span className="capitalize">{type} Portal</span>
          </div>
          {userData && (
            <p className="text-[11px] text-sidebar-foreground/50 mt-2 px-1 truncate">
              {userData.fullName || userData.email}
            </p>
          )}
        </div>

        <nav className="flex-1 py-4">
          {type === 'resident' ? (
            <ul className="space-y-1 px-3">
              {residentLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }`}
                    >
                      <link.icon className="w-4 h-4 flex-shrink-0" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="space-y-4 px-3">
              {officialGroups.map((group) => {
                const isCollapsed = collapsedGroups.includes(group.label);
                return (
                  <div key={group.label}>
                    <button
                      onClick={() => toggleGroup(group.label)}
                      className="flex items-center justify-between w-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50 hover:text-sidebar-foreground/70 transition-colors"
                    >
                      <span>{group.label}</span>
                      {isCollapsed ? (
                        <ChevronRight className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                    {!isCollapsed && (
                      <ul className="mt-1 space-y-0.5">
                        {group.links.map((link) => {
                          const isActive = pathname === link.href;
                          return (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                  isActive
                                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                }`}
                              >
                                <link.icon className="w-4 h-4 flex-shrink-0" />
                                <span>{link.label}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-60 pt-14 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
