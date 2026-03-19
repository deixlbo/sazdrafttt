'use client';

import { useState, useEffect, useRef } from 'react';
import {
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc,
  collection, query, where, orderBy, serverTimestamp,
  onSnapshot, addDoc, limit,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

const HR_EMAIL = 'hr@barangay.gov.ph';
const HR_PASSWORD = 'hr_admin_2024';

// ─── Types ─────────────────────────────────────────────────────────────────
type Tab = 'dashboard' | 'create' | 'officials' | 'residents' | 'documents' | 'audit' | 'announcements' | 'reports';

export default function HRPortal() {
  const [hrLoggedIn, setHrLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  // Data
  const [officials, setOfficials] = useState<any[]>([]);
  const [residents, setResidents] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // Modals
  const [editModal, setEditModal] = useState<any>(null);
  const [docModal, setDocModal] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<any>(null);

  // Filters
  const [docFilter, setDocFilter] = useState({ type: '', status: '', official: '', dateFrom: '', dateTo: '' });
  const [residentSearch, setResidentSearch] = useState('');
  const [auditFilter, setAuditFilter] = useState({ official: '', action: '', dateFrom: '', dateTo: '' });

  // Create Official form
  const [form, setForm] = useState({ email: '', password: '', fullName: '', phone: '', address: '', position: '', gender: '', birthDate: '', civilStatus: '' });
  const [createLoading, setCreateLoading] = useState(false);
  const [createMsg, setCreateMsg] = useState({ type: '', text: '' });

  // Announcement form
  const [annForm, setAnnForm] = useState({ title: '', message: '', target: 'all' });
  const [annLoading, setAnnLoading] = useState(false);
  const [annMsg, setAnnMsg] = useState({ type: '', text: '' });

  // ─── HR Login ─────────────────────────────────────────────────────────────
  const handleHRLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      if (loginEmail.trim().toLowerCase() !== HR_EMAIL || loginPassword !== HR_PASSWORD) {
        throw new Error('Invalid HR credentials.');
      }
      setHrLoggedIn(true);
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  // ─── Real-time Listeners ──────────────────────────────────────────────────
  useEffect(() => {
    if (!hrLoggedIn) return;
    const u1 = onSnapshot(query(collection(db, 'users'), where('role', '==', 'official')), snap => setOfficials(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u2 = onSnapshot(query(collection(db, 'users'), where('role', '==', 'resident')), snap => setResidents(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u3 = onSnapshot(collection(db, 'document_requests'), snap => setDocuments(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u4 = onSnapshot(query(collection(db, 'audit_logs'), orderBy('createdAt', 'desc'), limit(200)), snap => setAuditLogs(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u5 = onSnapshot(query(collection(db, 'announcements'), orderBy('createdAt', 'desc')), snap => setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { u1(); u2(); u3(); u4(); u5(); };
  }, [hrLoggedIn]);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const logAudit = async (action: string, details: string, targetId?: string) => {
    try {
      await addDoc(collection(db, 'audit_logs'), {
        action, details, targetId: targetId || '',
        performedBy: 'HR Admin', performedByEmail: HR_EMAIL,
        createdAt: serverTimestamp(),
      });
    } catch {}
  };

  const getOfficialStats = (id: string) => {
    const d = documents.filter(doc => doc.processedBy === id || doc.officialId === id);
    return { total: d.length, approved: d.filter(x => x.status === 'approved').length, rejected: d.filter(x => x.status === 'rejected').length, pending: d.filter(x => x.status === 'pending').length };
  };

  const getDocsByDay = () => {
    const map: Record<string, number> = {};
    documents.forEach(d => {
      if (d.createdAt?.toDate) {
        const key = d.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        map[key] = (map[key] || 0) + 1;
      }
    });
    return Object.entries(map).slice(-7);
  };

  const exportCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const keys = Object.keys(data[0]).filter(k => k !== 'id');
    const rows = [keys.join(','), ...data.map(r => keys.map(k => JSON.stringify(r[k] ?? '')).join(','))];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename + '.csv';
    a.click();
  };

  const exportOfficials = () => exportCSV(officials.map(o => ({ name: o.fullName, email: o.email, position: o.position, phone: o.phone, status: o.status })), 'officials');
  const exportDocuments = () => exportCSV(filteredDocs.map(d => ({ type: d.documentType || d.type, resident: d.residentName, status: d.status, date: d.createdAt?.toDate?.()?.toLocaleDateString() || '' })), 'documents');
  const exportAuditLogs = () => exportCSV(filteredAudit.map(l => ({ action: l.action, details: l.details, by: l.performedBy, date: l.createdAt?.toDate?.()?.toLocaleDateString() || '' })), 'audit_logs');

  // ─── Account Management ───────────────────────────────────────────────────
  const toggleStatus = async (official: any) => {
    const newStatus = official.status === 'active' ? 'inactive' : 'active';
    await updateDoc(doc(db, 'users', official.id), { status: newStatus, updatedAt: serverTimestamp() });
    await logAudit(newStatus === 'active' ? 'REACTIVATE' : 'DEACTIVATE', official.fullName + ' account ' + newStatus, official.id);
  };

  const resetPassword = async (email: string, name: string) => {
    await sendPasswordResetEmail(auth, email);
    await logAudit('RESET_PASSWORD', 'Password reset sent to ' + name + ' (' + email + ')');
    alert('Password reset email sent to ' + email);
  };

  const deleteOfficial = async (official: any) => {
    await deleteDoc(doc(db, 'users', official.id));
    await logAudit('DELETE_ACCOUNT', 'Deleted official account: ' + official.fullName, official.id);
    setConfirmModal(null);
  };

  const saveEdit = async () => {
    if (!editModal) return;
    await updateDoc(doc(db, 'users', editModal.id), {
      fullName: editModal.fullName, position: editModal.position,
      phone: editModal.phone, address: editModal.address, updatedAt: serverTimestamp(),
    });
    await logAudit('EDIT_ACCOUNT', 'Updated details for ' + editModal.fullName, editModal.id);
    setEditModal(null);
  };

  // ─── Document Override ────────────────────────────────────────────────────
  const overrideDocStatus = async (docId: string, status: string, docType: string) => {
    await updateDoc(doc(db, 'document_requests', docId), { status, updatedAt: serverTimestamp(), processedBy: 'HR Admin', processedByName: 'HR Admin' });
    await logAudit('OVERRIDE_DOC', 'Forced ' + status + ' on document: ' + docType, docId);
    setDocModal(prev => prev ? { ...prev, status } : null);
  };

  // ─── Create Official ──────────────────────────────────────────────────────
  const handleCreateOfficial = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateMsg({ type: '', text: '' });
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);
      await setDoc(doc(db, 'users', cred.user.uid), {
        email: form.email.trim(), fullName: form.fullName.trim(),
        phone: form.phone.trim(), address: form.address.trim(),
        position: form.position.trim(), gender: form.gender,
        birthDate: form.birthDate, civilStatus: form.civilStatus,
        role: 'official', status: 'active',
        createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      });
      await signOut(auth);
      await logAudit('CREATE_OFFICIAL', 'Created official account: ' + form.fullName + ' (' + form.email + ')', cred.user.uid);
      setCreateMsg({ type: 'success', text: 'Official account created! UID: ' + cred.user.uid });
      setForm({ email: '', password: '', fullName: '', phone: '', address: '', position: '', gender: '', birthDate: '', civilStatus: '' });
    } catch (err: any) {
      setCreateMsg({ type: 'error', text: err.code === 'auth/email-already-in-use' ? 'Email already in use.' : err.message });
    } finally {
      setCreateLoading(false);
    }
  };

  // ─── Announcements ────────────────────────────────────────────────────────
  const postAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnnLoading(true);
    setAnnMsg({ type: '', text: '' });
    try {
      await addDoc(collection(db, 'announcements'), {
        title: annForm.title, message: annForm.message,
        target: annForm.target, postedBy: 'HR Admin',
        createdAt: serverTimestamp(),
      });
      await logAudit('POST_ANNOUNCEMENT', 'Posted: ' + annForm.title + ' to ' + annForm.target);
      setAnnMsg({ type: 'success', text: 'Announcement posted!' });
      setAnnForm({ title: '', message: '', target: 'all' });
    } catch {
      setAnnMsg({ type: 'error', text: 'Failed to post announcement.' });
    } finally {
      setAnnLoading(false);
    }
  };

  const deleteAnnouncement = async (id: string, title: string) => {
    await deleteDoc(doc(db, 'announcements', id));
    await logAudit('DELETE_ANNOUNCEMENT', 'Deleted announcement: ' + title);
  };

  // ─── Filtered Data ────────────────────────────────────────────────────────
  const filteredDocs = documents.filter(d => {
    if (docFilter.type && !(d.documentType || d.type || '').toLowerCase().includes(docFilter.type.toLowerCase())) return false;
    if (docFilter.status && d.status !== docFilter.status) return false;
    if (docFilter.official && d.processedBy !== docFilter.official) return false;
    if (docFilter.dateFrom && d.createdAt?.toDate && d.createdAt.toDate() < new Date(docFilter.dateFrom)) return false;
    if (docFilter.dateTo && d.createdAt?.toDate && d.createdAt.toDate() > new Date(docFilter.dateTo)) return false;
    return true;
  });

  const filteredResidents = residents.filter(r => {
    const s = residentSearch.toLowerCase();
    return !s || r.fullName?.toLowerCase().includes(s) || r.email?.toLowerCase().includes(s) || r.address?.toLowerCase().includes(s);
  });

  const filteredAudit = auditLogs.filter(l => {
    if (auditFilter.action && l.action !== auditFilter.action) return false;
    if (auditFilter.official && !l.performedBy?.toLowerCase().includes(auditFilter.official.toLowerCase())) return false;
    if (auditFilter.dateFrom && l.createdAt?.toDate && l.createdAt.toDate() < new Date(auditFilter.dateFrom)) return false;
    if (auditFilter.dateTo && l.createdAt?.toDate && l.createdAt.toDate() > new Date(auditFilter.dateTo)) return false;
    return true;
  });

  const stats = {
    totalOfficials: officials.length, totalResidents: residents.length,
    totalDocs: documents.length, pendingDocs: documents.filter(d => d.status === 'pending').length,
    approvedDocs: documents.filter(d => d.status === 'approved').length,
    rejectedDocs: documents.filter(d => d.status === 'rejected').length,
  };

  const dayData = getDocsByDay();
  const maxDay = Math.max(...dayData.map(([, v]) => v), 1);

  // ─── LOGIN SCREEN ──────────────────────────────────────────────────────────
  if (!hrLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"DM Sans", sans-serif' }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
        <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '48px', width: '100%', maxWidth: '420px', boxShadow: '0 32px 64px rgba(0,0,0,0.4)' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 16px' }}>🏛️</div>
            <h1 style={{ fontFamily: '"Playfair Display", serif', color: '#fff', fontSize: '28px', margin: '0 0 8px' }}>HR Admin Portal</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: 0 }}>Barangay Management System</p>
          </div>
          {loginError && <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', color: '#fca5a5', fontSize: '14px' }}>{loginError}</div>}
          <form onSubmit={handleHRLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>HR Email</label>
              <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required placeholder="hr@barangay.gov.ph" style={darkInput} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Password</label>
              <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required placeholder="••••••••" style={darkInput} />
            </div>
            <button type="submit" disabled={loginLoading} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '15px', fontWeight: '600', cursor: loginLoading ? 'not-allowed' : 'pointer', opacity: loginLoading ? 0.7 : 1 }}>
              {loginLoading ? 'Signing in...' : 'Sign In to HR Portal'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── MAIN PORTAL ──────────────────────────────────────────────────────────
  const navItems: { id: Tab; icon: string; label: string }[] = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'create', icon: '➕', label: 'Create Official' },
    { id: 'officials', icon: '👮', label: 'Officials' },
    { id: 'residents', icon: '👥', label: 'Residents' },
    { id: 'documents', icon: '📄', label: 'Documents' },
    { id: 'audit', icon: '🔍', label: 'Audit Logs' },
    { id: 'announcements', icon: '📢', label: 'Announcements' },
    { id: 'reports', icon: '📈', label: 'Reports' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: '"DM Sans", sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: '240px', background: 'linear-gradient(180deg, #0f0c29 0%, #302b63 100%)', display: 'flex', flexDirection: 'column', zIndex: 100, boxShadow: '4px 0 24px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '24px 20px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🏛️</div>
            <div>
              <div style={{ color: '#fff', fontWeight: '700', fontSize: '14px' }}>HR Portal</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>Admin Dashboard</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '4px 10px', overflowY: 'auto' }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', border: 'none', background: activeTab === item.id ? 'rgba(102,126,234,0.25)' : 'transparent', color: activeTab === item.id ? '#a5b4fc' : 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: activeTab === item.id ? '600' : '400', cursor: 'pointer', textAlign: 'left', marginBottom: '2px', borderLeft: activeTab === item.id ? '3px solid #667eea' : '3px solid transparent' }}>
              <span>{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div style={{ padding: '12px 10px' }}>
          <button onClick={() => setHrLoggedIn(false)} style={{ width: '100%', padding: '10px', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>🚪 Sign Out</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ marginLeft: '240px', padding: '28px' }}>

        {/* ── DASHBOARD ── */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={PT}>Dashboard Overview</h2>
            <p style={PS}>Live statistics and activity feed</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Officials', value: stats.totalOfficials, icon: '👮', color: '#667eea', bg: '#eef2ff' },
                { label: 'Residents', value: stats.totalResidents, icon: '👥', color: '#10b981', bg: '#ecfdf5' },
                { label: 'Total Docs', value: stats.totalDocs, icon: '📄', color: '#f59e0b', bg: '#fffbeb' },
                { label: 'Pending', value: stats.pendingDocs, icon: '⏳', color: '#f59e0b', bg: '#fffbeb' },
                { label: 'Approved', value: stats.approvedDocs, icon: '✅', color: '#10b981', bg: '#ecfdf5' },
                { label: 'Rejected', value: stats.rejectedDocs, icon: '❌', color: '#ef4444', bg: '#fef2f2' },
              ].map(s => (
                <div key={s.label} style={{ background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: '3px solid ' + s.color }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>{s.label}</div>
                      <div style={{ fontSize: '32px', fontWeight: '700', color: '#111' }}>{s.value}</div>
                    </div>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{s.icon}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Line Chart */}
              <div style={CARD}>
                <h3 style={SH}>📈 Document Requests (Last 7 Days)</h3>
                {dayData.length === 0 ? <div style={EMPTY}>No data yet</div> : (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px', paddingTop: '12px' }}>
                    {dayData.map(([label, val]) => (
                      <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>{val}</div>
                        <div style={{ width: '100%', background: 'linear-gradient(180deg, #667eea, #764ba2)', borderRadius: '4px 4px 0 0', height: (val / maxDay * 80) + 'px', minHeight: '4px' }} />
                        <div style={{ fontSize: '10px', color: '#9ca3af' }}>{label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Officials Bar Chart */}
              <div style={CARD}>
                <h3 style={SH}>👮 Official Processing Performance</h3>
                {officials.length === 0 ? <div style={EMPTY}>No officials yet</div> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {officials.slice(0, 5).map(o => {
                      const s = getOfficialStats(o.id);
                      const pct = stats.totalDocs > 0 ? Math.round((s.total / stats.totalDocs) * 100) : 0;
                      return (
                        <div key={o.id}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#374151', marginBottom: '4px' }}>
                            <span style={{ fontWeight: '600' }}>{o.fullName}</span>
                            <span style={{ color: '#6b7280' }}>{s.total} docs ({pct}%)</span>
                          </div>
                          <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: pct + '%', background: 'linear-gradient(90deg, #667eea, #764ba2)', borderRadius: '4px', transition: 'width 0.5s' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Activity Feed */}
              <div style={{ ...CARD, gridColumn: '1 / -1' }}>
                <h3 style={SH}>🕐 Recent Activity</h3>
                {auditLogs.length === 0 ? <div style={EMPTY}>No activity yet</div> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {auditLogs.slice(0, 8).map(log => (
                      <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: '#f9fafb', borderRadius: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: actionColor(log.action).bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{actionColor(log.action).icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>{log.details}</div>
                          <div style={{ fontSize: '11px', color: '#9ca3af' }}>by {log.performedBy} · {log.createdAt?.toDate?.()?.toLocaleString() || 'just now'}</div>
                        </div>
                        <span style={{ ...SB(log.action), fontSize: '10px' }}>{log.action}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── CREATE OFFICIAL ── */}
        {activeTab === 'create' && (
          <div>
            <h2 style={PT}>Create Official Account</h2>
            <p style={PS}>Creates Firebase Auth + Firestore document with correct UID</p>
            {createMsg.text && <div style={{ padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', background: createMsg.type === 'success' ? '#ecfdf5' : '#fef2f2', border: '1px solid ' + (createMsg.type === 'success' ? '#a7f3d0' : '#fecaca'), color: createMsg.type === 'success' ? '#065f46' : '#991b1b', fontSize: '14px' }}>{createMsg.type === 'success' ? '✅ ' : '❌ '}{createMsg.text}</div>}
            <div style={CARD}>
              <form onSubmit={handleCreateOfficial}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                  <div style={{ gridColumn: '1 / -1' }}><div style={SEC}>Login Credentials</div></div>
                  <FL label="Email *"><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="official@barangay.gov.ph" style={FI} /></FL>
                  <FL label="Password *"><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="Min. 6 characters" style={FI} /></FL>
                  <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}><div style={SEC}>Personal Information</div></div>
                  <FL label="Full Name *"><input type="text" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required placeholder="Juan dela Cruz" style={FI} /></FL>
                  <FL label="Position *"><input type="text" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} required placeholder="Barangay Captain" style={FI} /></FL>
                  <FL label="Phone"><input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="09xxxxxxxxx" style={FI} /></FL>
                  <FL label="Address"><input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Barangay address" style={FI} /></FL>
                  <FL label="Birth Date"><input type="date" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} style={FI} /></FL>
                  <FL label="Gender"><select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} style={FI}><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></FL>
                  <FL label="Civil Status"><select value={form.civilStatus} onChange={e => setForm({ ...form, civilStatus: e.target.value })} style={FI}><option value="">Select</option><option value="single">Single</option><option value="married">Married</option><option value="widowed">Widowed</option><option value="separated">Separated</option></select></FL>
                </div>
                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                  <button type="submit" disabled={createLoading} style={{ padding: '12px 28px', background: createLoading ? '#9ca3af' : 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: createLoading ? 'not-allowed' : 'pointer' }}>
                    {createLoading ? 'Creating...' : '➕ Create Official Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── OFFICIALS ── */}
        {activeTab === 'officials' && (
          <div>
            <h2 style={PT}>Officials ({officials.length})</h2>
            <p style={PS}>Manage official accounts — edit, deactivate, reset password, delete</p>
            <div style={CARD}>
              {officials.length === 0 ? <div style={EMPTY}>No officials found</div> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>{['Name & UID', 'Email', 'Position', 'Status', 'Docs', 'Actions'].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
                  <tbody>
                    {officials.map(o => {
                      const s = getOfficialStats(o.id);
                      return (
                        <tr key={o.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={TD}><div style={{ fontWeight: '600', color: '#111' }}>{o.fullName}</div><div style={{ fontSize: '10px', color: '#9ca3af' }}>{o.id.slice(0, 16)}...</div></td>
                          <td style={TD}>{o.email}</td>
                          <td style={TD}>{o.position || '—'}</td>
                          <td style={TD}><span style={statusBadge(o.status)}>{o.status}</span></td>
                          <td style={TD}><span style={{ fontWeight: '700', color: '#667eea' }}>{s.total}</span> <span style={{ fontSize: '11px', color: '#9ca3af' }}>({s.approved}✅ {s.rejected}❌ {s.pending}⏳)</span></td>
                          <td style={TD}>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <Btn color="#667eea" onClick={() => setEditModal({ ...o })}>✏️ Edit</Btn>
                              <Btn color={o.status === 'active' ? '#f59e0b' : '#10b981'} onClick={() => toggleStatus(o)}>{o.status === 'active' ? '⏸ Deactivate' : '▶ Activate'}</Btn>
                              <Btn color="#6366f1" onClick={() => resetPassword(o.email, o.fullName)}>🔑 Reset PW</Btn>
                              <Btn color="#ef4444" onClick={() => setConfirmModal({ label: 'Delete ' + o.fullName + '?', onConfirm: () => deleteOfficial(o) })}>🗑 Delete</Btn>
                            </div>
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

        {/* ── RESIDENTS ── */}
        {activeTab === 'residents' && (
          <div>
            <h2 style={PT}>Residents ({filteredResidents.length})</h2>
            <p style={PS}>Search, view profiles, and manage resident accounts</p>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <input value={residentSearch} onChange={e => setResidentSearch(e.target.value)} placeholder="🔍 Search by name, email, address..." style={{ ...FI, flex: 1 }} />
            </div>
            <div style={CARD}>
              {filteredResidents.length === 0 ? <div style={EMPTY}>No residents found</div> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>{['Name', 'Email', 'Phone', 'Address', 'Status', 'Docs', 'Action'].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
                  <tbody>
                    {filteredResidents.map(r => {
                      const rDocs = documents.filter(d => d.residentId === r.id || d.residentEmail === r.email);
                      return (
                        <tr key={r.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={TD}><div style={{ fontWeight: '600', color: '#111' }}>{r.fullName}</div><div style={{ fontSize: '10px', color: '#9ca3af' }}>{r.id.slice(0, 12)}...</div></td>
                          <td style={TD}>{r.email}</td>
                          <td style={TD}>{r.phone || '—'}</td>
                          <td style={TD}>{r.address || '—'}</td>
                          <td style={TD}><span style={statusBadge(r.status)}>{r.status}</span></td>
                          <td style={TD}><span style={{ fontWeight: '700', color: '#667eea' }}>{rDocs.length}</span></td>
                          <td style={TD}>
                            <Btn color={r.status === 'active' ? '#f59e0b' : '#10b981'} onClick={async () => {
                              const ns = r.status === 'active' ? 'inactive' : 'active';
                              await updateDoc(doc(db, 'users', r.id), { status: ns });
                              await logAudit(ns === 'active' ? 'REACTIVATE' : 'DEACTIVATE', r.fullName + ' resident account ' + ns, r.id);
                            }}>{r.status === 'active' ? '⏸ Deactivate' : '▶ Activate'}</Btn>
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

        {/* ── DOCUMENTS ── */}
        {activeTab === 'documents' && (
          <div>
            <h2 style={PT}>Documents ({filteredDocs.length})</h2>
            <p style={PS}>Filter, view details, and override document status</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <input value={docFilter.type} onChange={e => setDocFilter({ ...docFilter, type: e.target.value })} placeholder="Type..." style={FI} />
              <select value={docFilter.status} onChange={e => setDocFilter({ ...docFilter, status: e.target.value })} style={FI}>
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select value={docFilter.official} onChange={e => setDocFilter({ ...docFilter, official: e.target.value })} style={FI}>
                <option value="">All Officials</option>
                {officials.map(o => <option key={o.id} value={o.id}>{o.fullName}</option>)}
              </select>
              <input type="date" value={docFilter.dateFrom} onChange={e => setDocFilter({ ...docFilter, dateFrom: e.target.value })} style={FI} />
              <input type="date" value={docFilter.dateTo} onChange={e => setDocFilter({ ...docFilter, dateTo: e.target.value })} style={FI} />
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <Btn color="#10b981" onClick={exportDocuments}>⬇ Export CSV</Btn>
              <Btn color="#6b7280" onClick={() => setDocFilter({ type: '', status: '', official: '', dateFrom: '', dateTo: '' })}>✕ Clear Filters</Btn>
            </div>
            <div style={CARD}>
              {filteredDocs.length === 0 ? <div style={EMPTY}>No documents match filters</div> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>{['Type', 'Resident', 'Processed By', 'Status', 'Date', 'Actions'].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
                  <tbody>
                    {filteredDocs.map(d => (
                      <tr key={d.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={TD}>{d.documentType || d.type || 'N/A'}</td>
                        <td style={TD}>{d.residentName || d.residentId || 'N/A'}</td>
                        <td style={TD}>{d.processedByName || d.processedBy || '—'}</td>
                        <td style={TD}><span style={statusBadge(d.status)}>{d.status || 'pending'}</span></td>
                        <td style={TD}>{d.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</td>
                        <td style={TD}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <Btn color="#667eea" onClick={() => setDocModal(d)}>👁 View</Btn>
                            <Btn color="#10b981" onClick={() => overrideDocStatus(d.id, 'approved', d.documentType || d.type)}>✅ Approve</Btn>
                            <Btn color="#ef4444" onClick={() => overrideDocStatus(d.id, 'rejected', d.documentType || d.type)}>❌ Reject</Btn>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── AUDIT LOGS ── */}
        {activeTab === 'audit' && (
          <div>
            <h2 style={PT}>Audit Logs ({filteredAudit.length})</h2>
            <p style={PS}>Track every action performed in the system</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <select value={auditFilter.action} onChange={e => setAuditFilter({ ...auditFilter, action: e.target.value })} style={FI}>
                <option value="">All Actions</option>
                {['CREATE_OFFICIAL', 'EDIT_ACCOUNT', 'DEACTIVATE', 'REACTIVATE', 'DELETE_ACCOUNT', 'RESET_PASSWORD', 'OVERRIDE_DOC', 'POST_ANNOUNCEMENT', 'DELETE_ANNOUNCEMENT'].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <input value={auditFilter.official} onChange={e => setAuditFilter({ ...auditFilter, official: e.target.value })} placeholder="Filter by performer..." style={FI} />
              <input type="date" value={auditFilter.dateFrom} onChange={e => setAuditFilter({ ...auditFilter, dateFrom: e.target.value })} style={FI} />
              <input type="date" value={auditFilter.dateTo} onChange={e => setAuditFilter({ ...auditFilter, dateTo: e.target.value })} style={FI} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Btn color="#10b981" onClick={exportAuditLogs}>⬇ Export CSV</Btn>
            </div>
            <div style={CARD}>
              {filteredAudit.length === 0 ? <div style={EMPTY}>No audit logs found</div> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>{['Action', 'Details', 'Performed By', 'Date & Time'].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
                  <tbody>
                    {filteredAudit.map(log => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={TD}><span style={SB(log.action)}>{log.action}</span></td>
                        <td style={TD}>{log.details}</td>
                        <td style={TD}>{log.performedBy}</td>
                        <td style={TD}>{log.createdAt?.toDate?.()?.toLocaleString() || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── ANNOUNCEMENTS ── */}
        {activeTab === 'announcements' && (
          <div>
            <h2 style={PT}>Announcements</h2>
            <p style={PS}>Post system-wide notices to officials, residents, or everyone</p>
            {annMsg.text && <div style={{ padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', background: annMsg.type === 'success' ? '#ecfdf5' : '#fef2f2', border: '1px solid ' + (annMsg.type === 'success' ? '#a7f3d0' : '#fecaca'), color: annMsg.type === 'success' ? '#065f46' : '#991b1b', fontSize: '14px' }}>{annMsg.type === 'success' ? '✅ ' : '❌ '}{annMsg.text}</div>}
            <div style={CARD}>
              <h3 style={SH}>Post New Announcement</h3>
              <form onSubmit={postAnnouncement}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <FL label="Title *"><input type="text" value={annForm.title} onChange={e => setAnnForm({ ...annForm, title: e.target.value })} required placeholder="Announcement title" style={FI} /></FL>
                  <FL label="Target Audience">
                    <select value={annForm.target} onChange={e => setAnnForm({ ...annForm, target: e.target.value })} style={FI}>
                      <option value="all">Everyone</option>
                      <option value="official">Officials Only</option>
                      <option value="resident">Residents Only</option>
                    </select>
                  </FL>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <FL label="Message *">
                      <textarea value={annForm.message} onChange={e => setAnnForm({ ...annForm, message: e.target.value })} required placeholder="Write your announcement..." rows={4} style={{ ...FI, resize: 'vertical' }} />
                    </FL>
                  </div>
                </div>
                <button type="submit" disabled={annLoading} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                  {annLoading ? 'Posting...' : '📢 Post Announcement'}
                </button>
              </form>
            </div>

            <div style={CARD}>
              <h3 style={SH}>Posted Announcements ({announcements.length})</h3>
              {announcements.length === 0 ? <div style={EMPTY}>No announcements yet</div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {announcements.map(a => (
                    <div key={a.id} style={{ padding: '16px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontWeight: '700', color: '#111', fontSize: '15px' }}>{a.title}</div>
                          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                            To: <b>{a.target}</b> · by {a.postedBy} · {a.createdAt?.toDate?.()?.toLocaleDateString() || '—'}
                          </div>
                        </div>
                        <Btn color="#ef4444" onClick={() => deleteAnnouncement(a.id, a.title)}>🗑 Delete</Btn>
                      </div>
                      <p style={{ margin: 0, fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>{a.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── REPORTS ── */}
        {activeTab === 'reports' && (
          <div>
            <h2 style={PT}>Reports & Export</h2>
            <p style={PS}>Download data exports and view monthly performance</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Export Officials List', desc: 'Name, email, position, status', color: '#667eea', action: exportOfficials, icon: '👮' },
                { label: 'Export Documents', desc: 'All requests with status & dates', color: '#10b981', action: exportDocuments, icon: '📄' },
                { label: 'Export Audit Logs', desc: 'Full activity history', color: '#f59e0b', action: exportAuditLogs, icon: '🔍' },
              ].map(r => (
                <div key={r.label} style={{ background: '#fff', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: '3px solid ' + r.color }}>
                  <div style={{ fontSize: '28px', marginBottom: '12px' }}>{r.icon}</div>
                  <div style={{ fontWeight: '700', fontSize: '15px', color: '#111', marginBottom: '4px' }}>{r.label}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>{r.desc}</div>
                  <button onClick={r.action} style={{ padding: '8px 18px', background: r.color, border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>⬇ Download CSV</button>
                </div>
              ))}
            </div>

            {/* Monthly Report */}
            <div style={CARD}>
              <h3 style={SH}>📊 Monthly Performance Report</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                {[
                  { label: 'Docs This Month', value: documents.filter(d => { if (!d.createdAt?.toDate) return false; const now = new Date(); const dt = d.createdAt.toDate(); return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear(); }).length, color: '#667eea' },
                  { label: 'Approval Rate', value: stats.totalDocs > 0 ? Math.round((stats.approvedDocs / stats.totalDocs) * 100) + '%' : '0%', color: '#10b981' },
                  { label: 'Active Officials', value: officials.filter(o => o.status === 'active').length, color: '#f59e0b' },
                  { label: 'Active Residents', value: residents.filter(r => r.status === 'active').length, color: '#6366f1' },
                ].map(s => (
                  <div key={s.label} style={{ padding: '16px', background: '#f9fafb', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Per-Official Breakdown</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>{['Official', 'Position', 'Total Processed', 'Approved', 'Rejected', 'Pending', 'Rate'].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
                <tbody>
                  {officials.map(o => {
                    const s = getOfficialStats(o.id);
                    const rate = s.total > 0 ? Math.round((s.approved / s.total) * 100) : 0;
                    return (
                      <tr key={o.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={TD}><div style={{ fontWeight: '600' }}>{o.fullName}</div></td>
                        <td style={TD}>{o.position || '—'}</td>
                        <td style={{ ...TD, fontWeight: '700', color: '#667eea' }}>{s.total}</td>
                        <td style={{ ...TD, color: '#10b981', fontWeight: '600' }}>{s.approved}</td>
                        <td style={{ ...TD, color: '#ef4444', fontWeight: '600' }}>{s.rejected}</td>
                        <td style={{ ...TD, color: '#f59e0b', fontWeight: '600' }}>{s.pending}</td>
                        <td style={TD}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: rate + '%', background: '#10b981', borderRadius: '3px' }} />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>{rate}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── EDIT MODAL ── */}
      {editModal && (
        <Modal title="Edit Official" onClose={() => setEditModal(null)}>
          <div style={{ display: 'grid', gap: '12px' }}>
            <FL label="Full Name"><input value={editModal.fullName} onChange={e => setEditModal({ ...editModal, fullName: e.target.value })} style={FI} /></FL>
            <FL label="Position"><input value={editModal.position || ''} onChange={e => setEditModal({ ...editModal, position: e.target.value })} style={FI} /></FL>
            <FL label="Phone"><input value={editModal.phone || ''} onChange={e => setEditModal({ ...editModal, phone: e.target.value })} style={FI} /></FL>
            <FL label="Address"><input value={editModal.address || ''} onChange={e => setEditModal({ ...editModal, address: e.target.value })} style={FI} /></FL>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button onClick={saveEdit} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Save Changes</button>
              <button onClick={() => setEditModal(null)} style={{ flex: 1, padding: '10px', background: '#f3f4f6', border: 'none', borderRadius: '8px', color: '#374151', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── DOC MODAL ── */}
      {docModal && (
        <Modal title="Document Details" onClose={() => setDocModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              ['Type', docModal.documentType || docModal.type || 'N/A'],
              ['Resident', docModal.residentName || docModal.residentId || 'N/A'],
              ['Status', docModal.status || 'pending'],
              ['Processed By', docModal.processedByName || docModal.processedBy || '—'],
              ['Date', docModal.createdAt?.toDate?.()?.toLocaleString() || 'N/A'],
              ['Purpose', docModal.purpose || '—'],
              ['Notes', docModal.notes || '—'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: '12px', padding: '10px', background: '#f9fafb', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280', width: '100px', flexShrink: 0, fontWeight: '600' }}>{k}</span>
                <span style={{ fontSize: '13px', color: '#111' }}>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button onClick={() => overrideDocStatus(docModal.id, 'approved', docModal.documentType)} style={{ flex: 1, padding: '10px', background: '#10b981', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>✅ Force Approve</button>
              <button onClick={() => overrideDocStatus(docModal.id, 'rejected', docModal.documentType)} style={{ flex: 1, padding: '10px', background: '#ef4444', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>❌ Force Reject</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── CONFIRM MODAL ── */}
      {confirmModal && (
        <Modal title="Confirm Action" onClose={() => setConfirmModal(null)}>
          <p style={{ color: '#374151', fontSize: '14px', marginBottom: '20px' }}>{confirmModal.label}</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={confirmModal.onConfirm} style={{ flex: 1, padding: '10px', background: '#ef4444', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Confirm</button>
            <button onClick={() => setConfirmModal(null)} style={{ flex: 1, padding: '10px', background: '#f3f4f6', border: 'none', borderRadius: '8px', color: '#374151', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#111' }}>{title}</h3>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer', fontSize: '14px' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FL({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>{label}</label>
      {children}
    </div>
  );
}

function Btn({ color, onClick, children }: { color: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ padding: '5px 10px', background: color + '18', border: '1px solid ' + color + '40', borderRadius: '6px', color: color, fontSize: '11px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>
      {children}
    </button>
  );
}

function actionColor(action: string) {
  const map: Record<string, { bg: string; icon: string }> = {
    CREATE_OFFICIAL: { bg: '#eef2ff', icon: '➕' },
    EDIT_ACCOUNT: { bg: '#fffbeb', icon: '✏️' },
    DEACTIVATE: { bg: '#fef2f2', icon: '⏸' },
    REACTIVATE: { bg: '#ecfdf5', icon: '▶' },
    DELETE_ACCOUNT: { bg: '#fef2f2', icon: '🗑' },
    RESET_PASSWORD: { bg: '#f5f3ff', icon: '🔑' },
    OVERRIDE_DOC: { bg: '#fffbeb', icon: '📄' },
    POST_ANNOUNCEMENT: { bg: '#ecfdf5', icon: '📢' },
    DELETE_ANNOUNCEMENT: { bg: '#fef2f2', icon: '🗑' },
  };
  return map[action] || { bg: '#f9fafb', icon: '📋' };
}

// ─── Shared styles ─────────────────────────────────────────────────────────
const PT: React.CSSProperties = { margin: '0 0 6px', fontSize: '22px', fontWeight: '700', color: '#111', fontFamily: '"Playfair Display", serif' };
const PS: React.CSSProperties = { margin: '0 0 24px', fontSize: '13px', color: '#6b7280' };
const CARD: React.CSSProperties = { background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '20px' };
const SH: React.CSSProperties = { margin: '0 0 16px', fontSize: '14px', fontWeight: '700', color: '#111' };
const SEC: React.CSSProperties = { fontSize: '11px', fontWeight: '700', color: '#667eea', textTransform: 'uppercase', letterSpacing: '0.08em' };
const TH: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #f3f4f6' };
const TD: React.CSSProperties = { padding: '11px 12px', fontSize: '13px', color: '#374151', verticalAlign: 'middle' };
const EMPTY: React.CSSProperties = { textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: '14px' };
const darkInput: React.CSSProperties = { width: '100%', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
const FI: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: '#f9fafb', fontSize: '13px', color: '#111', outline: 'none', boxSizing: 'border-box' };

const statusBadge = (status: string): React.CSSProperties => ({
  display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', textTransform: 'capitalize',
  background: status === 'active' || status === 'approved' ? '#ecfdf5' : status === 'pending' ? '#fffbeb' : status === 'rejected' || status === 'inactive' ? '#fef2f2' : '#f3f4f6',
  color: status === 'active' || status === 'approved' ? '#065f46' : status === 'pending' ? '#92400e' : status === 'rejected' || status === 'inactive' ? '#991b1b' : '#6b7280',
});

const SB = (action: string): React.CSSProperties => ({
  display: 'inline-block', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '700',
  background: action.includes('DELETE') || action === 'DEACTIVATE' ? '#fef2f2' : action === 'REACTIVATE' || action === 'CREATE_OFFICIAL' ? '#ecfdf5' : '#fffbeb',
  color: action.includes('DELETE') || action === 'DEACTIVATE' ? '#991b1b' : action === 'REACTIVATE' || action === 'CREATE_OFFICIAL' ? '#065f46' : '#92400e',
});