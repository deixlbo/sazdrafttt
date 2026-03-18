'use client';

import { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  DocumentData,
  QueryConstraint,
  getDocs,
  limit,
  Timestamp
} from 'firebase/firestore';
import { ref, onValue, push, set, remove, serverTimestamp as rtdbServerTimestamp } from 'firebase/database';
import { db, realtimeDb } from './firebase';
import { useAuth } from './auth-context';

// Generic Firestore collection hook
export function useFirestoreCollection<T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<(T & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, collectionName), ...constraints);
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as (T & { id: string })[];
        setData(items);
        setLoading(false);
      },
      (err) => {
        console.error(`Error fetching ${collectionName}:`, err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, JSON.stringify(constraints)]);

  return { data, loading, error };
}

// Document Requests Hook
export function useDocumentRequests(residentId?: string) {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
  if (residentId) {
    constraints.unshift(where('residentId', '==', residentId));
  }
  
  return useFirestoreCollection('document_requests', constraints);
}

// Announcements Hook
export function useAnnouncements() {
  return useFirestoreCollection('announcements', [orderBy('createdAt', 'desc')]);
}

// Programs Hook
export function usePrograms() {
  return useFirestoreCollection('programs', [orderBy('createdAt', 'desc')]);
}

// Blotter Reports Hook
export function useBlotterReports(reporterId?: string) {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
  if (reporterId) {
    constraints.unshift(where('reporterId', '==', reporterId));
  }
  
  return useFirestoreCollection('blotter_reports', constraints);
}

// Businesses Hook
export function useBusinesses() {
  return useFirestoreCollection('businesses', [orderBy('createdAt', 'desc')]);
}

// Audit Logs Hook
export function useAuditLogs(limitCount: number = 50) {
  return useFirestoreCollection('audit_logs', [orderBy('timestamp', 'desc'), limit(limitCount)]);
}

// Users Hook (for officials to view residents)
export function useUsers(role?: 'resident' | 'official') {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
  if (role) {
    constraints.unshift(where('role', '==', role));
  }
  
  return useFirestoreCollection('users', constraints);
}

// Realtime Notifications Hook
export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const notificationsRef = ref(realtimeDb, `notifications/${userId}`);
    
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notificationList = Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          ...value
        })).sort((a, b) => b.createdAt - a.createdAt);
        setNotifications(notificationList);
      } else {
        setNotifications([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { notifications, loading };
}

// CRUD Operations
export async function addDocument(collectionName: string, data: any) {
  return await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateDocument(collectionName: string, docId: string, data: any) {
  const docRef = doc(db, collectionName, docId);
  return await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDocument(collectionName: string, docId: string) {
  const docRef = doc(db, collectionName, docId);
  return await deleteDoc(docRef);
}

// Add notification to Realtime Database
export async function addNotification(userId: string, notification: {
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}) {
  const notificationsRef = ref(realtimeDb, `notifications/${userId}`);
  return await push(notificationsRef, {
    ...notification,
    read: false,
    createdAt: Date.now(),
  });
}

// Mark notification as read
export async function markNotificationRead(userId: string, notificationId: string) {
  const notificationRef = ref(realtimeDb, `notifications/${userId}/${notificationId}`);
  return await set(notificationRef, { read: true });
}

// Delete notification
export async function deleteNotification(userId: string, notificationId: string) {
  const notificationRef = ref(realtimeDb, `notifications/${userId}/${notificationId}`);
  return await remove(notificationRef);
}

// Add audit log
export async function addAuditLog(data: {
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  details: string;
}) {
  return await addDoc(collection(db, 'audit_logs'), {
    ...data,
    timestamp: serverTimestamp(),
  });
}

// Format Firestore timestamp
export function formatTimestamp(timestamp: Timestamp | Date | null): string {
  if (!timestamp) return '';
  
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// Format date only
export function formatDate(timestamp: Timestamp | Date | null): string {
  if (!timestamp) return '';
  
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
