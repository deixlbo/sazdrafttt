'use client';

import { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  updateDoc,
  deleteDoc,
  limit,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

const HR_EMAIL = 'hr@barangay.gov.ph';
const HR_PASSWORD = 'hr_admin_2024';

// Email notification function
const sendEmailNotification = async ({ to, subject, html }) => {
  console.log('📧 EMAIL NOTIFICATION:');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Content: ${html}`);
  
  if (typeof window !== 'undefined') {
    alert(`[DEV MODE] Email would be sent to:\n${to}\nSubject: ${subject}\n\nCheck console for details.`);
  }
  
  return true;
};

export default function HRPortal() {
  const [hrLoggedIn, setHrLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Create Account Form (Reusable for both officials and residents)
  const [accountType, setAccountType] = useState('official');
  const [form, setForm] = useState({
    email: '', password: '', fullName: '', phone: '',
    address: '', position: '', gender: '', birthDate: '', civilStatus: '',
    barangay: '', occupation: '', emergencyContact: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createMsg, setCreateMsg] = useState({ type: '', text: '' });

  // Data states
  const [officials, setOfficials] = useState([]);
  const [residents, setResidents] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalUserType, setModalUserType] = useState('');
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedAuditLog, setSelectedAuditLog] = useState(null);
  
  // Document verification
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);

  // System settings
  const [systemSettings, setSystemSettings] = useState({
    requireDocumentVerification: true,
    autoApproveResidents: false,
    maxLoginAttempts: 5,
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [stats, setStats] = useState({
    totalOfficials: 0, totalResidents: 0, totalDocs: 0,
    pendingDocs: 0, approvedDocs: 0, rejectedDocs: 0,
    pendingRegistrations: 0, totalAuditLogs: 0,
  });

  const handleHRLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      if (loginEmail.trim().toLowerCase() !== HR_EMAIL || loginPassword !== HR_PASSWORD) {
        throw new Error('Invalid HR credentials.');
      }
      setHrLoggedIn(true);
      await addAuditLog('hr_login', 'hr_admin', { email: loginEmail });
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  useEffect(() => {
    if (!hrLoggedIn) return;
    
    const unsubOfficials = onSnapshot(
      query(collection(db, 'users'), where('role', '==', 'official')),
      (snap) => setOfficials(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    
    const unsubResidents = onSnapshot(
      query(collection(db, 'users'), where('role', '==', 'resident')),
      (snap) => setResidents(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    
    const unsubDocs = onSnapshot(
      collection(db, 'document_requests'),
      (snap) => setDocuments(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    
    const unsubAudit = onSnapshot(
      query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(100)),
      (snap) => setAuditLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    
    return () => { unsubOfficials(); unsubResidents(); unsubDocs(); unsubAudit(); };
  }, [hrLoggedIn]);

  useEffect(() => {
    const pendingRegistrations = residents.filter(r => r.status === 'pending_verification').length;
    setStats({
      totalOfficials: officials.length,
      totalResidents: residents.length,
      totalDocs: documents.length,
      pendingDocs: documents.filter((d) => d.status === 'pending').length,
      approvedDocs: documents.filter((d) => d.status === 'approved').length,
      rejectedDocs: documents.filter((d) => d.status === 'rejected').length,
      pendingRegistrations,
      totalAuditLogs: auditLogs.length,
    });
  }, [officials, residents, documents, auditLogs]);

  const addAuditLog = async (action, userId, details = {}) => {
    try {
      await setDoc(doc(collection(db, 'audit_logs')), {
        action,
        userId,
        details,
        timestamp: serverTimestamp(),
        ipAddress: '127.0.0.1', // You can get real IP in production
        userAgent: navigator.userAgent,
      });
    } catch (err) {
      console.error('Error adding audit log:', err);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateMsg({ type: '', text: '' });
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);
      const uid = userCredential.user.uid;
      
      const userData = {
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        gender: form.gender,
        birthDate: form.birthDate,
        civilStatus: form.civilStatus,
        role: accountType,
        status: accountType === 'official' ? 'active' : (systemSettings.autoApproveResidents ? 'active' : 'pending_verification'),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: 'hr_admin',
      };
      
      if (accountType === 'official') {
        userData.position = form.position.trim();
      } else {
        userData.barangay = form.barangay;
        userData.occupation = form.occupation;
        userData.emergencyContact = form.emergencyContact;
      }
      
      await setDoc(doc(db, 'users', uid), userData);
      
      await addAuditLog('account_created', uid, { 
        accountType,
        fullName: form.fullName.trim(),
        email: form.email.trim() 
      });
      
      await signOut(auth);
      
      setCreateMsg({ 
        type: 'success', 
        text: `${accountType === 'official' ? 'Official' : 'Resident'} account created successfully!` 
      });
      
      // Reset form
      setForm({ 
        email: '', password: '', fullName: '', phone: '', address: '', 
        position: '', gender: '', birthDate: '', civilStatus: '',
        barangay: '', occupation: '', emergencyContact: '',
      });
      
    } catch (err) {
      let msg = err.message;
      if (err.code === 'auth/email-already-in-use') msg = 'Email already in use.';
      else if (err.code === 'auth/weak-password') msg = 'Password must be at least 6 characters.';
      setCreateMsg({ type: 'error', text: msg });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userType, userEmail) => {
    if (!confirm(`Are you sure you want to delete this ${userType} account? This action cannot be undone.`)) return;
    
    try {
      await addAuditLog('account_deleted', userId, { userType, userEmail });
      await deleteDoc(doc(db, 'users', userId));
      alert(`${userType.charAt(0).toUpperCase() + userType.slice(1)} account deleted successfully`);
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Error deleting account: ' + err.message);
    }
  };

  const handleUpdateUserStatus = async (userId, newStatus, reason = '') => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
        ...(reason && { statusReason: reason }),
      });
      
      await addAuditLog('user_status_updated', userId, { newStatus, reason });
      alert(`User status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error updating status: ' + err.message);
    }
  };

  const handleVerifyResident = async (residentId, isApproved, message = '') => {
    setVerificationLoading(true);
    try {
      const residentRef = doc(db, 'users', residentId);
      const residentDoc = await getDoc(residentRef);
      const residentData = residentDoc.data();
      
      if (isApproved) {
        await updateDoc(residentRef, {
          status: 'active',
          verifiedAt: serverTimestamp(),
          verifiedBy: 'hr_admin',
          verificationNote: message || 'Account approved',
        });
        
        await sendEmailNotification({
          to: residentData.email,
          subject: 'Barangay Registration Approved',
          html: `
            <h2>Congratulations!</h2>
            <p>Dear ${residentData.fullName},</p>
            <p>Your barangay registration has been approved. You can now log in to your account.</p>
            <p>${message || 'Welcome to our barangay community!'}</p>
            <p>Best regards,<br/>Barangay Administration</p>
          `
        });
        
        await addAuditLog('resident_verified', residentId, { approved: true });
        alert('Resident account approved and email notification sent');
      } else {
        await updateDoc(residentRef, {
          status: 'rejected',
          rejectedAt: serverTimestamp(),
          rejectedBy: 'hr_admin',
          rejectionReason: message,
        });
        
        await sendEmailNotification({
          to: residentData.email,
          subject: 'Barangay Registration - Action Required',
          html: `
            <h2>Registration Update</h2>
            <p>Dear ${residentData.fullName},</p>
            <p>We have reviewed your registration and found that some information is insufficient or incorrect.</p>
            <p><strong>Reason:</strong> ${message || 'Please review and update your registration information.'}</p>
            <p>Please register again with complete and accurate information.</p>
            <p>Best regards,<br/>Barangay Administration</p>
          `
        });
        
        await addAuditLog('resident_rejected', residentId, { reason: message });
        alert('Resident registration rejected and email notification sent');
      }
      
      const updatedResidents = await getDocs(query(collection(db, 'users'), where('role', '==', 'resident')));
      setResidents(updatedResidents.docs.map((d) => ({ id: d.id, ...d.data() })));
      
    } catch (err) {
      console.error('Error verifying resident:', err);
      alert('Error processing verification: ' + err.message);
    } finally {
      setVerificationLoading(false);
      setShowDocumentModal(false);
      setSelectedDocument(null);
    }
  };

  const handleViewUser = async (user, type) => {
    setSelectedUser(user);
    setModalUserType(type);
    setShowUserModal(true);
  };

  const handleViewAuditLog = (log) => {
    setSelectedAuditLog(log);
    setShowAuditModal(true);
  };

  const handleUpdateSettings = async () => {
    try {
      // Save settings to Firestore
      await setDoc(doc(db, 'system_settings', 'hr_settings'), {
        ...systemSettings,
        updatedAt: serverTimestamp(),
        updatedBy: 'hr_admin',
      });
      
      await addAuditLog('settings_updated', 'hr_admin', systemSettings);
      alert('Settings updated successfully');
      setShowSettingsModal(false);
    } catch (err) {
      console.error('Error updating settings:', err);
      alert('Error updating settings: ' + err.message);
    }
  };

  const getOfficialStats = (officialId) => {
    const processed = documents.filter((d) => d.processedBy === officialId || d.officialId === officialId);
    return {
      total: processed.length,
      approved: processed.filter((d) => d.status === 'approved').length,
      rejected: processed.filter((d) => d.status === 'rejected').length,
      pending: processed.filter((d) => d.status === 'pending').length,
    };
  };

  // Login screen
  if (!hrLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #021818, #083030, #0d4a4a)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"DM Sans", sans-serif',
      }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
        <div style={{
          background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px',
          padding: '48px', width: '100%', maxWidth: '420px',
          boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{
              width: '64px', height: '64px',
              background: 'linear-gradient(135deg, #0d7070, #083030)',
              borderRadius: '16px', border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px', margin: '0 auto 16px',
            }}>🏛️</div>
            <h1 style={{ fontFamily: '"Playfair Display", serif', color: '#fff', fontSize: '28px', margin: '0 0 8px' }}>
              HR Admin Portal
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: 0 }}>
              Barangay Management System
            </p>
          </div>

          {loginError && (
            <div style={{
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '12px', padding: '12px 16px', marginBottom: '20px',
              color: '#fca5a5', fontSize: '14px',
            }}>{loginError}</div>
          )}

          <form onSubmit={handleHRLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>HR Email</label>
              <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                required placeholder="hr@barangay.gov.ph" style={inputStyle} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Password</label>
              <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                required placeholder="••••••••" style={inputStyle} />
            </div>
            <button type="submit" disabled={loginLoading} style={{
              width: '100%', padding: '14px',
              background: 'linear-gradient(135deg, #0d7070, #083030)',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px',
              color: '#fff', fontSize: '15px', fontWeight: '600',
              cursor: loginLoading ? 'not-allowed' : 'pointer',
              opacity: loginLoading ? 0.7 : 1, transition: 'all 0.2s',
            }}>
              {loginLoading ? 'Signing in...' : 'Sign In to HR Portal'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Main Portal
  return (
    <div style={{ minHeight: '100vh', background: '#eef3f3', fontFamily: '"DM Sans", sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <div style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: '280px',
        background: 'linear-gradient(180deg, #021818 0%, #083030 60%, #0a3a3a 100%)',
        display: 'flex', flexDirection: 'column', zIndex: 100,
        boxShadow: '4px 0 24px rgba(0,0,0,0.25)',
      }}>
        <div style={{ padding: '28px 24px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px',
              background: 'linear-gradient(135deg, #0d7070, #083030)',
              borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', border: '1px solid rgba(255,255,255,0.12)',
            }}>🏛️</div>
            <div>
              <div style={{ color: '#fff', fontWeight: '700', fontSize: '15px' }}>HR Portal</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Admin Dashboard</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '8px 12px' }}>
          {[
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'accounts', icon: '👥', label: 'Manage Accounts' },
            { id: 'officials', icon: '👮', label: 'Officials' },
            { id: 'residents', icon: '👥', label: 'Residents' },
            { id: 'audit', icon: '📋', label: 'Audit Logs' },
            { id: 'settings', icon: '⚙️', label: 'System Settings' },
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px', borderRadius: '10px', border: 'none',
              background: activeTab === item.id ? 'rgba(13,112,112,0.35)' : 'transparent',
              color: activeTab === item.id ? '#7de8d8' : 'rgba(255,255,255,0.5)',
              fontSize: '14px', fontWeight: activeTab === item.id ? '600' : '400',
              cursor: 'pointer', textAlign: 'left', marginBottom: '2px',
              transition: 'all 0.2s',
              borderLeft: activeTab === item.id ? '3px solid #0dada0' : '3px solid transparent',
            }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={{ padding: '16px 12px' }}>
          <button onClick={() => {
            addAuditLog('hr_logout', 'hr_admin', {});
            setHrLoggedIn(false);
          }} style={{
            width: '100%', padding: '12px', borderRadius: '10px',
            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#fca5a5', fontSize: '14px', cursor: 'pointer', fontWeight: '500',
          }}>
            🚪 Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '280px', padding: '32px' }}>

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={pageTitle}>Dashboard Overview</h2>
            <p style={pageSubtitle}>Real-time statistics for the barangay system</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
              {[
                { label: 'Total Officials', value: stats.totalOfficials, icon: '👮', color: '#083030', bg: '#d6eeee' },
                { label: 'Total Residents', value: stats.totalResidents, icon: '👥', color: '#10b981', bg: '#ecfdf5' },
                { label: 'Pending Reg', value: stats.pendingRegistrations, icon: '⏳', color: '#f59e0b', bg: '#fffbeb' },
                { label: 'Total Documents', value: stats.totalDocs, icon: '📄', color: '#0a5a5a', bg: '#daeaea' },
                { label: 'Audit Logs', value: stats.totalAuditLogs, icon: '📋', color: '#6b7280', bg: '#f3f4f6' },
              ].map((s) => (
                <div key={s.label} style={{
                  background: '#fff', borderRadius: '16px', padding: '24px',
                  boxShadow: '0 2px 12px rgba(8,48,48,0.08)', borderTop: '3px solid ' + s.color,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>{s.label}</div>
                      <div style={{ fontSize: '36px', fontWeight: '700', color: '#111' }}>{s.value}</div>
                    </div>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '12px',
                      background: s.bg, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '22px',
                    }}>{s.icon}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#111' }}>
                Recent Audit Logs
              </h3>
              {auditLogs.length === 0 ? (
                <div style={emptyState}>No audit logs found</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Action', 'User ID', 'Timestamp', 'Details'].map((h) => <th key={h} style={thStyle}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.slice(0, 5).map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #f0f5f5', cursor: 'pointer' }} onClick={() => handleViewAuditLog(log)}>
                        <td style={tdStyle}><span style={auditBadge(log.action)}>{log.action}</span></td>
                        <td style={tdStyle}>{log.userId?.slice(0, 12)}...</td>
                        <td style={tdStyle}>{log.timestamp?.toDate().toLocaleString() || 'N/A'}</td>
                        <td style={tdStyle}>{Object.keys(log.details || {}).length} fields</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* MANAGE ACCOUNTS - Create both Officials and Residents */}
        {activeTab === 'accounts' && (
          <div>
            <h2 style={pageTitle}>Create New Account</h2>
            <p style={pageSubtitle}>Create official or resident accounts</p>

            {createMsg.text && (
              <div style={{
                padding: '14px 18px', borderRadius: '12px', marginBottom: '24px',
                background: createMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
                border: '1px solid ' + (createMsg.type === 'success' ? '#a7f3d0' : '#fecaca'),
                color: createMsg.type === 'success' ? '#065f46' : '#991b1b', fontSize: '14px',
              }}>
                {createMsg.type === 'success' ? '✅ ' : '❌ '}{createMsg.text}
              </div>
            )}

            <div style={cardStyle}>
              <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', borderBottom: '1px solid #e8f0f0', paddingBottom: '16px' }}>
                <button
                  onClick={() => setAccountType('official')}
                  style={{
                    padding: '8px 20px',
                    background: accountType === 'official' ? '#083030' : '#fff',
                    color: accountType === 'official' ? '#fff' : '#083030',
                    border: '1px solid #083030',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  👮 Official Account
                </button>
                <button
                  onClick={() => setAccountType('resident')}
                  style={{
                    padding: '8px 20px',
                    background: accountType === 'resident' ? '#083030' : '#fff',
                    color: accountType === 'resident' ? '#fff' : '#083030',
                    border: '1px solid #083030',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  👤 Resident Account
                </button>
              </div>

              <form onSubmit={handleCreateAccount}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ gridColumn: '1 / -1' }}><h4 style={sectionLabel}>Login Credentials</h4></div>

                  <FormField label="Email Address *">
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required placeholder="user@barangay.gov.ph" style={formInput} />
                  </FormField>
                  <FormField label="Password *">
                    <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required placeholder="Min. 6 characters" style={formInput} />
                  </FormField>

                  <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e8f0f0', paddingTop: '20px' }}>
                    <h4 style={sectionLabel}>Personal Information</h4>
                  </div>

                  <FormField label="Full Name *">
                    <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      required placeholder="Juan dela Cruz" style={formInput} />
                  </FormField>
                  
                  {accountType === 'official' && (
                    <FormField label="Position *">
                      <input type="text" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}
                        required placeholder="Barangay Captain" style={formInput} />
                    </FormField>
                  )}
                  
                  <FormField label="Phone Number">
                    <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="09xxxxxxxxx" style={formInput} />
                  </FormField>
                  <FormField label="Address">
                    <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="Complete address" style={formInput} />
                  </FormField>
                  <FormField label="Birth Date">
                    <input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                      style={formInput} />
                  </FormField>
                  <FormField label="Gender">
                    <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} style={formInput}>
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </FormField>
                  <FormField label="Civil Status">
                    <select value={form.civilStatus} onChange={(e) => setForm({ ...form, civilStatus: e.target.value })} style={formInput}>
                      <option value="">Select status</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="widowed">Widowed</option>
                      <option value="separated">Separated</option>
                    </select>
                  </FormField>

                  {accountType === 'resident' && (
                    <>
                      <FormField label="Barangay">
                        <input type="text" value={form.barangay} onChange={(e) => setForm({ ...form, barangay: e.target.value })}
                          placeholder="Barangay" style={formInput} />
                      </FormField>
                      <FormField label="Occupation">
                        <input type="text" value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                          placeholder="Occupation" style={formInput} />
                      </FormField>
                      <FormField label="Emergency Contact">
                        <input type="text" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                          placeholder="Emergency contact number" style={formInput} />
                      </FormField>
                    </>
                  )}
                </div>

                <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #e8f0f0' }}>
                  <button type="submit" disabled={createLoading} style={{
                    padding: '14px 32px',
                    background: createLoading ? '#9ca3af' : 'linear-gradient(135deg, #0d7070, #083030)',
                    border: 'none', borderRadius: '12px',
                    color: '#fff', fontSize: '15px', fontWeight: '600',
                    cursor: createLoading ? 'not-allowed' : 'pointer',
                  }}>
                    {createLoading ? 'Creating Account...' : `➕ Create ${accountType === 'official' ? 'Official' : 'Resident'} Account`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* OFFICIALS */}
        {activeTab === 'officials' && (
          <div>
            <h2 style={pageTitle}>Officials ({officials.length})</h2>
            <p style={pageSubtitle}>All registered barangay officials - Click on any official to view their activity</p>
            <div style={cardStyle}>
              {officials.length === 0 ? <div style={emptyState}>No officials found</div> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Name', 'Email', 'Position', 'Phone', 'Status', 'Documents Processed', 'Actions'].map((h) => <th key={h} style={thStyle}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {officials.map((o) => {
                      const stats = getOfficialStats(o.id);
                      return (
                        <tr key={o.id} style={{ borderBottom: '1px solid #f0f5f5' }}>
                          <td style={{ ...tdStyle, cursor: 'pointer' }} onClick={() => handleViewUser(o, 'official')}>
                            <div style={{ fontWeight: '600', color: '#111' }}>{o.fullName}</div>
                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>{o.id.slice(0, 12)}...</div>
                          </td>
                          <td style={{ ...tdStyle, cursor: 'pointer' }} onClick={() => handleViewUser(o, 'official')}>{o.email}</td>
                          <td style={{ ...tdStyle, cursor: 'pointer' }} onClick={() => handleViewUser(o, 'official')}>{o.position || '—'}</td>
                          <td style={{ ...tdStyle, cursor: 'pointer' }} onClick={() => handleViewUser(o, 'official')}>{o.phone || '—'}</td>
                          <td style={{ ...tdStyle, cursor: 'pointer' }} onClick={() => handleViewUser(o, 'official')}>
                            <span style={statusBadge(o.status)}>{o.status}</span>
                          </td>
                          <td style={{ ...tdStyle, cursor: 'pointer' }} onClick={() => handleViewUser(o, 'official')}>
                            <div>Total: {stats.total}</div>
                            <div style={{ fontSize: '11px' }}>✅ {stats.approved} ❌ {stats.rejected}</div>
                           </td>
                          <td style={tdStyle}>
                            <select
                              onChange={(e) => handleUpdateUserStatus(o.id, e.target.value)}
                              value={o.status}
                              style={statusSelect}
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                              <option value="suspended">Suspended</option>
                            </select>
                            <button
                              onClick={() => handleDeleteUser(o.id, 'official', o.email)}
                              style={deleteButton}
                            >
                              Delete
                            </button>
                           </td>
                         </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* RESIDENTS */}
        {activeTab === 'residents' && (
          <div>
            <h2 style={pageTitle}>Residents ({residents.length})</h2>
            <p style={pageSubtitle}>All registered residents - Click on any resident to view their details</p>
            <div style={cardStyle}>
              {residents.length === 0 ? <div style={emptyState}>No residents found</div> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Name', 'Email', 'Phone', 'Barangay', 'Status', 'Documents', 'Actions'].map((h) => <th key={h} style={thStyle}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {residents.map((r) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #f0f5f5' }}>
                        <td style={{ ...tdStyle, cursor: 'pointer' }} onClick={() => handleViewUser(r, 'resident')}>
                          <div style={{ fontWeight: '600', color: '#111' }}>{r.fullName}</div>
                          <div style={{ fontSize: '11px', color: '#9ca3af' }}>{r.id.slice(0, 12)}...</div>
                        </td>
                        <td style={{ ...tdStyle, cursor: 'pointer' }} onClick={() => handleViewUser(r, 'resident')}>{r.email}</td>
                        <td style={{ ...tdStyle, cursor: 'pointer' }} onClick={() => handleViewUser(r, 'resident')}>{r.phone || '—'}</td>
                        <td style={{ ...tdStyle, cursor: 'pointer' }} onClick={() => handleViewUser(r, 'resident')}>{r.barangay || r.address || '—'}</td>
                        <td style={{ ...tdStyle, cursor: 'pointer' }} onClick={() => handleViewUser(r, 'resident')}>
                          <span style={statusBadge(r.status || 'pending_verification')}>{r.status || 'pending_verification'}</span>
                        </td>
                        <td style={tdStyle}>
                          {r.uploadedDocuments && r.uploadedDocuments.length > 0 ? (
                            <button
                              onClick={() => {
                                setSelectedDocument(r);
                                setShowDocumentModal(true);
                              }}
                              style={smallButton}
                            >
                              View ({r.uploadedDocuments.length})
                            </button>
                          ) : 'No docs'}
                        </td>
                        <td style={tdStyle}>
                          <select
                            onChange={(e) => handleUpdateUserStatus(r.id, e.target.value)}
                            value={r.status || 'pending_verification'}
                            style={statusSelect}
                          >
                            <option value="pending_verification">Pending</option>
                            <option value="active">Active</option>
                            <option value="rejected">Rejected</option>
                            <option value="suspended">Suspended</option>
                          </select>
                          <button
                            onClick={() => handleDeleteUser(r.id, 'resident', r.email)}
                            style={deleteButton}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div>
            <h2 style={pageTitle}>Audit Logs</h2>
            <p style={pageSubtitle}>Complete history of all system actions</p>
            <div style={cardStyle}>
              {auditLogs.length === 0 ? (
                <div style={emptyState}>No audit logs found</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Timestamp', 'Action', 'User ID', 'IP Address', 'Details'].map((h) => <th key={h} style={thStyle}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #f0f5f5', cursor: 'pointer' }} onClick={() => handleViewAuditLog(log)}>
                        <td style={tdStyle}>{log.timestamp?.toDate().toLocaleString() || 'N/A'}</td>
                        <td style={tdStyle}><span style={auditBadge(log.action)}>{log.action.replace(/_/g, ' ')}</span></td>
                        <td style={tdStyle}>{log.userId?.slice(0, 12)}...</td>
                        <td style={tdStyle}>{log.ipAddress || 'N/A'}</td>
                        <td style={tdStyle}>
                          {log.details && Object.keys(log.details).length > 0 && (
                            <span style={viewDetailsLink}>View Details</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* SYSTEM SETTINGS */}
        {activeTab === 'settings' && (
          <div>
            <h2 style={pageTitle}>System Settings</h2>
            <p style={pageSubtitle}>Configure system preferences and security settings</p>
            
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '600' }}>General Settings</h3>
              
              <div style={settingItem}>
                <label style={settingLabel}>
                  <input
                    type="checkbox"
                    checked={systemSettings.requireDocumentVerification}
                    onChange={(e) => setSystemSettings({ ...systemSettings, requireDocumentVerification: e.target.checked })}
                    style={{ marginRight: '12px' }}
                  />
                  Require document verification for new residents
                </label>
                <p style={settingDescription}>New residents must upload valid documents for verification before account activation</p>
              </div>

              <div style={settingItem}>
                <label style={settingLabel}>
                  <input
                    type="checkbox"
                    checked={systemSettings.autoApproveResidents}
                    onChange={(e) => setSystemSettings({ ...systemSettings, autoApproveResidents: e.target.checked })}
                    style={{ marginRight: '12px' }}
                  />
                  Auto-approve resident registrations
                </label>
                <p style={settingDescription}>Automatically activate new resident accounts without manual verification</p>
              </div>

              <div style={settingItem}>
                <label style={settingLabel}>
                  Max Login Attempts:
                  <input
                    type="number"
                    value={systemSettings.maxLoginAttempts}
                    onChange={(e) => setSystemSettings({ ...systemSettings, maxLoginAttempts: parseInt(e.target.value) })}
                    style={numberInput}
                  />
                </label>
                <p style={settingDescription}>Maximum number of failed login attempts before account lockout</p>
              </div>

              <div style={{ marginTop: '32px', textAlign: 'right' }}>
                <button
                  onClick={handleUpdateSettings}
                  style={saveButton}
                >
                  Save Settings
                </button>
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '600' }}>System Information</h3>
              <div style={infoRow}>
                <span style={infoLabel}>Total Users:</span>
                <span style={infoValue}>{stats.totalOfficials + stats.totalResidents}</span>
              </div>
              <div style={infoRow}>
                <span style={infoLabel}>Total Audit Logs:</span>
                <span style={infoValue}>{stats.totalAuditLogs}</span>
              </div>
              <div style={infoRow}>
                <span style={infoLabel}>System Version:</span>
                <span style={infoValue}>2.0.0</span>
              </div>
              <div style={infoRow}>
                <span style={infoLabel}>Last Updated:</span>
                <span style={infoValue}>{new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Modal */}
      {showUserModal && selectedUser && (
        <div style={modalOverlay} onClick={() => setShowUserModal(false)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeader}>
              <h3 style={{ margin: 0, fontSize: '20px', color: '#083030' }}>
                {modalUserType === 'official' ? '👮 Official' : '👤 Resident'} Details
              </h3>
              <button onClick={() => setShowUserModal(false)} style={closeButton}>×</button>
            </div>
            
            <div style={modalBody}>
              <div style={userInfoSection}>
                <h4>Personal Information</h4>
                <p><strong>Name:</strong> {selectedUser.fullName}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Phone:</strong> {selectedUser.phone || 'Not provided'}</p>
                <p><strong>Address:</strong> {selectedUser.address || 'Not provided'}</p>
                {modalUserType === 'official' && (
                  <p><strong>Position:</strong> {selectedUser.position || 'Not assigned'}</p>
                )}
                {modalUserType === 'resident' && (
                  <>
                    <p><strong>Barangay:</strong> {selectedUser.barangay || 'Not provided'}</p>
                    <p><strong>Occupation:</strong> {selectedUser.occupation || 'Not provided'}</p>
                    <p><strong>Emergency Contact:</strong> {selectedUser.emergencyContact || 'Not provided'}</p>
                  </>
                )}
                <p><strong>Status:</strong> <span style={statusBadge(selectedUser.status)}>{selectedUser.status || 'pending_verification'}</span></p>
                <p><strong>Joined:</strong> {selectedUser.createdAt?.toDate ? selectedUser.createdAt.toDate().toLocaleString() : 'Unknown'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Modal */}
      {showAuditModal && selectedAuditLog && (
        <div style={modalOverlay} onClick={() => setShowAuditModal(false)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeader}>
              <h3 style={{ margin: 0, fontSize: '20px', color: '#083030' }}>
                📋 Audit Log Details
              </h3>
              <button onClick={() => setShowAuditModal(false)} style={closeButton}>×</button>
            </div>
            
            <div style={modalBody}>
              <div style={userInfoSection}>
                <p><strong>Action:</strong> <span style={auditBadge(selectedAuditLog.action)}>{selectedAuditLog.action}</span></p>
                <p><strong>User ID:</strong> {selectedAuditLog.userId}</p>
                <p><strong>Timestamp:</strong> {selectedAuditLog.timestamp?.toDate().toLocaleString() || 'N/A'}</p>
                <p><strong>IP Address:</strong> {selectedAuditLog.ipAddress || 'N/A'}</p>
                <p><strong>User Agent:</strong> {selectedAuditLog.userAgent || 'N/A'}</p>
                {selectedAuditLog.details && Object.keys(selectedAuditLog.details).length > 0 && (
                  <>
                    <p><strong>Details:</strong></p>
                    <pre style={detailsPre}>{JSON.stringify(selectedAuditLog.details, null, 2)}</pre>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Modal */}
      {showDocumentModal && selectedDocument && (
        <div style={modalOverlay} onClick={() => setShowDocumentModal(false)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeader}>
              <h3 style={{ margin: 0, fontSize: '20px', color: '#083030' }}>
                📄 Resident Documents - {selectedDocument.fullName}
              </h3>
              <button onClick={() => setShowDocumentModal(false)} style={closeButton}>×</button>
            </div>
            
            <div style={modalBody}>
              <div style={documentSection}>
                <h4>Uploaded Documents</h4>
                {selectedDocument.uploadedDocuments && selectedDocument.uploadedDocuments.length > 0 ? (
                  selectedDocument.uploadedDocuments.map((doc, idx) => (
                    <div key={idx} style={documentItem}>
                      <div style={documentInfo}>
                        <strong>{doc.documentType}:</strong> {doc.fileName}
                      </div>
                      <a 
                        href={doc.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={viewDocumentLink}
                      >
                        View Document
                      </a>
                    </div>
                  ))
                ) : (
                  <p>No documents uploaded</p>
                )}
              </div>

              {selectedDocument.status === 'pending_verification' && (
                <div style={verificationSection}>
                  <h4>Verification Actions</h4>
                  <div style={verificationActions}>
                    <input
                      type="text"
                      placeholder="Add a message for the resident (optional)"
                      value={verificationMessage}
                      onChange={(e) => setVerificationMessage(e.target.value)}
                      style={messageInput}
                    />
                    <div style={buttonGroup}>
                      <button
                        onClick={() => handleVerifyResident(selectedDocument.id, true, verificationMessage)}
                        disabled={verificationLoading}
                        style={approveButton}
                      >
                        Approve Registration
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Please provide a reason for rejection:');
                          if (reason) handleVerifyResident(selectedDocument.id, false, reason);
                        }}
                        disabled={verificationLoading}
                        style={rejectButton}
                      >
                        Reject Registration
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// Styles
const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: '10px',
  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
  color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
};

const formInput = {
  width: '100%', padding: '10px 14px', borderRadius: '10px',
  border: '1.5px solid #c5dede', background: '#f2f8f8',
  fontSize: '14px', color: '#111', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

const cardStyle = {
  background: '#fff', borderRadius: '16px', padding: '24px',
  boxShadow: '0 2px 12px rgba(8,48,48,0.07)', marginBottom: '24px',
};

const pageTitle = {
  margin: '0 0 6px', fontSize: '24px', fontWeight: '700', color: '#111',
  fontFamily: '"Playfair Display", serif',
};

const pageSubtitle = { margin: '0 0 28px', fontSize: '14px', color: '#6b7280' };

const sectionLabel = {
  margin: '0 0 4px', fontSize: '13px', fontWeight: '600',
  color: '#083030', textTransform: 'uppercase', letterSpacing: '0.05em',
};

const thStyle = {
  padding: '10px 14px', textAlign: 'left', fontSize: '12px',
  fontWeight: '600', color: '#6b7280', textTransform: 'uppercase',
  letterSpacing: '0.05em', borderBottom: '2px solid #e8f0f0',
};

const tdStyle = { padding: '12px 14px', fontSize: '13px', color: '#374151', verticalAlign: 'middle' };

const emptyState = { textAlign: 'center', padding: '48px', color: '#9ca3af', fontSize: '14px' };

const statusBadge = (status) => ({
  display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
  fontSize: '11px', fontWeight: '600', textTransform: 'capitalize',
  background:
    status === 'active' || status === 'approved' ? '#ecfdf5' :
    status === 'pending_verification' || status === 'pending' ? '#fffbeb' :
    status === 'rejected' || status === 'inactive' ? '#fef2f2' : '#f3f4f6',
  color:
    status === 'active' || status === 'approved' ? '#065f46' :
    status === 'pending_verification' || status === 'pending' ? '#92400e' :
    status === 'rejected' || status === 'inactive' ? '#991b1b' : '#6b7280',
});

const auditBadge = (action) => ({
  display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
  fontSize: '11px', fontWeight: '600',
  background: action.includes('create') ? '#dbeafe' :
              action.includes('delete') ? '#fee2e2' :
              action.includes('update') ? '#d1fae5' : '#f3f4f6',
  color: action.includes('create') ? '#1e40af' :
         action.includes('delete') ? '#991b1b' :
         action.includes('update') ? '#065f46' : '#374151',
});

const statusSelect = {
  padding: '4px 8px',
  borderRadius: '6px',
  border: '1px solid #c5dede',
  fontSize: '12px',
  marginRight: '8px',
  cursor: 'pointer',
};

const deleteButton = {
  padding: '4px 12px',
  background: '#ef4444',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '12px',
  cursor: 'pointer',
  marginLeft: '8px',
};

const smallButton = {
  padding: '4px 12px',
  background: '#083030',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '12px',
  cursor: 'pointer',
};

const viewDetailsLink = {
  color: '#0d7070',
  textDecoration: 'underline',
  cursor: 'pointer',
};

const settingItem = {
  marginBottom: '24px',
  padding: '16px',
  background: '#f2f8f8',
  borderRadius: '12px',
};

const settingLabel = {
  display: 'flex',
  alignItems: 'center',
  fontSize: '14px',
  fontWeight: '600',
  color: '#083030',
  marginBottom: '8px',
};

const settingDescription = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '8px 0 0 24px',
};

const numberInput = {
  width: '80px',
  marginLeft: '12px',
  padding: '4px 8px',
  borderRadius: '6px',
  border: '1px solid #c5dede',
  fontSize: '14px',
};

const saveButton = {
  padding: '10px 24px',
  background: 'linear-gradient(135deg, #0d7070, #083030)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
};

const infoRow = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '12px 0',
  borderBottom: '1px solid #e8f0f0',
};

const infoLabel = {
  fontWeight: '600',
  color: '#374151',
};

const infoValue = {
  color: '#083030',
  fontWeight: '500',
};

const modalOverlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalContent = {
  background: 'white',
  borderRadius: '16px',
  width: '90%',
  maxWidth: '700px',
  maxHeight: '80vh',
  overflow: 'auto',
  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
};

const modalHeader = {
  padding: '20px 24px',
  borderBottom: '1px solid #e8f0f0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const closeButton = {
  background: 'none',
  border: 'none',
  fontSize: '28px',
  cursor: 'pointer',
  color: '#9ca3af',
  padding: '0 8px',
};

const modalBody = {
  padding: '24px',
};

const userInfoSection = {
  marginBottom: '32px',
  padding: '16px',
  background: '#f2f8f8',
  borderRadius: '12px',
};

const detailsPre = {
  background: '#fff',
  padding: '12px',
  borderRadius: '8px',
  overflow: 'auto',
  fontSize: '12px',
  marginTop: '8px',
};

const documentSection = {
  marginBottom: '24px',
};

const documentItem = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px',
  background: '#f2f8f8',
  borderRadius: '8px',
  marginBottom: '8px',
};

const documentInfo = {
  flex: 1,
};

const viewDocumentLink = {
  padding: '4px 12px',
  background: '#083030',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '6px',
  fontSize: '12px',
};

const verificationSection = {
  marginTop: '24px',
  paddingTop: '24px',
  borderTop: '1px solid #e8f0f0',
};

const verificationActions = {
  marginTop: '16px',
};

const messageInput = {
  width: '100%',
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #c5dede',
  marginBottom: '16px',
  fontSize: '14px',
};

const buttonGroup = {
  display: 'flex',
  gap: '12px',
};

const approveButton = {
  padding: '10px 20px',
  background: '#10b981',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
};

const rejectButton = {
  padding: '10px 20px',
  background: '#ef4444',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
};