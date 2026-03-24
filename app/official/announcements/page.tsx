'use client';

import { useState } from 'react';

interface Announcement {
  id: number;
  activity: string;
  date: string;
  time: string;
  assemblyArea: string;
  details: string;
  issueDate: string;
  captain: string;
  secretary: string;
  councilor: string;
}

const defaultAnnouncements: Announcement[] = [
  {
    id: 1,
    activity: 'Clean-Up Drive',
    date: 'March 23, 2026',
    time: '6:00 AM',
    assemblyArea: 'Barangay Hall',
    details:
      'These help maintain cleanliness, prevent diseases, and promote unity and cooperation among residents.',
    issueDate: 'March 20, 2026',
    captain: 'Hon. Rolando C. Borja',
    secretary: 'Sec. Maria D. Santos',
    councilor: 'Coun. Jose L. Reyes',
  },
  {
    id: 2,
    activity: 'General Assembly',
    date: 'March 28, 2026',
    time: '9:00 AM',
    assemblyArea: 'Barangay Plaza',
    details:
      'This is a mandatory assembly for all residents to discuss community matters and upcoming barangay projects for the year.',
    issueDate: 'March 20, 2026',
    captain: 'Hon. Rolando C. Borja',
    secretary: 'Sec. Maria D. Santos',
    councilor: 'Coun. Jose L. Reyes',
  },
];

/* ─── Inline-editable field ─────────────────────────────────────── */
function EditableField({
  value,
  onChange,
  tag: Tag = 'span',
  className = '',
  style = {},
}: {
  value: string;
  onChange: (v: string) => void;
  tag?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <Tag
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onChange((e.currentTarget as HTMLElement).innerText.trim())}
      className={className}
      style={{
        outline: 'none',
        borderRadius: 2,
        cursor: 'text',
        ...style,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = '#f5f5f0';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        if (document.activeElement !== el) el.style.background = 'transparent';
      }}
      onFocus={(e) => {
        (e.currentTarget as HTMLElement).style.background = '#fffbcc';
        (e.currentTarget as HTMLElement).style.outline = '1.5px dashed #c8a200';
      }}
      onBlurCapture={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'transparent';
        (e.currentTarget as HTMLElement).style.outline = 'none';
      }}
    >
      {value}
    </Tag>
  );
}

/* ─── Document renderer ─────────────────────────────────────────── */
function AnnouncementDocument({
  ann,
  onChange,
}: {
  ann: Announcement;
  onChange: (updated: Announcement) => void;
}) {
  const field =
    (key: keyof Announcement) =>
    (val: string) =>
      onChange({ ...ann, [key]: val });

  return (
    <div
      style={{
        background: '#fff',
        color: '#111',
        maxWidth: 680,
        margin: '0 auto',
        padding: '56px 64px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
        fontFamily: '"Times New Roman", Times, serif',
        fontSize: 13.5,
        lineHeight: 1.75,
      }}
    >
      {/* ── Logo header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div style={logoCircle}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/santiago.jpg"
            alt="Barangay Santiago"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
              (e.currentTarget.parentElement as HTMLElement).innerHTML =
                '<span style="font-size:9px;font-weight:bold;text-align:center;color:#555;padding:4px;">Brgy.<br/>Santiago</span>';
            }}
          />
        </div>

        <div style={{ textAlign: 'center', flex: 1, padding: '0 16px' }}>
          <p style={{ fontSize: 13, lineHeight: 1.45 }}>Republic of the Philippines</p>
          <p style={{ fontSize: 13, lineHeight: 1.45 }}>Province of Zambales</p>
          <p style={{ fontSize: 13, lineHeight: 1.45 }}>Municipality of San Antonio</p>
          <p style={{ fontSize: 14, fontWeight: 'bold', marginTop: 2 }}>Barangay Santiago</p>
          <p style={{ fontSize: 11, marginTop: 2 }}>Office of the Barangay Captain</p>
        </div>

        <div style={logoCircle}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/saz.jpg"
            alt="San Antonio Zambales"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
              (e.currentTarget.parentElement as HTMLElement).innerHTML =
                '<span style="font-size:9px;font-weight:bold;text-align:center;color:#555;padding:4px;">San<br/>Antonio</span>';
            }}
          />
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1.5px solid #111', margin: '14px 0 20px' }} />

      {/* ── Date ── */}
      <div style={{ textAlign: 'right', marginBottom: 16, fontSize: 13 }}>
        <EditableField value={ann.issueDate} onChange={field('issueDate')} />
      </div>

      {/* ── To ── */}
      <p style={{ marginBottom: 16, fontSize: 13 }}>To our valued Barangay Captain,</p>

      {/* ── Subject ── */}
      <p style={{ marginBottom: 20, fontSize: 13 }}>
        <strong>RE: BARANGAY ACTIVITY ANNOUNCEMENT —{' '}</strong>
        <EditableField
          value={ann.activity.toUpperCase()}
          onChange={(v) => field('activity')(v)}
          style={{ fontWeight: 'bold' }}
        />
      </p>

      {/* ── Body ── */}
      <p style={bodyP}>Good day!</p>

      <p style={bodyP}>
        The Barangay Council of <strong>Barangay Santiago</strong>, Municipality of San Antonio,
        Province of Zambales, would like to formally inform all residents regarding the upcoming
        barangay activity: <strong><EditableField value={ann.activity} onChange={field('activity')} /></strong>.{' '}
        <EditableField value={ann.details} onChange={field('details')} />
      </p>

      <p style={bodyP}>
        In line with this, we are cordially inviting all residents to participate and attend the
        said activity. Your presence and cooperation are highly encouraged for the success of this
        undertaking.
      </p>

      <p style={{ ...bodyP, fontWeight: 'bold' }}>Details of the Activity:</p>

      {/* ── Details table ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, margin: '8px 0 16px' }}>
        <tbody>
          {(
            [
              ['Activity', 'activity'],
              ['Date', 'date'],
              ['Time', 'time'],
              ['Assembly Area', 'assemblyArea'],
            ] as [string, keyof Announcement][]
          ).map(([label, key]) => (
            <tr key={key}>
              <td style={{ fontWeight: 'bold', paddingRight: 16, paddingBottom: 4, whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                {label}:
              </td>
              <td style={{ paddingBottom: 4 }}>
                <EditableField value={ann[key] as string} onChange={field(key)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={bodyP}>
        We encourage everyone to actively participate in this activity for the benefit of our
        community. For inquiries, please visit the Barangay Hall or contact our office.
      </p>
      <p style={bodyP}>
        Thank you for your continued support and cooperation. Together, let us work for a cleaner,
        healthier, and more unified Barangay Santiago.
      </p>

      <p style={{ fontSize: 13, marginTop: 8 }}>Respectfully yours,</p>

      {/* ── Signatures ── */}
      <div style={{ display: 'flex', gap: 48, marginTop: 24 }}>
        <div>
          <p style={sigLabel}>Prepared by:</p>
          <EditableField value={ann.secretary} onChange={field('secretary')} style={sigName} />
          <p style={sigTitle}>Barangay Secretary</p>
        </div>
        <div>
          <p style={sigLabel}>Noted by:</p>
          <EditableField value={ann.councilor} onChange={field('councilor')} style={sigName} />
          <p style={sigTitle}>Barangay Councilor</p>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #ccc', marginTop: 20, paddingTop: 16 }}>
        <p style={sigLabel}>Approved by:</p>
        <EditableField value={ann.captain} onChange={field('captain')} style={sigName} />
        <p style={sigTitle}>Barangay Captain</p>
        <p style={sigTitle}>Barangay Santiago</p>
      </div>
    </div>
  );
}

/* ─── Style constants ────────────────────────────────────────────── */
const logoCircle: React.CSSProperties = {
  width: 72,
  height: 72,
  borderRadius: '50%',
  overflow: 'hidden',
  border: '1px solid #ccc',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#e8f0e8',
};
const bodyP: React.CSSProperties = { marginBottom: 12, fontSize: 13, textAlign: 'justify' };
const sigLabel: React.CSSProperties = { fontSize: 11, color: '#666', marginBottom: 2 };
const sigName: React.CSSProperties = { fontWeight: 'bold', fontSize: 13, display: 'block' };
const sigTitle: React.CSSProperties = { fontSize: 12 };

/* ─── Main page ─────────────────────────────────────────────────── */
export default function CreateAnnouncementPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(defaultAnnouncements);
  const [currentId, setCurrentId] = useState<number>(defaultAnnouncements[0].id);
  const [saveLabel, setSaveLabel] = useState('Save');

  const current = announcements.find((a) => a.id === currentId) ?? null;

  const updateAnn = (updated: Announcement) =>
    setAnnouncements((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));

  const addNew = () => {
    const newId = Date.now();
    const blank: Announcement = {
      id: newId,
      activity: 'New Activity',
      date: 'April 1, 2026',
      time: '8:00 AM',
      assemblyArea: 'Barangay Hall',
      details: 'This activity aims to promote the welfare of all residents.',
      issueDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      captain: 'Hon. Rolando C. Borja',
      secretary: 'Sec. Maria D. Santos',
      councilor: 'Coun. Jose L. Reyes',
    };
    setAnnouncements((prev) => [...prev, blank]);
    setCurrentId(newId);
  };

  const deleteAnn = () => {
    if (announcements.length === 1) return;
    const next = announcements.find((a) => a.id !== currentId)!;
    setAnnouncements((prev) => prev.filter((a) => a.id !== currentId));
    setCurrentId(next.id);
  };

  const handleSave = () => {
    setSaveLabel('Saved!');
    setTimeout(() => setSaveLabel('Save'), 1500);
    // TODO: wire up to your API/backend here
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-sans, sans-serif)' }}>
      {/* ── Sidebar ── */}
      <aside
        style={{
          width: 240,
          minWidth: 240,
          borderRight: '0.5px solid #e2e2e2',
          background: '#f8f8f6',
          padding: '20px 0',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 16px 12px' }}>
          Announcements
        </p>

        {announcements.map((a) => (
          <div
            key={a.id}
            onClick={() => setCurrentId(a.id)}
            style={{
              padding: '10px 16px',
              cursor: 'pointer',
              borderLeft: a.id === currentId ? '2px solid #185FA5' : '2px solid transparent',
              background: a.id === currentId ? '#fff' : 'transparent',
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 500, color: '#111', margin: 0 }}>{a.activity}</p>
            <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0' }}>{a.date}</p>
          </div>
        ))}

        <button
          onClick={addNew}
          style={{
            margin: '16px 16px 0',
            padding: '8px 0',
            fontSize: 13,
            background: '#185FA5',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          + New Announcement
        </button>
      </aside>

      {/* ── Document area ── */}
      <main style={{ flex: 1, background: '#f0ede8', padding: 24, overflowY: 'auto' }}>
        {/* Hint */}
        <p style={{ textAlign: 'center', fontSize: 11, color: '#999', marginBottom: 10 }}>
          Click any text in the document to edit it directly
        </p>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', maxWidth: 680, margin: '0 auto 12px' }}>
          <button onClick={handleSave} style={tbtn}>{saveLabel}</button>
          <button onClick={deleteAnn} style={{ ...tbtn, color: '#A32D2D', borderColor: '#F09595' }}>
            Delete
          </button>
        </div>

        {current && (
          <AnnouncementDocument ann={current} onChange={updateAnn} />
        )}
      </main>
    </div>
  );
}

const tbtn: React.CSSProperties = {
  fontSize: 12,
  padding: '5px 14px',
  border: '0.5px solid #ccc',
  background: '#fff',
  color: '#111',
  borderRadius: 6,
  cursor: 'pointer',
  fontFamily: 'inherit',
};