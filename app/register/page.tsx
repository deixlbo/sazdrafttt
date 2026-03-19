'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Eye, EyeOff, AlertCircle, Check, X, XCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'Contains uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Contains lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'Contains a number', test: (p) => /[0-9]/.test(p) },
  { label: 'Contains special character (!@#$%^&*)', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export default function RegisterPage() {
  const { register, loading, error, clearError } = useAuth();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const passwordChecks = useMemo(() => {
    return passwordRequirements.map(req => ({
      ...req,
      passed: req.test(formData.password),
    }));
  }, [formData.password]);

  const allPasswordRequirementsMet = passwordChecks.every(check => check.passed);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!allPasswordRequirementsMet) {
      toast.error('Please meet all password requirements');
      return;
    }

    if (!passwordsMatch) {
      toast.error('Passwords do not match');
      return;
    }

    if (!acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
      });
      toast.success('Registration successful! Welcome to Barangay Santiago.');
    } catch (err) {
      // Error is handled by auth context
    }
  };

  // Privacy Modal Component
  const PrivacyModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-background rounded-lg max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Data Privacy Terms</h2>
          <button
            onClick={() => setShowPrivacyModal(false)}
            className="p-1 hover:bg-muted rounded-full transition"
          >
            <XCircle className="w-6 h-6 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Republic Act */}
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
            <h3 className="font-semibold text-primary mb-1">Republic Act No. 10173</h3>
            <p className="text-sm text-muted-foreground">Data Privacy Act of 2012</p>
          </div>

          {/* What is the Data Privacy Act? */}
          <div>
            <h3 className="font-semibold text-foreground mb-2">What is the Data Privacy Act?</h3>
            <p className="text-sm text-muted-foreground">
              The Data Privacy Act (Republic Act No. 10173) is a Philippine law that protects personal information 
              in information and communications systems. It ensures that all personal data collected are processed 
              with consent and for legitimate purposes only.
            </p>
          </div>

          {/* Information We Collect */}
          <div>
            <h3 className="font-semibold text-foreground mb-2">Information We Collect</h3>
            <p className="text-sm text-muted-foreground mb-2">
              As a resident of Barangay Santiago, we collect the following personal information:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">•</span>
                <span><span className="font-medium">Full Name</span> - For official identification and records</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">•</span>
                <span><span className="font-medium">Email Address</span> - For account verification and communication</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">•</span>
                <span><span className="font-medium">Phone Number</span> - For emergency contact and notifications</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">•</span>
                <span><span className="font-medium">Address</span> - To verify residency and for barangay documentation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">•</span>
                <span><span className="font-medium">Government IDs</span> - For verification purposes (when submitting requests)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">•</span>
                <span><span className="font-medium">Transaction History</span> - Records of your requests and transactions</span>
              </li>
            </ul>
          </div>

          {/* Purpose of Data Collection */}
          <div>
            <h3 className="font-semibold text-foreground mb-2">Purpose of Data Collection</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">•</span>
                <span>To verify your residency in Barangay Santiago</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">•</span>
                <span>To process your requests and transactions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">•</span>
                <span>To send important announcements and updates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">•</span>
                <span>To maintain accurate resident records</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">•</span>
                <span>For emergency response and contact purposes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">•</span>
                <span>To improve our services to residents</span>
              </li>
            </ul>
          </div>

          {/* Data Protection Measures */}
          <div>
            <h3 className="font-semibold text-foreground mb-2">Data Protection Measures</h3>
            <p className="text-sm text-muted-foreground mb-2">
              We implement strict security measures to protect your data:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">•</span>
                <span>Encrypted data storage and transmission</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">•</span>
                <span>Secure authentication and access controls</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">•</span>
                <span>Regular security audits and updates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">•</span>
                <span>Limited access to authorized personnel only</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">•</span>
                <span>Strict confidentiality agreements with staff</span>
              </li>
            </ul>
          </div>

          {/* Your Rights */}
          <div>
            <h3 className="font-semibold text-foreground mb-2">Your Rights Under the Data Privacy Act</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">•</span>
                <span><span className="font-medium">Right to be Informed</span> - Know how your data is used</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">•</span>
                <span><span className="font-medium">Right to Access</span> - Request copies of your data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">•</span>
                <span><span className="font-medium">Right to Correction</span> - Update inaccurate information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">•</span>
                <span><span className="font-medium">Right to Erasure</span> - Request data deletion (subject to legal requirements)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">•</span>
                <span><span className="font-medium">Right to Object</span> - Withdraw consent for data processing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">•</span>
                <span><span className="font-medium">Right to Data Portability</span> - Receive your data in electronic format</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="sticky bottom-0 bg-background border-t border-border p-4 flex justify-end">
          <Button onClick={() => setShowPrivacyModal(false)} variant="default">
            I Understand
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {showPrivacyModal && <PrivacyModal />}
      
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-primary/10 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-lg animate-fadeUp">
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
              <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
              <p className="text-muted-foreground text-sm mt-1">Register as a resident of Barangay Santiago</p>
            </div>

            {/* User Type Badge */}
            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 rounded-lg mb-6">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Resident Registration</span>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm animate-fadeUp">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Juan Dela Cruz"
                  className="mt-1 border-border focus:border-primary"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-foreground">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="juan@email.com"
                  className="mt-1 border-border focus:border-primary"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0912-345-6789"
                  className="mt-1 border-border focus:border-primary"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="address" className="text-foreground">Address</Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Purok 1, Zone 1, Barangay Santiago"
                  className="mt-1 border-border focus:border-primary"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className="border-border focus:border-primary pr-10"
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

                {/* Password Requirements Checklist */}
                {formData.password && (
                  <div className="mt-3 p-3 bg-muted rounded-lg space-y-2 animate-fadeUp">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Password Requirements:</p>
                    {passwordChecks.map((check, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        {check.passed ? (
                          <Check className="w-3.5 h-3.5 text-primary" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                        <span className={check.passed ? 'text-primary' : 'text-muted-foreground'}>
                          {check.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className={`border-border focus:border-primary pr-10 ${
                      formData.confirmPassword && !passwordsMatch ? 'border-destructive' : ''
                    }`}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-destructive mt-1">Passwords do not match</p>
                )}
                {formData.confirmPassword && passwordsMatch && (
                  <p className="text-xs text-primary mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Passwords match
                  </p>
                )}
              </div>

              {/* Terms and Privacy - Modal Trigger */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 rounded border-border accent-primary"
                    disabled={loading}
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="text-primary hover:underline font-medium inline"
                    >
                      Terms
                    </button>
                    {' '}&{' '}
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="text-primary hover:underline font-medium inline"
                    >
                      Privacy Policy
                    </button>
                  </label>
                </div>
                
                {/* Short Data Privacy Notice */}
                <p className="text-xs text-muted-foreground/70 pl-6">
                  By registering, you consent to the collection of your personal information for official barangay purposes only, in compliance with RA 10173 (Data Privacy Act). Click "Terms" or "Privacy Policy" to read the full details.
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading || !allPasswordRequirementsMet || !passwordsMatch || !acceptTerms}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            {/* Login Link */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login/resident" className="text-primary font-medium hover:underline">
                Sign in here
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}