'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { PortalHeader } from '@/components/portal/header';
import {
  useDocumentRequests,
  updateDocument,
  addAuditLog,
  formatDate,
} from '@/lib/firebase-hooks';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import {
  Printer,
  FileText,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  PackageCheck,
  RefreshCw,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type DocumentStatus = 'pending' | 'processing' | 'approved' | 'rejected' | 'released';

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTER_OPTIONS = ['all', 'pending', 'processing', 'approved', 'rejected', 'released'];

const UPDATE_STATUSES: DocumentStatus[] = ['processing', 'approved', 'rejected', 'released'];

const STATUS_BADGE: Record<DocumentStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  released: 'bg-cyan-100 text-cyan-700 border-cyan-200',
};

const STATUS_ICON: Record<DocumentStatus, React.ReactNode> = {
  pending: <Clock className="h-3.5 w-3.5" />,
  processing: <Loader2 className="h-3.5 w-3.5" />,
  approved: <CheckCircle2 className="h-3.5 w-3.5" />,
  rejected: <XCircle className="h-3.5 w-3.5" />,
  released: <PackageCheck className="h-3.5 w-3.5" />,
};

// ─── Document Templates ───────────────────────────────────────────────────────

const documentTemplates: Record<string, (data: any) => string> = {
  'Barangay Clearance': (data) => `
    <div class="print-document">
      <div class="print-header">
        <img src="/santiago.jpg" alt="Logo" style="width:80px;height:80px;border-radius:50%;margin:0 auto 10px;" />
        <h1 style="font-size:24px;font-weight:bold;margin-bottom:5px;">REPUBLIC OF THE PHILIPPINES</h1>
        <h2 style="font-size:18px;margin-bottom:5px;">Province of Zambales</h2>
        <h2 style="font-size:18px;margin-bottom:5px;">Municipality of San Antonio</h2>
        <h2 style="font-size:20px;font-weight:bold;margin-bottom:20px;">BARANGAY SANTIAGO</h2>
        <h1 style="font-size:28px;font-weight:bold;text-decoration:underline;margin-bottom:30px;">BARANGAY CLEARANCE</h1>
      </div>
      <div class="print-body" style="text-align:left;line-height:2;">
        <p><strong>TO WHOM IT MAY CONCERN:</strong></p><br />
        <p style="text-indent:50px;text-align:justify;">
          This is to certify that <strong>${data.residentName || '___________________'}</strong>,
          of legal age, Filipino, and a bonafide resident of <strong>${data.address || 'Barangay Santiago, San Antonio, Zambales'}</strong>,
          is known to me to be a person of good moral character and has no derogatory record on file in this office.
        </p><br />
        <p style="text-indent:50px;text-align:justify;">
          This certification is being issued upon the request of the above-named person for
          <strong>${data.purpose || '___________________'}</strong> purposes.
        </p><br />
        <p style="text-indent:50px;">
          Issued this <strong>${formatDate(new Date())}</strong> at Barangay Santiago, San Antonio, Zambales.
        </p>
      </div>
      <div class="print-signature" style="margin-top:60px;text-align:right;padding-right:50px;">
        <p style="margin-bottom:40px;">_________________________________</p>
        <p style="font-weight:bold;">HON. PUNONG BARANGAY</p>
        <p>Barangay Captain</p>
      </div>
      <div style="margin-top:40px;font-size:10px;text-align:left;">
        <p>Doc. No.: _____</p><p>Page No.: _____</p><p>Book No.: _____</p><p>Series of 2026</p>
      </div>
    </div>`,

  'Certificate of Residency': (data) => `
    <div class="print-document">
      <div class="print-header">
        <img src="/santiago.jpg" alt="Logo" style="width:80px;height:80px;border-radius:50%;margin:0 auto 10px;" />
        <h1 style="font-size:24px;font-weight:bold;margin-bottom:5px;">REPUBLIC OF THE PHILIPPINES</h1>
        <h2 style="font-size:18px;margin-bottom:5px;">Province of Zambales</h2>
        <h2 style="font-size:18px;margin-bottom:5px;">Municipality of San Antonio</h2>
        <h2 style="font-size:20px;font-weight:bold;margin-bottom:20px;">BARANGAY SANTIAGO</h2>
        <h1 style="font-size:28px;font-weight:bold;text-decoration:underline;margin-bottom:30px;">CERTIFICATE OF RESIDENCY</h1>
      </div>
      <div class="print-body" style="text-align:left;line-height:2;">
        <p><strong>TO WHOM IT MAY CONCERN:</strong></p><br />
        <p style="text-indent:50px;text-align:justify;">
          This is to certify that <strong>${data.residentName || '___________________'}</strong>
          is a bonafide resident of <strong>${data.address || 'Barangay Santiago, San Antonio, Zambales'}</strong>.
        </p><br />
        <p style="text-indent:50px;text-align:justify;">
          This certification is being issued upon the request of the above-named person for
          <strong>${data.purpose || '___________________'}</strong> purposes.
        </p><br />
        <p style="text-indent:50px;">
          Issued this <strong>${formatDate(new Date())}</strong> at Barangay Santiago, San Antonio, Zambales.
        </p>
      </div>
      <div class="print-signature" style="margin-top:60px;text-align:right;padding-right:50px;">
        <p style="margin-bottom:40px;">_________________________________</p>
        <p style="font-weight:bold;">HON. PUNONG BARANGAY</p>
        <p>Barangay Captain</p>
      </div>
    </div>`,

  'Certificate of Indigency': (data) => `
    <div class="print-document">
      <div class="print-header">
        <img src="/santiago.jpg" alt="Logo" style="width:80px;height:80px;border-radius:50%;margin:0 auto 10px;" />
        <h1 style="font-size:24px;font-weight:bold;margin-bottom:5px;">REPUBLIC OF THE PHILIPPINES</h1>
        <h2 style="font-size:18px;margin-bottom:5px;">Province of Zambales</h2>
        <h2 style="font-size:18px;margin-bottom:5px;">Municipality of San Antonio</h2>
        <h2 style="font-size:20px;font-weight:bold;margin-bottom:20px;">BARANGAY SANTIAGO</h2>
        <h1 style="font-size:28px;font-weight:bold;text-decoration:underline;margin-bottom:30px;">CERTIFICATE OF INDIGENCY</h1>
      </div>
      <div class="print-body" style="text-align:left;line-height:2;">
        <p><strong>TO WHOM IT MAY CONCERN:</strong></p><br />
        <p style="text-indent:50px;text-align:justify;">
          This is to certify that <strong>${data.residentName || '___________________'}</strong>,
          of legal age, Filipino, and a resident of <strong>${data.address || 'Barangay Santiago, San Antonio, Zambales'}</strong>,
          belongs to an indigent family and has no sufficient financial means to support the needed requirements.
        </p><br />
        <p style="text-indent:50px;text-align:justify;">
          This certification is being issued upon the request of the above-named person for
          <strong>${data.purpose || '___________________'}</strong> purposes.
        </p><br />
        <p style="text-indent:50px;">
          Issued this <strong>${formatDate(new Date())}</strong> at Barangay Santiago, San Antonio, Zambales.
        </p>
      </div>
      <div class="print-signature" style="margin-top:60px;text-align:right;padding-right:50px;">
        <p style="margin-bottom:40px;">_________________________________</p>
        <p style="font-weight:bold;">HON. PUNONG BARANGAY</p>
        <p>Barangay Captain</p>
      </div>
    </div>`,
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OfficialDocumentsPage() {
  const { data: documents, loading } = useDocumentRequests();
  const { userData, user } = useAuth();

  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState<DocumentStatus | ''>('');
  const [notes, setNotes] = useState('');
  const [printDoc, setPrintDoc] = useState<any | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // ── Status update ──
  const handleStatusUpdate = async () => {
    if (!selectedDoc || !newStatus) return;
    try {
      await updateDocument('document_requests', selectedDoc.id, {
        status: newStatus,
        notes,
        processedBy: user?.uid,
        ...(newStatus === 'approved' ? { approvedAt: new Date() } : {}),
      });
      await addAuditLog({
        userId: user?.uid || '',
        userName: userData?.fullName || '',
        userRole: 'official',
        action: `Updated document status to ${newStatus}`,
        module: 'Documents',
        details: `Document ${selectedDoc.id} status changed to ${newStatus}`,
      });
      toast.success('Document status updated');
      setSelectedDoc(null);
      setNewStatus('');
      setNotes('');
    } catch {
      toast.error('Failed to update document status');
    }
  };

  // ── Print ──
  const handlePrint = (doc: any) => {
    setPrintDoc(doc);
    setTimeout(() => {
      const content = printRef.current;
      if (!content) return;
      const win = window.open('', '_blank');
      if (!win) return;
      win.document.write(`
        <html>
          <head>
            <title>${doc.documentType}</title>
            <style>
              body { font-family: 'Times New Roman', serif; margin: 0; padding: 20mm; }
              .print-document { max-width: 8.5in; margin: 0 auto; }
              .print-header { text-align: center; margin-bottom: 30px; }
              .print-body { text-align: justify; }
              @page { size: letter; margin: 20mm; }
            </style>
          </head>
          <body>${content.innerHTML}</body>
        </html>`);
      win.document.close();
      win.focus();
      win.print();
      win.close();
      setPrintDoc(null);
    }, 100);
  };

  const filteredDocuments = documents.filter((doc: any) =>
    statusFilter === 'all' ? true : doc.status === statusFilter
  );

  const stats = {
    pending: documents.filter((d: any) => d.status === 'pending').length,
    processing: documents.filter((d: any) => d.status === 'processing').length,
    approved: documents.filter((d: any) => d.status === 'approved').length,
    rejected: documents.filter((d: any) => d.status === 'rejected').length,
    released: documents.filter((d: any) => d.status === 'released').length,
  };

  if (loading) {
    return (
      <>
        <PortalHeader
          title="Document Requests"
          description="Review and manage all resident document requests"
        />
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <PortalHeader
        title="Document Requests"
        description="Review and manage all resident document requests"
      />

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* ── Stats ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {([
            ['Pending', stats.pending, 'text-amber-700 bg-amber-50', Clock],
            ['Processing', stats.processing, 'text-blue-700 bg-blue-50', Loader2],
            ['Approved', stats.approved, 'text-emerald-700 bg-emerald-50', CheckCircle2],
            ['Rejected', stats.rejected, 'text-red-700 bg-red-50', XCircle],
            ['Released', stats.released, 'text-cyan-700 bg-cyan-50', PackageCheck],
          ] as const).map(([label, value, cls, Icon]) => (
            <Card key={label}>
              <CardContent className={`flex items-center gap-3 p-4 rounded-lg ${cls}`}>
                <Icon className="h-5 w-5 shrink-0" />
                <div>
                  <p className="text-xs font-medium opacity-75">{label}</p>
                  <p className="text-2xl font-bold">{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Table Card ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Document Requests</CardTitle>
            <CardDescription>All submitted document requests from residents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filter tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {FILTER_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                    statusFilter === s
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* ── Desktop Table ── */}
            <div className="hidden md:block rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[90px]">Ref ID</TableHead>
                    <TableHead>Resident</TableHead>
                    <TableHead>Document Type</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                        No document requests found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDocuments.map((doc: any) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {doc.id.slice(0, 8)}
                        </TableCell>
                        <TableCell className="font-medium">{doc.residentName}</TableCell>
                        <TableCell className="text-sm">{doc.documentType}</TableCell>
                        <TableCell className="max-w-[160px] truncate text-sm text-muted-foreground">
                          {doc.purpose}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
                              STATUS_BADGE[doc.status as DocumentStatus] ?? 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {STATUS_ICON[doc.status as DocumentStatus]}
                            {doc.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5"
                              onClick={() => {
                                setSelectedDoc(doc);
                                setNewStatus('');
                                setNotes('');
                              }}
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              Update
                            </Button>
                            {doc.status === 'approved' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 text-primary border-primary/30 hover:bg-primary/10"
                                onClick={() => handlePrint(doc)}
                              >
                                <Printer className="h-3.5 w-3.5" />
                                Print
                              </Button>
                            )}
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
              {filteredDocuments.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  No document requests found.
                </p>
              ) : (
                filteredDocuments.map((doc: any) => (
                  <div key={doc.id} className="rounded-lg border bg-card p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{doc.residentName}</p>
                        <p className="text-sm text-muted-foreground truncate">{doc.documentType}</p>
                        <p className="text-xs font-mono text-muted-foreground mt-0.5">{doc.id.slice(0, 8)}</p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
                          STATUS_BADGE[doc.status as DocumentStatus] ?? 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {STATUS_ICON[doc.status as DocumentStatus]}
                        {doc.status}
                      </span>
                    </div>
                    {doc.purpose && (
                      <p className="text-sm text-muted-foreground truncate">📋 {doc.purpose}</p>
                    )}
                    <div className="flex items-center gap-1 border-t pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 gap-1.5 text-xs"
                        onClick={() => { setSelectedDoc(doc); setNewStatus(''); setNotes(''); }}
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Update
                      </Button>
                      {doc.status === 'approved' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 gap-1.5 text-xs text-primary"
                          onClick={() => handlePrint(doc)}
                        >
                          <Printer className="h-3.5 w-3.5" />
                          Print
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Update Status Dialog ── */}
      <Dialog
        open={!!selectedDoc}
        onOpenChange={(open) => {
          if (!open) { setSelectedDoc(null); setNewStatus(''); setNotes(''); }
        }}
      >
        <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              Update Document Status
            </DialogTitle>
            <DialogDescription>
              Change the processing status for this document request.
            </DialogDescription>
          </DialogHeader>

          {selectedDoc && (
            <div className="space-y-4 py-2">
              {/* Summary */}
              <div className="rounded-lg bg-muted p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resident</span>
                  <span className="font-medium">{selectedDoc.residentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Document</span>
                  <span className="font-medium text-right max-w-[55%]">{selectedDoc.documentType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Current</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${
                      STATUS_BADGE[selectedDoc.status as DocumentStatus] ?? ''
                    }`}
                  >
                    {STATUS_ICON[selectedDoc.status as DocumentStatus]}
                    {selectedDoc.status}
                  </span>
                </div>
              </div>

              {/* New Status */}
              <div className="grid gap-1.5">
                <Label>New Status</Label>
                <Select
                  value={newStatus}
                  onValueChange={(v) => setNewStatus(v as DocumentStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status..." />
                  </SelectTrigger>
                  <SelectContent>
                    {UPDATE_STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="grid gap-1.5">
                <Label htmlFor="doc-notes">Notes (Optional)</Label>
                <Textarea
                  id="doc-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes for the resident..."
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setSelectedDoc(null)}
            >
              Cancel
            </Button>
            <Button
              className="w-full sm:w-auto"
              disabled={!newStatus}
              onClick={handleStatusUpdate}
            >
              <RefreshCw className="mr-1.5 h-4 w-4" />
              Update Status
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden print container */}
      {printDoc && (
        <div ref={printRef} className="hidden">
          <div
            dangerouslySetInnerHTML={{
              __html: documentTemplates[printDoc.documentType]?.(printDoc) ?? '',
            }}
          />
        </div>
      )}
    </>
  );
}