'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Plus, Trash2, Edit2, Calendar, MapPin, Users, FolderOpen } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = 'Health' | 'Livelihood' | 'Sports' | 'Environment' | 'Education';

type Program = {
  id: string;
  title: string;
  description: string;
  category: Category;
  date: string;
  location?: string;
  attendees?: number;
};

type FormData = {
  title: string;
  description: string;
  category: Category;
  date: string;
  location: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = ['Health', 'Livelihood', 'Sports', 'Environment', 'Education'];

const CATEGORY_COLORS: Record<Category, string> = {
  Health: 'bg-rose-100 text-rose-700 border-rose-200',
  Livelihood: 'bg-amber-100 text-amber-700 border-amber-200',
  Sports: 'bg-blue-100 text-blue-700 border-blue-200',
  Environment: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Education: 'bg-purple-100 text-purple-700 border-purple-200',
};

const emptyForm = (): FormData => ({
  title: '',
  description: '',
  category: 'Health',
  date: '',
  location: '',
});

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(data: FormData): FormErrors {
  const errs: FormErrors = {};
  if (!data.title.trim()) errs.title = 'Title is required.';
  if (!data.description.trim()) errs.description = 'Description is required.';
  if (!data.date.trim()) errs.date = 'Date/Schedule is required.';
  return errs;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OfficialProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm());
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [deleteTarget, setDeleteTarget] = useState<Program | null>(null);

  // ── Field helpers ──
  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) {
      setFormErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
    }
  };

  // ── Open create ──
  const openCreate = () => {
    setFormData(emptyForm());
    setFormErrors({});
    setEditingId(null);
    setShowModal(true);
  };

  // ── Open edit ──
  const openEdit = (program: Program) => {
    setFormData({
      title: program.title,
      description: program.description,
      category: program.category,
      date: program.date,
      location: program.location ?? '',
    });
    setFormErrors({});
    setEditingId(program.id);
    setShowModal(true);
  };

  // ── Submit ──
  const handleSubmit = () => {
    const errs = validate(formData);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    if (editingId) {
      setPrograms((prev) =>
        prev.map((p) => (p.id === editingId ? { ...p, ...formData } : p))
      );
    } else {
      setPrograms((prev) => [
        { id: `PROG-${Date.now()}`, ...formData, attendees: 0 },
        ...prev,
      ]);
    }
    setShowModal(false);
  };

  // ── Delete ──
  const handleDelete = () => {
    if (!deleteTarget) return;
    setPrograms((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <>
      <PortalHeader
        title="Programs Management"
        description="Create and manage community programs and events"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* ── Top bar ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {programs.length} program{programs.length !== 1 ? 's' : ''} registered
          </p>
          <Button onClick={openCreate} className="w-full gap-2 sm:w-auto">
            <Plus className="h-4 w-4" />
            Create Program
          </Button>
        </div>

        {/* ── Empty state ── */}
        {programs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <FolderOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">No programs yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Click &quot;Create Program&quot; to add your first community program.
              </p>
            </CardContent>
          </Card>
        ) : (
          /* ── Programs grid ── */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {programs.map((program) => (
              <Card
                key={program.id}
                className="flex flex-col overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardContent className="flex flex-1 flex-col p-5 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground leading-snug flex-1 min-w-0">
                      {program.title}
                    </h3>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => openEdit(program)}
                        className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(program)}
                        className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Category badge */}
                  <span
                    className={`inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[program.category as Category]}`}
                  >
                    {program.category}
                  </span>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                    {program.description}
                  </p>

                  {/* Meta */}
                  <div className="space-y-1.5 pt-1 border-t">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="truncate">{program.date}</span>
                    </div>
                    {program.location && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="truncate">{program.location}</span>
                      </div>
                    )}
                    {program.attendees !== undefined && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span>{program.attendees} attendees</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={showModal} onOpenChange={(open) => !open && setShowModal(false)}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Program' : 'Create New Program'}</DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Update the program details below.'
                : 'Fill in the details to create a new community program.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Title */}
            <div className="grid gap-1.5">
              <Label htmlFor="prog-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="prog-title"
                value={formData.title}
                onChange={(e) => setField('title', e.target.value)}
                placeholder="e.g., Free Medical Mission"
              />
              {formErrors.title && (
                <p className="text-xs text-destructive">{formErrors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="grid gap-1.5">
              <Label htmlFor="prog-desc">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="prog-desc"
                value={formData.description}
                onChange={(e) => setField('description', e.target.value)}
                placeholder="Briefly describe the program..."
                rows={3}
                className="resize-none"
              />
              {formErrors.description && (
                <p className="text-xs text-destructive">{formErrors.description}</p>
              )}
            </div>

            {/* Category + Date — stack on mobile */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setField('category', v as Category)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="prog-date">
                  Date / Schedule <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="prog-date"
                  value={formData.date}
                  onChange={(e) => setField('date', e.target.value)}
                  placeholder="e.g., March 25–29, 2026"
                />
                {formErrors.date && (
                  <p className="text-xs text-destructive">{formErrors.date}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="grid gap-1.5">
              <Label htmlFor="prog-loc">Location</Label>
              <Input
                id="prog-loc"
                value={formData.location}
                onChange={(e) => setField('location', e.target.value)}
                placeholder="e.g., Barangay Covered Court"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button className="w-full sm:w-auto" onClick={handleSubmit}>
              {editingId ? (
                <>
                  <Edit2 className="mr-1.5 h-4 w-4" />
                  Save Changes
                </>
              ) : (
                <>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Create Program
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="w-[95vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Program?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{' '}
              <span className="font-semibold">{deleteTarget?.title}</span>. This action cannot
              be undone.
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