'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Shield, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type');

  useEffect(() => {
    // Redirect based on type parameter
    if (type === 'resident') {
      router.push('/login/resident');
    } else if (type === 'official') {
      router.push('/login/official');
    }
  }, [type, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fadeUp">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <Card className="p-8 border-primary/20 shadow-lg">
          {/* Logo */}
          <div className="text-center mb-8">
            <Image
              src="/santiago.jpg"
              alt="Barangay Santiago Logo"
              width={80}
              height={80}
              className="rounded-full mx-auto mb-4 border-4 border-primary/20"
            />
            <h1 className="text-2xl font-bold text-foreground">Barangay Santiago Saz Portal</h1>
            <p className="text-muted-foreground text-sm mt-1">Choose your portal to continue</p>
          </div>

          {/* Portal Selection */}
          <div className="space-y-4">
            <Link href="/login/resident" className="block">
              <Button
                variant="outline"
                size="lg"
                className="w-full h-auto py-6 flex flex-col items-center gap-2 border-2 border-primary/30 hover:border-primary hover:bg-primary/5 transition-all"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Resident Portal</p>
                  <p className="text-xs text-muted-foreground">Access your resident account</p>
                </div>
              </Button>
            </Link>

            <Link href="/login/official" className="block">
              <Button
                variant="outline"
                size="lg"
                className="w-full h-auto py-6 flex flex-col items-center gap-2 border-2 border-secondary/30 hover:border-secondary hover:bg-secondary/5 transition-all"
              >
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Official Portal</p>
                  <p className="text-xs text-muted-foreground">Administrative access</p>
                </div>
              </Button>
            </Link>
          </div>

          {/* Register Link */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            New resident?{' '}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Register here
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
