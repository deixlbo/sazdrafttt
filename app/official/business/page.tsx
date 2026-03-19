'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  useBusinesses,
  addDocument,
  updateDocument,
  deleteDocument,
  addAuditLog,
  formatTimestamp,
} from '@/lib/firebase-hooks';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  Edit2,
  Building2,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Ban,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const BUSINESS_TYPES = [
  'Retail (Sari-Sari Store)',
  'Food & Beverage',
  'Services',
  'Manufacturing',
  'Agriculture',
  'Transportation',
  'Construction',
  'Other',
];

const STATUS_OPTIONS = ['pending', 'active', 'expired', 'revoked'];
const FILTER_OPTIONS = ['all', 'active', 'pending', 'expired', 'revoked'];

type BusinessStatus = 'pending' | 'active' | 'expired' | 'revoked';

const STATUS_BADGE: Record<BusinessStatus, string> = {
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  expired: 'bg-red-100 text-red-700 border-red-200',
  revoked: 'bg-gray-100 text-gray-600 border-gray-200',
};

const STATUS_ICON: Record<BusinessStatus, React.ReactNode> = {
  active: <CheckCircle2 className="h-3.5 w-3.5" />,
  pending: <Clock className="h-3.5 w-3.5" />,
  expired: <XCircle className="h-3.5 w-3.5" />,
  revoked: <Ban className="h-3.5 w-3.5" />,
};

// ─── Types ────────────────────────────────────────────────────────────────────

type FormData = {
  businessName: string;
  ownerName: string;
  type: string;
  address: string;
  permitNumber: string;
  status: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const emptyForm = (): FormData => ({
  businessName: '',
  ownerName: '',
  type: '',
  address: '',
  permitNumber: '',
  status: 'pending',
});

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(data: FormData): FormErrors {
  const errs: FormErrors = {};
  if (!data.businessName.trim()) errs.businessName = 'Business name is required.';
  if (!data.ownerName.trim()) errs.ownerName = 'Owner name is required.';
  if (!data.type) errs.type = 'Business type is required.';
  if (!data.address.trim()) errs.address = 'Address is required.';
  return errs;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BusinessPage() {
  const { data: businesses, loading } = useBusinesses();
  const { user, userData } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewBusiness, setViewBusiness] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm());
  const [formErrors, setFormErrors] = useState<FormErrors>({});

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
  const openEdit = (business: any) => {
    setFormData({
      businessName: business.businessName,
      ownerName: business.ownerName,
      type: business.type,
      address: business.address,
      permitNumber: business.permitNumber || '',
      status: business.status,
    });
    setFormErrors({});
    setEditingId(business.id);
    setShowModal(true);
  };

  // ── Submit ──
  const handleSubmit = async () => {
    const errs = validate(formData);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    try {
      if (editingId) {
        await updateDocument('businesses', editingId, formData);
        await addAuditLog({
          userId: user?.uid || '',
          userName: userData?.fullName || '',
          userRole: 'official',
          action: 'Updated business record',
          module: 'Business',
          details: `Updated ${formData.businessName}`,
        });
        toast.success('Business updated');
      } else {
        await addDocument('businesses', { ...formData, ownerId: '' });
        await addAuditLog({
          userId: user?.uid || '',
          userName: userData?.fullName || '',
          userRole: 'official',
          action: 'Added business record',
          module: 'Business',
          details: `Added ${formData.businessName}`,
        });
        toast.success('Business added');
      }
      setShowModal(false);
    } catch {
      toast.error('Failed to save business');
    }
  };

  // ── Delete ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDocument('businesses', deleteTarget.id);
      if (viewBusiness?.id === deleteTarget.id) setViewBusiness(null);
      toast.success('Business deleted');
    } catch {
      toast.error('Failed to delete business');
    }
    setDeleteTarget(null);
  };

  // ── Filtering ──
  const filteredBusinesses = businesses
    .filter((b: any) => statusFilter === 'all' || b.status === statusFilter)
    .filter(
      (b: any) =>
        b.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.ownerName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const stats = {
    total: businesses.length,
    active: businesses.filter((b: any) => b.status === 'active').length,
    pending: businesses.filter((b: any) => b.status === 'pending').length,
    expired: businesses.filter((b: any) => b.status === 'expired').length,
  };

  if (loading) {
    return (
      <>
        <PortalHeader title="Business Management" description="Manage registered businesses and permits" />
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <PortalHeader
        title="Business Management"
        description="Manage registered businesses and permits"
      />

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* ── Stats ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total', value: stats.total, icon: Building2, cls: 'text-foreground bg-muted' },
            { label: 'Active', value: stats.active, icon: CheckCircle2, cls: 'text-emerald-700 bg-emerald-50' },
            { label: 'Pending', value: stats.pending, icon: Clock, cls: 'text-amber-700 bg-amber-50' },
            { label: 'Expired', value: stats.expired, icon: XCircle, cls: 'text-red-700 bg-red-50' },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className={`flex items-center gap-3 p-4 rounded-lg ${s.cls}`}>
                <s.icon className="h-5 w-5 shrink-0" />
                <div>
                  <p className="text-xs font-medium opacity-75">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Table Card ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Registered Businesses</CardTitle>
            <CardDescription>All barangay-registered businesses and permit records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Controls */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Search */}
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search businesses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={openCreate} className="w-full gap-2 sm:w-auto">
                <Plus className="h-4 w-4" />
                Add Business
              </Button>
            </div>

            {/* Status filter tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {FILTER_OPTIONS.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                    statusFilter === status
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* ── Desktop Table ── */}
            <div className="hidden md:block rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Permit #</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBusinesses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                        {businesses.length === 0
                          ? 'No businesses yet. Click "Add Business" to get started.'
                          : 'No businesses match your search or filter.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBusinesses.map((business: any) => (
                      <TableRow key={business.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="font-medium truncate max-w-[140px]">{business.businessName}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{business.ownerName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate">
                          {business.type}
                        </TableCell>
                        <TableCell className="text-sm font-mono text-muted-foreground">
                          {business.permitNumber || '—'}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
                              STATUS_BADGE[business.status as BusinessStatus] ?? 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {STATUS_ICON[business.status as BusinessStatus]}
                            {business.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatTimestamp(business.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              title="View"
                              onClick={() => setViewBusiness(business)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Edit"
                              onClick={() => openEdit(business)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Delete"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(business)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* ── Mobile Cards ── */}
            <div className="md:hidden space-y-3">
              {filteredBusinesses.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  {businesses.length === 0
                    ? 'No businesses yet. Click "Add Business" to get started.'
                    : 'No businesses match your search or filter.'}
                </p>
              ) : (
                filteredBusinesses.map((business: any) => (
                  <div key={business.id} className="rounded-lg border bg-card p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{business.businessName}</p>
                        <p className="text-sm text-muted-foreground">{business.ownerName}</p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
                          STATUS_BADGE[business.status as BusinessStatus] ?? 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {STATUS_ICON[business.status as BusinessStatus]}
                        {business.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p className="truncate">🏪 {business.type}</p>
                      <p className="truncate">📍 {business.address}</p>
                      {business.permitNumber && <p>🪪 {business.permitNumber}</p>}
                    </div>
                    <div className="flex items-center gap-1 border-t pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 gap-1.5 text-xs"
                        onClick={() => setViewBusiness(business)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 gap-1.5 text-xs"
                        onClick={() => openEdit(business)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 gap-1.5 text-xs text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(business)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── View Dialog ── */}
      <Dialog open={!!viewBusiness} onOpenChange={(open) => !open && setViewBusiness(null)}>
        <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </div>
              Business Details
            </DialogTitle>
            <DialogDescription>Full information for this business record</DialogDescription>
          </DialogHeader>
          {viewBusiness && (
            <div className="space-y-4">
              <div className="grid gap-3 text-sm">
                {[
                  ['Business Name', viewBusiness.businessName],
                  ['Owner', viewBusiness.ownerName],
                  ['Type', viewBusiness.type],
                  ['Address', viewBusiness.address],
                  ['Permit #', viewBusiness.permitNumber || '—'],
                  ['Date Added', formatTimestamp(viewBusiness.createdAt)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex flex-col gap-0.5 border-b pb-2 sm:flex-row sm:justify-between sm:items-start"
                  >
                    <span className="text-muted-foreground shrink-0">{label}</span>
                    <span className="font-medium sm:text-right sm:max-w-[60%] break-words">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
                      STATUS_BADGE[viewBusiness.status as BusinessStatus] ?? 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {STATUS_ICON[viewBusiness.status as BusinessStatus]}
                    {viewBusiness.status}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => { openEdit(viewBusiness); setViewBusiness(null); }}
                >
                  <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => { setDeleteTarget(viewBusiness); setViewBusiness(null); }}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={showModal} onOpenChange={(open) => !open && setShowModal(false)}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Business' : 'Add Business'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update the business record details.' : 'Fill in the details to register a new business.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Business Name */}
            <div className="grid gap-1.5">
              <Label htmlFor="biz-name">
                Business Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="biz-name"
                value={formData.businessName}
                onChange={(e) => setField('businessName', e.target.value)}
                placeholder="Enter business name"
              />
              {formErrors.businessName && (
                <p className="text-xs text-destructive">{formErrors.businessName}</p>
              )}
            </div>

            {/* Owner Name */}
            <div className="grid gap-1.5">
              <Label htmlFor="biz-owner">
                Owner Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="biz-owner"
                value={formData.ownerName}
                onChange={(e) => setField('ownerName', e.target.value)}
                placeholder="Enter owner name"
              />
              {formErrors.ownerName && (
                <p className="text-xs text-destructive">{formErrors.ownerName}</p>
              )}
            </div>

            {/* Type + Status */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>
                  Business Type <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.type} onValueChange={(v) => setField('type', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.type && (
                  <p className="text-xs text-destructive">{formErrors.type}</p>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setField('status', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Address */}
            <div className="grid gap-1.5">
              <Label htmlFor="biz-address">
                Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="biz-address"
                value={formData.address}
                onChange={(e) => setField('address', e.target.value)}
                placeholder="Enter business address"
              />
              {formErrors.address && (
                <p className="text-xs text-destructive">{formErrors.address}</p>
              )}
            </div>

            {/* Permit Number */}
            <div className="grid gap-1.5">
              <Label htmlFor="biz-permit">Permit Number</Label>
              <Input
                id="biz-permit"
                value={formData.permitNumber}
                onChange={(e) => setField('permitNumber', e.target.value)}
                placeholder="e.g., BP-2026-001"
                className="font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button className="w-full sm:w-auto" onClick={handleSubmit}>
              {editingId ? (
                <><Edit2 className="mr-1.5 h-4 w-4" />Save Changes</>
              ) : (
                <><Plus className="mr-1.5 h-4 w-4" />Add Business</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="w-[95vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Business?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{' '}
              <span className="font-semibold">{deleteTarget?.businessName}</span> from the records.
              This action cannot be undone.
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