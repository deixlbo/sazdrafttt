'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PortalSidebar } from '@/components/portal/sidebar';
import { AxlChatbotOfficial } from '@/components/portal/axl-chatbot-official';
import { useAuth } from '@/lib/auth-context';

export default function OfficialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, userData, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login/official');
      } else if (userData && userData.role !== 'official') {
        router.push('/resident/dashboard');
      }
    }
  }, [user, userData, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render content if not authenticated or wrong role
  if (!user || (userData && userData.role !== 'official')) {
    return null;
  }

  return (
    <PortalSidebar type="official">
      <div className="animate-fadeSlideIn">
        {children}
      </div>
      <AxlChatbotOfficial />
    </PortalSidebar>
  );
}
