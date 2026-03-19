'use client';

import { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
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
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

const HR_EMAIL = 'hr@barangay.gov.ph';
const HR_PASSWORD = 'hr_admin_2024';

export default function HRPortal() {
  const [hrLoggedIn, setHrLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [form, setForm] = useState({
    email: '', password: '', fullName: '', phone: '',
    address: '', position: '', gender: '', birthDate: '', civilStatus: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createMsg, setCreateMsg] = useState({ type: '', text: '' });

  const [officials, setOfficials] = useState([]);
  const [residents, setResidents] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({
    totalOfficials: 0, totalResidents: 0, totalDocs: 0,
    pendingDocs: 0, approvedDocs: 0, rejectedDocs: 0,
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
    return () => { unsubOfficials(); unsubResidents(); unsubDocs(); };
  }, [hrLoggedIn]);

  useEffect(() => {
    setStats({
      totalOfficials: officials.length,
      totalResidents: residents.length,
      totalDocs: documents.length,
      pendingDocs: documents.filter((d) => d.status === 'pending').length,
      approvedDocs: documents.filter((d) => d.status === 'approved').length,
      rejectedDocs: documents.filter((d) => d.status === 'rejected').length,
    });
  }, [officials, residents, documents]);

  const handleCreateOfficial = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateMsg({ type: '', text: '' });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);
      const uid = userCredential.user.uid;
      await setDoc(doc(db, 'users', uid), {
        email: form.email.trim(), fullName: form.fullName.trim(),
        phone: form.phone.trim(), address: form.address.trim(),
        position: form.position.trim(), gender: form.gender,
        birthDate: form.birthDate, civilStatus: form.civilStatus,
        role: 'official', status: 'active',
        createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      });
      await signOut(auth);
      setCreateMsg({ type: 'success', text: 'Official account created successfully! UID: ' + uid });
      setForm({ email: '', password: '', fullName: '', phone: '', address: '', position: '', gender: '', birthDate: '', civilStatus: '' });
    } catch (err) {
      let msg = err.message;
      if (err.code === 'auth/email-already-in-use') msg = 'Email already in use.';
      else if (err.code === 'auth/weak-password') msg = 'Password must be at least 6 characters.';
      setCreateMsg({ type: 'error', text: msg });
    } finally {
      setCreateLoading(false);
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

  // ─── LOGIN SCREEN ──────────────────────────────────────────────────────────
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

  // ─── MAIN PORTAL ───────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#eef3f3', fontFamily: '"DM Sans", sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <div style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: '260px',
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
            { id: 'create', icon: '➕', label: 'Create Official' },
            { id: 'officials', icon: '👮', label: 'Officials' },
            { id: 'residents', icon: '👥', label: 'Residents' },
            { id: 'documents', icon: '📄', label: 'Documents' },
            { id: 'tracking', icon: '📈', label: 'User Tracking' },
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
          <button onClick={() => setHrLoggedIn(false)} style={{
            width: '100%', padding: '12px', borderRadius: '10px',
            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#fca5a5', fontSize: '14px', cursor: 'pointer', fontWeight: '500',
          }}>
            🚪 Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '260px', padding: '32px' }}>

        {/* ── DASHBOARD ── */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={pageTitle}>Dashboard Overview</h2>
            <p style={pageSubtitle}>Real-time statistics for the barangay system</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
              {[
                { label: 'Total Officials', value: stats.totalOfficials, icon: '👮', color: '#083030', bg: '#d6eeee' },
                { label: 'Total Residents', value: stats.totalResidents, icon: '👥', color: '#10b981', bg: '#ecfdf5' },
                { label: 'Total Documents', value: stats.totalDocs, icon: '📄', color: '#0a5a5a', bg: '#daeaea' },
                { label: 'Pending', value: stats.pendingDocs, icon: '⏳', color: '#f59e0b', bg: '#fffbeb' },
                { label: 'Approved', value: stats.approvedDocs, icon: '✅', color: '#10b981', bg: '#ecfdf5' },
                { label: 'Rejected', value: stats.rejectedDocs, icon: '❌', color: '#ef4444', bg: '#fef2f2' },
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
                Recent Document Requests
              </h3>
              {documents.length === 0 ? (
                <div style={emptyState}>No document requests yet</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>{['Document Type', 'Resident', 'Status', 'Date'].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {documents.slice(0, 10).map((d) => (
                      <tr key={d.id} style={{ borderBottom: '1px solid #f0f5f5' }}>
                        <td style={tdStyle}>{d.documentType || d.type || 'N/A'}</td>
                        <td style={tdStyle}>{d.residentName || d.residentId || 'N/A'}</td>
                        <td style={tdStyle}><span style={statusBadge(d.status)}>{d.status || 'pending'}</span></td>
                        <td style={tdStyle}>{d.createdAt?.toDate ? d.createdAt.toDate().toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── CREATE OFFICIAL ── */}
        {activeTab === 'create' && (
          <div>
            <h2 style={pageTitle}>Create Official Account</h2>
            <p style={pageSubtitle}>This creates a Firebase Auth account + Firestore document with the correct UID</p>

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
              <form onSubmit={handleCreateOfficial}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ gridColumn: '1 / -1' }}><h4 style={sectionLabel}>Login Credentials</h4></div>

                  <FormField label="Email Address *">
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required placeholder="official@barangay.gov.ph" style={formInput} />
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
                  <FormField label="Position *">
                    <input type="text" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}
                      required placeholder="Barangay Captain" style={formInput} />
                  </FormField>
                  <FormField label="Phone Number">
                    <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="09xxxxxxxxx" style={formInput} />
                  </FormField>
                  <FormField label="Address">
                    <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="Barangay address" style={formInput} />
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
                </div>

                <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #e8f0f0' }}>
                  <button type="submit" disabled={createLoading} style={{
                    padding: '14px 32px',
                    background: createLoading ? '#9ca3af' : 'linear-gradient(135deg, #0d7070, #083030)',
                    border: 'none', borderRadius: '12px',
                    color: '#fff', fontSize: '15px', fontWeight: '600',
                    cursor: createLoading ? 'not-allowed' : 'pointer',
                  }}>
                    {createLoading ? 'Creating Account...' : '➕ Create Official Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── OFFICIALS ── */}
        {activeTab === 'officials' && (
          <div>
            <h2 style={pageTitle}>Officials ({officials.length})</h2>
            <p style={pageSubtitle}>All registered barangay officials</p>
            <div style={cardStyle}>
              {officials.length === 0 ? <div style={emptyState}>No officials found</div> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>{['Name', 'Email', 'Position', 'Phone', 'Status', 'Created'].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {officials.map((o) => (
                      <tr key={o.id} style={{ borderBottom: '1px solid #f0f5f5' }}>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: '600', color: '#111' }}>{o.fullName}</div>
                          <div style={{ fontSize: '11px', color: '#9ca3af' }}>{o.id.slice(0, 12)}...</div>
                        </td>
                        <td style={tdStyle}>{o.email}</td>
                        <td style={tdStyle}>{o.position || '—'}</td>
                        <td style={tdStyle}>{o.phone || '—'}</td>
                        <td style={tdStyle}><span style={statusBadge(o.status)}>{o.status}</span></td>
                        <td style={tdStyle}>{o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── RESIDENTS ── */}
        {activeTab === 'residents' && (
          <div>
            <h2 style={pageTitle}>Residents ({residents.length})</h2>
            <p style={pageSubtitle}>All registered residents</p>
            <div style={cardStyle}>
              {residents.length === 0 ? <div style={emptyState}>No residents found</div> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>{['Name', 'Email', 'Phone', 'Address', 'Status', 'Joined'].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {residents.map((r) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #f0f5f5' }}>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: '600', color: '#111' }}>{r.fullName}</div>
                          <div style={{ fontSize: '11px', color: '#9ca3af' }}>{r.id.slice(0, 12)}...</div>
                        </td>
                        <td style={tdStyle}>{r.email}</td>
                        <td style={tdStyle}>{r.phone || '—'}</td>
                        <td style={tdStyle}>{r.address || '—'}</td>
                        <td style={tdStyle}><span style={statusBadge(r.status)}>{r.status}</span></td>
                        <td style={tdStyle}>{r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── DOCUMENTS ── */}
        {activeTab === 'documents' && (
          <div>
            <h2 style={pageTitle}>Document Requests ({documents.length})</h2>
            <p style={pageSubtitle}>All document requests across the system</p>
            <div style={cardStyle}>
              {documents.length === 0 ? <div style={emptyState}>No document requests found</div> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>{['Type', 'Resident', 'Processed By', 'Status', 'Date'].map((h) => <th key={h} style={thStyle}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {documents.map((d) => (
                      <tr key={d.id} style={{ borderBottom: '1px solid #f0f5f5' }}>
                        <td style={tdStyle}>{d.documentType || d.type || 'N/A'}</td>
                        <td style={tdStyle}>{d.residentName || d.residentId || 'N/A'}</td>
                        <td style={tdStyle}>{d.processedByName || d.processedBy || '—'}</td>
                        <td style={tdStyle}><span style={statusBadge(d.status)}>{d.status || 'pending'}</span></td>
                        <td style={tdStyle}>{d.createdAt?.toDate ? d.createdAt.toDate().toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── USER TRACKING ── */}
        {activeTab === 'tracking' && (
          <div>
            <h2 style={pageTitle}>User Tracking</h2>
            <p style={pageSubtitle}>Document processing performance per official</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '600', color: '#111' }}>👮 Officials Activity</h3>
                {officials.length === 0 ? <div style={emptyState}>No officials yet</div> : (
                  officials.map((o) => {
                    const s = getOfficialStats(o.id);
                    return (
                      <div key={o.id} style={{
                        padding: '16px', borderRadius: '12px',
                        background: '#f2f8f8', marginBottom: '12px', border: '1px solid #ddeaea',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <div>
                            <div style={{ fontWeight: '600', color: '#111', fontSize: '14px' }}>{o.fullName}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{o.position || 'Official'}</div>
                          </div>
                          <span style={statusBadge(o.status)}>{o.status}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                          {[
                            { label: 'Total', value: s.total, color: '#083030' },
                            { label: 'Approved', value: s.approved, color: '#10b981' },
                            { label: 'Rejected', value: s.rejected, color: '#ef4444' },
                            { label: 'Pending', value: s.pending, color: '#f59e0b' },
                          ].map((stat) => (
                            <div key={stat.label} style={{
                              textAlign: 'center', padding: '8px', borderRadius: '8px',
                              background: '#fff', border: '1px solid #ddeaea',
                            }}>
                              <div style={{ fontSize: '20px', fontWeight: '700', color: stat.color }}>{stat.value}</div>
                              <div style={{ fontSize: '10px', color: '#9ca3af' }}>{stat.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '600', color: '#111' }}>👥 Resident Activity</h3>
                {residents.length === 0 ? <div style={emptyState}>No residents yet</div> : (
                  residents.map((r) => {
                    const residentDocs = documents.filter((d) => d.residentId === r.id || d.residentEmail === r.email);
                    return (
                      <div key={r.id} style={{
                        padding: '14px 16px', borderRadius: '12px',
                        background: '#f2f8f8', marginBottom: '10px', border: '1px solid #ddeaea',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#111', fontSize: '14px' }}>{r.fullName}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>{r.email}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '22px', fontWeight: '700', color: '#083030' }}>{residentDocs.length}</div>
                          <div style={{ fontSize: '11px', color: '#9ca3af' }}>requests</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '600', color: '#111' }}>📊 System Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                  { label: 'Active Officials', value: officials.filter((o) => o.status === 'active').length, color: '#083030' },
                  { label: 'Active Residents', value: residents.filter((r) => r.status === 'active').length, color: '#10b981' },
                  { label: 'Docs This Month', value: documents.filter((d) => {
                    if (!d.createdAt?.toDate) return false;
                    const now = new Date(); const docDate = d.createdAt.toDate();
                    return docDate.getMonth() === now.getMonth() && docDate.getFullYear() === now.getFullYear();
                  }).length, color: '#0a5a5a' },
                  { label: 'Processing Rate', value: stats.totalDocs > 0 ? Math.round((stats.approvedDocs / stats.totalDocs) * 100) + '%' : '0%', color: '#10b981' },
                ].map((s) => (
                  <div key={s.label} style={{
                    padding: '20px', borderRadius: '12px', textAlign: 'center',
                    background: '#f2f8f8', border: '1px solid #ddeaea',
                  }}>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
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

// ─── Shared Styles ─────────────────────────────────────────────────────────
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
    status === 'pending' ? '#fffbeb' :
    status === 'rejected' || status === 'inactive' ? '#fef2f2' : '#f3f4f6',
  color:
    status === 'active' || status === 'approved' ? '#065f46' :
    status === 'pending' ? '#92400e' :
    status === 'rejected' || status === 'inactive' ? '#991b1b' : '#6b7280',
});