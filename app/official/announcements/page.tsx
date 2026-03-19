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
import { Plus, Trash2, Edit2, Megaphone } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = 'Event' | 'Meeting' | 'Maintenance' | 'Alert';
type Priority = 'low' | 'medium' | 'high';

type Announcement = {
  id: string;
  title: string;
  content: string;
  category: Category;
  priority: Priority;
  date: string;
  author?: string;
};

type FormData = {
  title: string;
  content: string;
  category: Category;
  priority: Priority;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = ['Event', 'Meeting', 'Maintenance', 'Alert'];
const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

const CATEGORY_COLORS: Record<Category, string> = {
  Event: 'bg-blue-100 text-blue-700 border-blue-200',
  Meeting: 'bg-purple-100 text-purple-700 border-purple-200',
  Maintenance: 'bg-orange-100 text-orange-700 border-orange-200',
  Alert: 'bg-red-100 text-red-700 border-red-200',
};

const PRIORITY_COLORS: Record<Priority, string> = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-green-100 text-green-700 border-green-200',
};

const PRIORITY_DOT: Record<Priority, string> = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

const emptyForm = (): FormData => ({
  title: '',
  content: '',
  category: 'Event',
  priority: 'medium',
});

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(data: FormData): FormErrors {
  const errs: FormErrors = {};
  if (!data.title.trim()) errs.title = 'Title is required.';
  if (!data.content.trim()) errs.content = 'Content is required.';
  return errs;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OfficialAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm());
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);

  // ── Field helper ──
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
  const openEdit = (ann: Announcement) => {
    setFormData({
      title: ann.title,
      content: ann.content,
      category: ann.category,
      priority: ann.priority,
    });
    setFormErrors({});
    setEditingId(ann.id);
    setShowModal(true);
  };

  // ── Submit ──
  const handleSubmit = () => {
    const errs = validate(formData);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    const today = new Date().toISOString().split('T')[0];
    if (editingId) {
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === editingId ? { ...a, ...formData, date: today } : a
        )
      );
    } else {
      setAnnouncements((prev) => [
        {
          id: `ANN-${Date.now()}`,
          ...formData,
          date: today,
          author: 'Current Official',
        },
        ...prev,
      ]);
    }
    setShowModal(false);
  };

  // ── Delete ──
  const handleDelete = () => {
    if (!deleteTarget) return;
    setAnnouncements((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <>
      <PortalHeader
        title="Announcements"
        description="Create and manage community announcements"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* ── Top bar ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {announcements.length} announcement{announcements.length !== 1 ? 's' : ''} posted
          </p>
          <Button onClick={openCreate} className="w-full gap-2 sm:w-auto">
            <Plus className="h-4 w-4" />
            Post Announcement
          </Button>
        </div>

        {/* ── Empty state ── */}
        {announcements.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <Megaphone className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">No announcements yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Click &quot;Post Announcement&quot; to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          /* ── Announcements list ── */
          <div className="space-y-3">
            {announcements.map((ann) => (
              <Card
                key={ann.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: icon + content */}
                    <div className="flex gap-3 min-w-0 flex-1">
                      {/* Priority dot indicator */}
                      <div className="mt-1.5 shrink-0">
                        <span
                          className={`block h-2.5 w-2.5 rounded-full ${PRIORITY_DOT[ann.priority]}`}
                          title={`${ann.priority} priority`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground truncate">{ann.title}</h3>

                        {/* Badges */}
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[ann.category]}`}
                          >
                            {ann.category}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${PRIORITY_COLORS[ann.priority]}`}
                          >
                            {ann.priority}
                          </span>
                          <span className="text-xs text-muted-foreground">{ann.date}</span>
                        </div>

                        {/* Content */}
                        <p className="mt-2.5 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                          {ann.content}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => openEdit(ann)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(ann)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Megaphone className="h-4 w-4 text-primary" />
              </div>
              {editingId ? 'Edit Announcement' : 'Post New Announcement'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Update the announcement details below.'
                : 'Fill in the details to post a new community announcement.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Title */}
            <div className="grid gap-1.5">
              <Label htmlFor="ann-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ann-title"
                value={formData.title}
                onChange={(e) => setField('title', e.target.value)}
                placeholder="Enter announcement title..."
              />
              {formErrors.title && (
                <p className="text-xs text-destructive">{formErrors.title}</p>
              )}
            </div>

            {/* Content */}
            <div className="grid gap-1.5">
              <Label htmlFor="ann-content">
                Content <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="ann-content"
                value={formData.content}
                onChange={(e) => setField('content', e.target.value)}
                placeholder="Write your announcement here..."
                rows={4}
                className="resize-none"
              />
              {formErrors.content && (
                <p className="text-xs text-destructive">{formErrors.content}</p>
              )}
            </div>

            {/* Category + Priority — stack on mobile */}
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
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) => setField('priority', v as Priority)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                  <Megaphone className="mr-1.5 h-4 w-4" />
                  Post Announcement
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
            <AlertDialogTitle>Delete Announcement?</AlertDialogTitle>
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