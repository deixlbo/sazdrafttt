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
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
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
  position?: string;
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          let userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

          if (!userDoc.exists()) {
            const q = query(
              collection(db, 'users'),
              where('email', '==', firebaseUser.email)
            );
            const querySnap = await getDocs(q);
            if (!querySnap.empty) {
              userDoc = querySnap.docs[0] as any;
            }
          }

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

            const userStatusRef = ref(realtimeDb, `online_status/${firebaseUser.uid}`);
            set(userStatusRef, {
              online: true,
              lastSeen: rtdbServerTimestamp(),
            });
            onDisconnect(userStatusRef).set({
              online: false,
              lastSeen: rtdbServerTimestamp(),
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
      const uid = userCredential.user.uid;

      console.log('Auth UID:', uid);

      let docSnap = await getDoc(doc(db, 'users', uid));
      let docData = docSnap.exists() ? docSnap.data() : null;

      if (!docData) {
        console.warn('No doc found by UID, trying email fallback...');
        const q = query(collection(db, 'users'), where('email', '==', email));
        const querySnap = await getDocs(q);

        if (!querySnap.empty) {
          docData = querySnap.docs[0].data();
          const wrongDocId = querySnap.docs[0].id;
          console.warn('Found doc by email. Doc ID: ' + wrongDocId + ' | Auth UID: ' + uid);
        }
      }

      if (!docData) {
        await signOut(auth);
        throw new Error('User data not found. Please contact support.');
      }

      console.log('Firestore data:', docData);

      const firestoreRole = (docData.role as string)?.toLowerCase().trim();
      const requestedRole = role.toLowerCase().trim();

      console.log('Firestore role:', firestoreRole);
      console.log('Requested role:', requestedRole);

      if (!firestoreRole) {
        await signOut(auth);
        throw new Error('No role assigned to this account. Please contact support.');
      }

      if (firestoreRole !== requestedRole) {
        await signOut(auth);
        throw new Error(
          'This account is registered as ' + firestoreRole + '. Please use the ' + firestoreRole + ' login page.'
        );
      }

      if (docData.status && docData.status !== 'active') {
        await signOut(auth);
        throw new Error('Your account has been deactivated. Please contact support.');
      }

      router.push('/' + firestoreRole + '/dashboard');

    } catch (err: any) {
      let message = 'Login failed. Please try again.';

      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        message = 'Invalid email or password.';
      } else if (err.code === 'auth/user-not-found') {
        message = 'No account found with this email.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please try again later.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      } else if (err.message) {
        message = err.message;
      }

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

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

      router.push('/resident/dashboard');
    } catch (err: any) {
      let message = 'Registration failed. Please try again.';

      if (err.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      }

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (user) {
        const userStatusRef = ref(realtimeDb, `online_status/${user.uid}`);
        await set(userStatusRef, {
          online: false,
          lastSeen: rtdbServerTimestamp(),
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
      let message = 'Failed to send reset email. Please try again.';
      if (err.code === 'auth/user-not-found') message = 'No account found with this email.';
      else if (err.code === 'auth/invalid-email') message = 'Invalid email address.';
      setError(message);
      throw err;
    }
  };

  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    if (!user || !user.email) throw new Error('No user logged in');
    setError(null);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
    } catch (err: any) {
      let message = 'Failed to update password.';
      if (err.code === 'auth/wrong-password') message = 'Current password is incorrect.';
      else if (err.code === 'auth/weak-password') message = 'New password is too weak.';
      setError(message);
      throw err;
    }
  };

  const updateUserProfile = async (data: Partial<UserData>) => {
    if (!user) throw new Error('No user logged in');
    setError(null);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      if (userData) setUserData({ ...userData, ...data });
    } catch {
      setError('Failed to update profile. Please try again.');
      throw new Error('Failed to update profile');
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
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