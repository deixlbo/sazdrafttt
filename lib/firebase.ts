import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQg8_W1dwmu1kpxmc9ETgcZnwVeIwpfAM",
  authDomain: "santiago-8c23d.firebaseapp.com",
  databaseURL: "https://santiago-8c23d-default-rtdb.firebaseio.com",
  projectId: "santiago-8c23d",
  storageBucket: "santiago-8c23d.firebasestorage.app",
  messagingSenderId: "231367811054",
  appId: "1:231367811054:web:64d196295636efd71878ff",
  measurementId: "G-SZFMVKD1PR"
};

// Initialize Firebase (prevent multiple initializations)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore (for structured data: users, documents, announcements, programs, businesses, audit logs)
export const db = getFirestore(app);

// Initialize Realtime Database (for real-time features: notifications, chat, online status)
export const realtimeDb = getDatabase(app);

export default app;

/*
===========================================
FIREBASE DATABASE STRUCTURE
===========================================

FIRESTORE COLLECTIONS:
----------------------

1. users (collection)
   - {userId} (document)
     - email: string
     - fullName: string
     - phone: string
     - address: string
     - role: "resident" | "official"
     - status: "active" | "inactive"
     - birthDate: string
     - gender: string
     - civilStatus: string
     - createdAt: timestamp
     - updatedAt: timestamp

2. officials (collection)
   - {officialId} (document)
     - userId: string (reference to users collection)
     - position: string
     - dateAppointed: timestamp
     - status: "active" | "inactive"

3. document_requests (collection)
   - {requestId} (document)
     - residentId: string
     - residentName: string
     - documentType: string
     - purpose: string
     - status: "pending" | "processing" | "approved" | "rejected" | "released"
     - notes: string
     - createdAt: timestamp
     - updatedAt: timestamp
     - processedBy: string (officialId)
     - approvedAt: timestamp

4. announcements (collection)
   - {announcementId} (document)
     - title: string
     - content: string
     - category: "Event" | "Meeting" | "Maintenance" | "Alert"
     - priority: "low" | "medium" | "high"
     - author: string
     - authorId: string
     - createdAt: timestamp
     - updatedAt: timestamp

5. programs (collection)
   - {programId} (document)
     - title: string
     - description: string
     - category: "Health" | "Livelihood" | "Sports" | "Environment" | "Education"
     - date: string
     - location: string
     - createdBy: string
     - createdAt: timestamp
     - updatedAt: timestamp

6. blotter_reports (collection)
   - {blotterId} (document)
     - reporterId: string
     - reporterName: string
     - incidentType: string
     - title: string
     - description: string
     - location: string
     - severity: "low" | "medium" | "high"
     - status: "reported" | "investigating" | "resolved" | "closed"
     - createdAt: timestamp
     - updatedAt: timestamp
     - handledBy: string

7. businesses (collection)
   - {businessId} (document)
     - businessName: string
     - ownerName: string
     - ownerId: string
     - type: string
     - address: string
     - permitNumber: string
     - status: "pending" | "active" | "expired" | "revoked"
     - createdAt: timestamp
     - updatedAt: timestamp

8. audit_logs (collection)
   - {logId} (document)
     - userId: string
     - userName: string
     - userRole: string
     - action: string
     - module: string
     - details: string
     - ipAddress: string
     - timestamp: timestamp

REALTIME DATABASE STRUCTURE:
----------------------------

/notifications/{userId}/{notificationId}
  - title: string
  - message: string
  - type: "success" | "info" | "warning" | "error"
  - read: boolean
  - createdAt: number (timestamp)

/online_status/{userId}
  - online: boolean
  - lastSeen: number (timestamp)

/chat_messages/{conversationId}/{messageId}
  - senderId: string
  - content: string
  - timestamp: number

===========================================
FIRESTORE SECURITY RULES
===========================================

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is the owner
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Helper function to get user role
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    // Helper function to check if user is official
    function isOfficial() {
      return isAuthenticated() && getUserRole() == 'official';
    }
    
    // Helper function to check if user is resident
    function isResident() {
      return isAuthenticated() && getUserRole() == 'resident';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && (isOwner(userId) || isOfficial());
      allow create: if isAuthenticated() && isOwner(userId);
      allow update: if isAuthenticated() && (isOwner(userId) || isOfficial());
      allow delete: if isOfficial();
    }
    
    // Officials collection
    match /officials/{officialId} {
      allow read: if isAuthenticated();
      allow write: if isOfficial();
    }
    
    // Document requests collection
    match /document_requests/{requestId} {
      allow read: if isAuthenticated() && 
        (resource.data.residentId == request.auth.uid || isOfficial());
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && 
        (resource.data.residentId == request.auth.uid || isOfficial());
      allow delete: if isOfficial();
    }
    
    // Announcements collection
    match /announcements/{announcementId} {
      allow read: if isAuthenticated();
      allow write: if isOfficial();
    }
    
    // Programs collection
    match /programs/{programId} {
      allow read: if isAuthenticated();
      allow write: if isOfficial();
    }
    
    // Blotter reports collection
    match /blotter_reports/{blotterId} {
      allow read: if isAuthenticated() && 
        (resource.data.reporterId == request.auth.uid || isOfficial());
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && 
        (resource.data.reporterId == request.auth.uid || isOfficial());
      allow delete: if isOfficial();
    }
    
    // Businesses collection
    match /businesses/{businessId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && 
        (resource.data.ownerId == request.auth.uid || isOfficial());
      allow delete: if isOfficial();
    }
    
    // Audit logs collection
    match /audit_logs/{logId} {
      allow read: if isOfficial();
      allow create: if isAuthenticated();
      allow update, delete: if false; // Audit logs should never be modified
    }
  }
}

===========================================
REALTIME DATABASE SECURITY RULES
===========================================

{
  "rules": {
    "notifications": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "auth != null"
      }
    },
    "online_status": {
      "$userId": {
        ".read": "auth != null",
        ".write": "$userId === auth.uid"
      }
    },
    "chat_messages": {
      "$conversationId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}

*/
