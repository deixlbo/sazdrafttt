'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function OfficialLoginPage() {
  const { login, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password, 'official');
      toast.success('Welcome back!');
    } catch (err) {
      // Error is handled by auth context
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/20 via-background to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fadeUp">
        <Card className="p-8 border-secondary/20 shadow-lg">
          {/* Logo */}
          <div className="text-center mb-8">
            <Image
              src="/santiago.jpg"
              alt="Barangay Santiago Logo"
              width={80}
              height={80}
              className="rounded-full mx-auto mb-4 border-4 border-secondary/20"
            />
            <h1 className="text-2xl font-bold text-foreground">Official Portal</h1>
            <p className="text-muted-foreground text-sm mt-1">Sign in to the administrative panel</p>
          </div>

          {/* User Type Badge */}
          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary/10 rounded-lg mb-6">
            <Shield className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">Barangay Official Login</span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm animate-fadeUp">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-foreground">Official Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your official email"
                className="mt-1 border-border focus:border-secondary"
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="border-border focus:border-secondary pr-10"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                <input type="checkbox" className="rounded border-border accent-secondary" />
                Remember me
              </label>
              <Link href="/forgot-password/official" className="text-secondary hover:underline font-medium">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              size="lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign in as Official'
              )}
            </Button>
          </form>

          {/* HR Portal Link */}
          <Link
            href="/hr"
            className="flex items-center justify-center gap-2 mt-4 w-full py-2.5 rounded-lg border border-dashed border-secondary/30 text-sm text-secondary hover:bg-secondary/5 transition-colors"
          >
            🏛️ <span className="font-medium">Go to HR Admin Portal</span>
          </Link>

          {/* Security Notice */}
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              This portal is for authorized barangay officials only. Unauthorized access attempts will be logged.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}