'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PortalHeader } from '@/components/portal/header';

import { auth, db } from '@/lib/firebase'; // adjust path
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
  });

  const [loading, setLoading] = useState(true);

  // ✅ FETCH USER DATA
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = auth.currentUser;

        if (!user) return;

        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          setFormData({
            fullName: data.fullName || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
          });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // ✅ HANDLE INPUT CHANGE
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ✅ SAVE TO FIRESTORE
  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, 'users', user.uid);

      await updateDoc(docRef, {
        ...formData,
        updatedAt: new Date(),
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <>
      <PortalHeader title="My Profile" description="View and manage your account information" />

      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">

        {/* PROFILE HEADER */}
        <Card className="p-8 mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-5xl font-bold">
              {formData.fullName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{formData.fullName}</h2>
              <p className="text-muted-foreground">Registered Resident</p>
            </div>
          </div>
        </Card>

        {/* PROFILE INFO */}
        <Card className="p-8 border-primary/20">
          <div className="flex justify-between mb-8">
            <h2 className="text-2xl font-bold">Personal Information</h2>

            <Button onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>

          <div className="space-y-6">
            {/* FULL NAME */}
            <div>
              <label>Full Name</label>
              {isEditing ? (
                <Input name="fullName" value={formData.fullName} onChange={handleChange} />
              ) : (
                <p>{formData.fullName}</p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <label>Email</label>
              <p>{formData.email}</p> {/* usually not editable */}
            </div>

            {/* PHONE */}
            <div>
              <label>Phone</label>
              {isEditing ? (
                <Input name="phone" value={formData.phone} onChange={handleChange} />
              ) : (
                <p>{formData.phone}</p>
              )}
            </div>

            {/* ADDRESS */}
            <div>
              <label>Address</label>
              {isEditing ? (
                <Input name="address" value={formData.address} onChange={handleChange} />
              ) : (
                <p>{formData.address}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="mt-6">
              <Button onClick={handleSave} className="w-full">
                Save Changes
              </Button>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}