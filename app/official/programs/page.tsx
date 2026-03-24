'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PortalHeader } from '@/components/portal/header';
import { Plus, Trash2, FolderOpen } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = 'Health' | 'Livelihood' | 'Sports' | 'Environment' | 'Education';

type Program = {
  id: string;
  title: string;
  description: string;
  category: Category;
  date: string;
  location: string;
  venue: string;
  coordinator: string;
  budget: string;
  beneficiaries: string;
  objectives: string;
  issueDate: string;
  captain: string;
  secretary: string;
  councilor: string;
};

type FormData = Omit<Program, 'id'>;
type FormErrors = Partial<Record<keyof FormData, string>>;

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = ['Health', 'Livelihood', 'Sports', 'Environment', 'Education'];

const CATEGORY_COLORS: Record<Category, { bg: string; text: string; border: string }> = {
  Health:      { bg: '#fff0f0', text: '#b91c1c', border: '#fca5a5' },
  Livelihood:  { bg: '#fffbeb', text: '#b45309', border: '#fcd34d' },
  Sports:      { bg: '#eff6ff', text: '#1d4ed8', border: '#93c5fd' },
  Environment: { bg: '#f0fdf4', text: '#15803d', border: '#86efac' },
  Education:   { bg: '#faf5ff', text: '#7e22ce', border: '#d8b4fe' },
};

const emptyForm = (): FormData => ({
  title: '',
  description: '',
  category: 'Health',
  date: '',
  location: '',
  venue: '',
  coordinator: '',
  budget: '',
  beneficiaries: '',
  objectives: '',
  issueDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  captain: 'Hon. Rolando C. Borja',
  secretary: 'Sec. Maria D. Santos',
  councilor: 'Coun. Jose L. Reyes',
});

function validate(data: FormData): FormErrors {
  const errs: FormErrors = {};
  if (!data.title.trim()) errs.title = 'Title is required.';
  if (!data.description.trim()) errs.description = 'Description is required.';
  if (!data.date.trim()) errs.date = 'Date is required.';
  return errs;
}

// ─── Inline-editable field ────────────────────────────────────────────────────

function EditableField({
  value,
  onChange,
  tag: Tag = 'span',
  style = {},
}: {
  value: string;
  onChange: (v: string) => void;
  tag?: keyof JSX.IntrinsicElements;
  style?: React.CSSProperties;
}) {
  return (
    <Tag
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onChange((e.currentTarget as HTMLElement).innerText.trim())}
      style={{ outline: 'none', borderRadius: 2, cursor: 'text', ...style }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f5f5f0'; }}
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

// ─── Program Document ─────────────────────────────────────────────────────────

function ProgramDocument({
  prog,
  onChange,
}: {
  prog: Program;
  onChange: (updated: Program) => void;
}) {
  const field = (key: keyof Program) => (val: string) => onChange({ ...prog, [key]: val });
  const cat = CATEGORY_COLORS[prog.category];

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

      {/* ── Category badge ── */}
      <div style={{ marginBottom: 16 }}>
        <span
          style={{
            display: 'inline-block',
            background: cat.bg,
            color: cat.text,
            border: `1px solid ${cat.border}`,
            borderRadius: 99,
            padding: '2px 14px',
            fontSize: 11,
            fontFamily: 'sans-serif',
            fontWeight: 600,
            letterSpacing: '0.04em',
          }}
        >
          {prog.category}
        </span>
      </div>

      {/* ── Date ── */}
      <div style={{ textAlign: 'right', marginBottom: 16, fontSize: 13 }}>
        <EditableField value={prog.issueDate} onChange={field('issueDate')} />
      </div>

      {/* ── Subject ── */}
      <p style={{ marginBottom: 20, fontSize: 13 }}>
        <strong>RE: BARANGAY PROGRAM — </strong>
        <EditableField
          value={prog.title.toUpperCase()}
          onChange={(v) => field('title')(v)}
          style={{ fontWeight: 'bold' }}
        />
      </p>

      {/* ── Body ── */}
      <p style={bodyP}>Good day!</p>
      <p style={bodyP}>
        The Barangay Council of <strong>Barangay Santiago</strong>, Municipality of San Antonio,
        Province of Zambales, is pleased to present the following community program:{' '}
        <strong><EditableField value={prog.title} onChange={field('title')} /></strong>.
      </p>

      <p style={bodyP}>
        <EditableField value={prog.description} onChange={field('description')} />
      </p>

      {prog.objectives && (
        <p style={bodyP}>
          <strong>Program Objectives: </strong>
          <EditableField value={prog.objectives} onChange={field('objectives')} />
        </p>
      )}

      <p style={{ ...bodyP, fontWeight: 'bold' }}>Program Details:</p>

      {/* ── Details table ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, margin: '8px 0 16px' }}>
        <tbody>
          {(
            [
              ['Program Title', 'title'],
              ['Category', 'category'],
              ['Date / Schedule', 'date'],
              ['Location', 'location'],
              ['Venue', 'venue'],
              ['Coordinator', 'coordinator'],
              ['Target Beneficiaries', 'beneficiaries'],
              ['Estimated Budget', 'budget'],
            ] as [string, keyof Program][]
          )
            .filter(([, key]) => prog[key])
            .map(([label, key]) => (
              <tr key={key}>
                <td style={{ fontWeight: 'bold', paddingRight: 16, paddingBottom: 4, whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                  {label}:
                </td>
                <td style={{ paddingBottom: 4 }}>
                  <EditableField value={prog[key] as string} onChange={field(key)} />
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      <p style={bodyP}>
        We respectfully request the support and active participation of all residents in this
        program. For inquiries, please visit the Barangay Hall or contact our office.
      </p>
      <p style={bodyP}>
        Thank you for your continued support and cooperation. Together, let us work for a
        progressive and united Barangay Santiago.
      </p>

      <p style={{ fontSize: 13, marginTop: 8 }}>Respectfully yours,</p>

      {/* ── Signatures ── */}
      <div style={{ display: 'flex', gap: 48, marginTop: 24 }}>
        <div>
          <p style={sigLabel}>Prepared by:</p>
          <EditableField value={prog.secretary} onChange={field('secretary')} style={sigName} />
          <p style={sigTitle}>Barangay Secretary</p>
        </div>
        <div>
          <p style={sigLabel}>Noted by:</p>
          <EditableField value={prog.councilor} onChange={field('councilor')} style={sigName} />
          <p style={sigTitle}>Barangay Councilor</p>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #ccc', marginTop: 20, paddingTop: 16 }}>
        <p style={sigLabel}>Approved by:</p>
        <EditableField value={prog.captain} onChange={field('captain')} style={sigName} />
        <p style={sigTitle}>Barangay Captain</p>
        <p style={sigTitle}>Barangay Santiago</p>
      </div>
    </div>
  );
}

// ─── Style constants ──────────────────────────────────────────────────────────

const logoCircle: React.CSSProperties = {
  width: 72, height: 72, borderRadius: '50%', overflow: 'hidden',
  border: '1px solid #ccc', flexShrink: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e8f0e8',
};
const bodyP: React.CSSProperties = { marginBottom: 12, fontSize: 13, textAlign: 'justify' };
const sigLabel: React.CSSProperties = { fontSize: 11, color: '#666', marginBottom: 2 };
const sigName: React.CSSProperties = { fontWeight: 'bold', fontSize: 13, display: 'block' };
const sigTitle: React.CSSProperties = { fontSize: 12 };
const tbtn: React.CSSProperties = {
  fontSize: 12, padding: '5px 14px',
  border: '0.5px solid #ccc', background: '#fff', color: '#111',
  borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit',
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OfficialProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>(emptyForm());
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [deleteTarget, setDeleteTarget] = useState<Program | null>(null);
  const [saveLabel, setSaveLabel] = useState('Save');

  const current = programs.find((p) => p.id === currentId) ?? null;

  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) setFormErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  const handleCreate = () => {
    const errs = validate(formData);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    const newId = `PROG-${Date.now()}`;
    const newProg: Program = { id: newId, ...formData };
    setPrograms((prev) => [newProg, ...prev]);
    setCurrentId(newId);
    setShowForm(false);
    setFormData(emptyForm());
    setFormErrors({});
  };

  const updateProg = (updated: Program) =>
    setPrograms((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

  const handleDelete = () => {
    if (!deleteTarget) return;
    const remaining = programs.filter((p) => p.id !== deleteTarget.id);
    setPrograms(remaining);
    setCurrentId(remaining.length ? remaining[0].id : null);
    setDeleteTarget(null);
  };

  const handleSave = () => {
    setSaveLabel('Saved!');
    setTimeout(() => setSaveLabel('Save'), 1500);
  };

  return (
    <>
      <PortalHeader
        title="Programs Management"
        description="Create and manage community programs and events"
      />

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)', fontFamily: 'var(--font-sans, sans-serif)' }}>

        {/* ── Sidebar ── */}
        <aside style={{
          width: 240, minWidth: 240,
          borderRight: '0.5px solid #e2e2e2',
          background: '#f8f8f6',
          padding: '20px 0',
          display: 'flex', flexDirection: 'column',
        }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 16px 12px' }}>
            Programs ({programs.length})
          </p>

          {programs.length === 0 && (
            <p style={{ fontSize: 12, color: '#aaa', padding: '8px 16px' }}>No programs yet.</p>
          )}

          {programs.map((p) => {
            const cat = CATEGORY_COLORS[p.category];
            return (
              <div
                key={p.id}
                onClick={() => setCurrentId(p.id)}
                style={{
                  padding: '10px 16px',
                  cursor: 'pointer',
                  borderLeft: p.id === currentId ? '2px solid #185FA5' : '2px solid transparent',
                  background: p.id === currentId ? '#fff' : 'transparent',
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 500, color: '#111', margin: 0 }}>{p.title}</p>
                <span style={{
                  display: 'inline-block', marginTop: 4,
                  background: cat.bg, color: cat.text,
                  border: `1px solid ${cat.border}`,
                  borderRadius: 99, padding: '1px 8px',
                  fontSize: 10, fontWeight: 600,
                }}>
                  {p.category}
                </span>
                <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0' }}>{p.date}</p>
              </div>
            );
          })}

          <button
            onClick={() => { setFormData(emptyForm()); setFormErrors({}); setShowForm(true); }}
            style={{
              margin: '16px 16px 0', padding: '8px 0', fontSize: 13,
              background: '#185FA5', color: '#fff', border: 'none',
              borderRadius: 6, cursor: 'pointer',
            }}
          >
            + New Program
          </button>
        </aside>

        {/* ── Main area ── */}
        <main style={{ flex: 1, background: '#f0ede8', padding: 24, overflowY: 'auto' }}>

          {/* Create form panel */}
          {showForm && (
            <div style={{
              background: '#fff', maxWidth: 680, margin: '0 auto 24px',
              borderRadius: 8, padding: '24px 28px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              fontFamily: 'var(--font-sans, sans-serif)',
            }}>
              <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>New Program</p>
              <div style={{ display: 'grid', gap: 12 }}>
                <div>
                  <Label htmlFor="p-title">Title *</Label>
                  <Input id="p-title" value={formData.title} onChange={(e) => setField('title', e.target.value)} placeholder="e.g., Free Medical Mission" className="mt-1" />
                  {formErrors.title && <p style={{ fontSize: 11, color: '#b91c1c', marginTop: 2 }}>{formErrors.title}</p>}
                </div>
                <div>
                  <Label htmlFor="p-desc">Description *</Label>
                  <Textarea id="p-desc" value={formData.description} onChange={(e) => setField('description', e.target.value)} rows={3} className="mt-1 resize-none" placeholder="Briefly describe the program..." />
                  {formErrors.description && <p style={{ fontSize: 11, color: '#b91c1c', marginTop: 2 }}>{formErrors.description}</p>}
                </div>
                <div>
                  <Label htmlFor="p-objectives">Objectives</Label>
                  <Textarea id="p-objectives" value={formData.objectives} onChange={(e) => setField('objectives', e.target.value)} rows={2} className="mt-1 resize-none" placeholder="Program goals and objectives..." />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <Label>Category</Label>
                    <Select value={formData.category} onValueChange={(v) => setField('category', v as Category)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="p-date">Date / Schedule *</Label>
                    <Input id="p-date" value={formData.date} onChange={(e) => setField('date', e.target.value)} placeholder="e.g., March 25, 2026" className="mt-1" />
                    {formErrors.date && <p style={{ fontSize: 11, color: '#b91c1c', marginTop: 2 }}>{formErrors.date}</p>}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <Label htmlFor="p-location">Location</Label>
                    <Input id="p-location" value={formData.location} onChange={(e) => setField('location', e.target.value)} placeholder="e.g., Barangay Hall" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="p-venue">Venue</Label>
                    <Input id="p-venue" value={formData.venue} onChange={(e) => setField('venue', e.target.value)} placeholder="e.g., Covered Court" className="mt-1" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <Label htmlFor="p-coordinator">Coordinator</Label>
                    <Input id="p-coordinator" value={formData.coordinator} onChange={(e) => setField('coordinator', e.target.value)} placeholder="e.g., Hon. Juan dela Cruz" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="p-budget">Estimated Budget</Label>
                    <Input id="p-budget" value={formData.budget} onChange={(e) => setField('budget', e.target.value)} placeholder="e.g., ₱50,000.00" className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="p-beneficiaries">Target Beneficiaries</Label>
                  <Input id="p-beneficiaries" value={formData.beneficiaries} onChange={(e) => setField('beneficiaries', e.target.value)} placeholder="e.g., All residents of Barangay Santiago" className="mt-1" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button onClick={handleCreate}><Plus className="mr-1.5 h-4 w-4" />Create Program</Button>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!showForm && !current && (
            <div style={{ maxWidth: 680, margin: '0 auto' }}>
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 rounded-full bg-muted p-4">
                    <FolderOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-foreground">No programs yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Click &quot;+ New Program&quot; in the sidebar to get started.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Document view */}
          {current && !showForm && (
            <>
              <p style={{ textAlign: 'center', fontSize: 11, color: '#999', marginBottom: 10, fontFamily: 'var(--font-sans)' }}>
                Click any text in the document to edit it directly
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', maxWidth: 680, margin: '0 auto 12px', fontFamily: 'var(--font-sans)' }}>
                <button onClick={handleSave} style={tbtn}>{saveLabel}</button>
                <button onClick={() => setDeleteTarget(current)} style={{ ...tbtn, color: '#A32D2D', borderColor: '#F09595' }}>Delete</button>
              </div>
              <ProgramDocument prog={current} onChange={updateProg} />
            </>
          )}
        </main>
      </div>

      {/* ── Delete Confirm ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="w-[95vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Program?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{' '}
              <span className="font-semibold">{deleteTarget?.title}</span>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:w-auto"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}