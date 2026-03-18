'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, set, onDisconnect, serverTimestamp as rtdbServerTimestamp } from 'firebase/database';
import { auth, db, realtimeDb } from './firebase';
import { useRouter } from 'next/navigation';

export type UserRole = 'resident' | 'official';

export interface UserData {
  uid: string;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  role: UserRole;
  status: 'active' | 'inactive';
  birthDate?: string;
  gender?: string;
  civilStatus?: string;
  position?: string; // For officials
  createdAt?: Date;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserData>) => Promise<void>;
  clearError: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  address: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData({
              uid: firebaseUser.uid,
              email: data.email,
              fullName: data.fullName,
              phone: data.phone,
              address: data.address,
              role: data.role,
              status: data.status,
              birthDate: data.birthDate,
              gender: data.gender,
              civilStatus: data.civilStatus,
              position: data.position,
            });

            // Set online status
            const userStatusRef = ref(realtimeDb, `online_status/${firebaseUser.uid}`);
            set(userStatusRef, {
              online: true,
              lastSeen: rtdbServerTimestamp()
            });

            // Set offline on disconnect
            onDisconnect(userStatusRef).set({
              online: false,
              lastSeen: rtdbServerTimestamp()
            });
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    setLoading(true);
    setError(null);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Verify user role
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (!userDoc.exists()) {
        await signOut(auth);
        throw new Error('User data not found. Please contact support.');
      }
      
      const userRole = userDoc.data().role;
      if (userRole !== role) {
        await signOut(auth);
        throw new Error(`Invalid login. Please use the ${userRole} login page.`);
      }
      
      // Redirect based on role
      router.push(`/${role}/dashboard`);
    } catch (err: any) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: data.email,
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        role: 'resident' as UserRole,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      // Redirect to resident dashboard
      router.push('/resident/dashboard');
    } catch (err: any) {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Set offline status
      if (user) {
        const userStatusRef = ref(realtimeDb, `online_status/${user.uid}`);
        await set(userStatusRef, {
          online: false,
          lastSeen: rtdbServerTimestamp()
        });
      }
      
      await signOut(auth);
      setUserData(null);
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      }
      
      setError(errorMessage);
      throw err;
    }
  };

  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    if (!user || !user.email) throw new Error('No user logged in');
    
    setError(null);
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
    } catch (err: any) {
      let errorMessage = 'Failed to update password.';
      
      if (err.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'New password is too weak.';
      }
      
      setError(errorMessage);
      throw err;
    }
  };

  const updateUserProfile = async (data: Partial<UserData>) => {
    if (!user) throw new Error('No user logged in');
    
    setError(null);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      
      // Update local state
      if (userData) {
        setUserData({ ...userData, ...data });
      }
    } catch (err: any) {
      setError('Failed to update profile. Please try again.');
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{
      user,
      userData,
      loading,
      error,
      login,
      register,
      logout,
      resetPassword,
      updateUserPassword,
      updateUserProfile,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
