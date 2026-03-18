'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function ResidentForgotPasswordPage() {
  const { resetPassword, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      // Error is handled by auth context
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fadeUp">
        {/* Back Link */}
        <Link href="/login/resident" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        <Card className="p-8 border-primary/20 shadow-lg">
          {/* Logo */}
          <div className="text-center mb-6">
            <Image
              src="/santiago.jpg"
              alt="Barangay Santiago Logo"
              width={70}
              height={70}
              className="rounded-full mx-auto mb-3 border-4 border-primary/20"
            />
            <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
            <p className="text-muted-foreground text-sm mt-1">Resident account password recovery</p>
          </div>

          {/* User Type Badge */}
          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 rounded-lg mb-6">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Resident Portal</span>
          </div>

          {sent ? (
            /* Success Message */
            <div className="text-center animate-fadeUp">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Check Your Email</h2>
              <p className="text-muted-foreground text-sm mb-6">
                We&apos;ve sent a password reset link to <strong className="text-foreground">{email}</strong>. 
                Please check your inbox and follow the instructions.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => setSent(false)}
                  variant="outline"
                  className="w-full"
                >
                  Try Another Email
                </Button>
                <Link href="/login/resident" className="block">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 mb-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm animate-fadeUp">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Info */}
              <div className="flex items-start gap-3 p-4 bg-muted rounded-lg mb-6">
                <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-foreground">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="mt-1 border-border focus:border-primary"
                    required
                    disabled={loading}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>

              {/* Login Link */}
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link href="/login/resident" className="text-primary font-medium hover:underline">
                  Sign in here
                </Link>
              </p>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
