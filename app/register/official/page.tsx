'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function OfficialRegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    position: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // TODO: connect to backend (Firebase / API)
    console.log({ ...formData, role: 'official', status: 'pending' });

    toast.success('Registration submitted for approval');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/20 via-background to-primary/10 p-4">
      <div className="w-full max-w-md">
        {/* Back */}
        <Link href="/login/official" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        <Card className="p-6 space-y-4">
          <div className="text-center">
            <Shield className="w-8 h-8 mx-auto text-secondary mb-2" />
            <h1 className="text-xl font-bold">Official Registration</h1>
            <p className="text-sm text-muted-foreground">Apply for barangay official access</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <Label>Full Name</Label>
              <Input name="fullName" value={formData.fullName} onChange={handleChange} required />
            </div>

            <div>
              <Label>Email</Label>
              <Input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div>
              <Label>Phone</Label>
              <Input name="phone" value={formData.phone} onChange={handleChange} required />
            </div>

            <div>
              <Label>Address</Label>
              <Input
                name="address"
                placeholder="Lapaz Street Purok 2 Santiago San Antonio Zambales"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label>Position</Label>
              <Input
                name="position"
                placeholder="e.g. Barangay Captain, Kagawad"
                value={formData.position}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input type="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>

            <div>
              <Label>Confirm Password</Label>
              <Input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
            </div>

            <Button type="submit" className="w-full bg-secondary text-white">
              Register as Official
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground">
            Your account will be reviewed by the administrator before activation.
          </p>
        </Card>
      </div>
    </div>
  );
}
