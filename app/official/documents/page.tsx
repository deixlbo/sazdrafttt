'use client';

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PortalHeader } from '@/components/portal/header';
import { useDocumentRequests, updateDocument, addAuditLog, formatDate } from '@/lib/firebase-hooks';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { Printer, X, FileText, AlertCircle } from 'lucide-react';

type DocumentStatus = 'pending' | 'processing' | 'approved' | 'rejected' | 'released';

// Document templates
const documentTemplates = {
  'Barangay Clearance': (data: any) => `
    <div class="print-document">
      <div class="print-header">
        <img src="/santiago.jpg" alt="Logo" style="width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 10px;" />
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">REPUBLIC OF THE PHILIPPINES</h1>
        <h2 style="font-size: 18px; margin-bottom: 5px;">Province of Zambales</h2>
        <h2 style="font-size: 18px; margin-bottom: 5px;">Municipality of San Antonio</h2>
        <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 20px;">BARANGAY SANTIAGO</h2>
        <h1 style="font-size: 28px; font-weight: bold; text-decoration: underline; margin-bottom: 30px;">BARANGAY CLEARANCE</h1>
      </div>
      
      <div class="print-body" style="text-align: left; line-height: 2;">
        <p><strong>TO WHOM IT MAY CONCERN:</strong></p>
        <br />
        <p style="text-indent: 50px; text-align: justify;">
          This is to certify that <strong>${data.residentName || '___________________'}</strong>, 
          of legal age, Filipino, and a bonafide resident of <strong>${data.address || 'Barangay Santiago, San Antonio, Zambales'}</strong>,
          is known to me to be a person of good moral character and has no derogatory record on file in this office.
        </p>
        <br />
        <p style="text-indent: 50px; text-align: justify;">
          This certification is being issued upon the request of the above-named person for 
          <strong>${data.purpose || '___________________'}</strong> purposes.
        </p>
        <br />
        <p style="text-indent: 50px;">
          Issued this <strong>${formatDate(new Date())}</strong> at Barangay Santiago, San Antonio, Zambales.
        </p>
      </div>
      
      <div class="print-signature" style="margin-top: 60px; text-align: right; padding-right: 50px;">
        <p style="margin-bottom: 40px;">_________________________________</p>
        <p style="font-weight: bold;">HON. PUNONG BARANGAY</p>
        <p>Barangay Captain</p>
      </div>
      
      <div style="margin-top: 40px; font-size: 10px; text-align: left;">
        <p>Doc. No.: _____</p>
        <p>Page No.: _____</p>
        <p>Book No.: _____</p>
        <p>Series of 2026</p>
      </div>
    </div>
  `,
  'Certificate of Residency': (data: any) => `
    <div class="print-document">
      <div class="print-header">
        <img src="/santiago.jpg" alt="Logo" style="width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 10px;" />
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">REPUBLIC OF THE PHILIPPINES</h1>
        <h2 style="font-size: 18px; margin-bottom: 5px;">Province of Zambales</h2>
        <h2 style="font-size: 18px; margin-bottom: 5px;">Municipality of San Antonio</h2>
        <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 20px;">BARANGAY SANTIAGO</h2>
        <h1 style="font-size: 28px; font-weight: bold; text-decoration: underline; margin-bottom: 30px;">CERTIFICATE OF RESIDENCY</h1>
      </div>
      
      <div class="print-body" style="text-align: left; line-height: 2;">
        <p><strong>TO WHOM IT MAY CONCERN:</strong></p>
        <br />
        <p style="text-indent: 50px; text-align: justify;">
          This is to certify that <strong>${data.residentName || '___________________'}</strong> 
          is a bonafide resident of <strong>${data.address || 'Barangay Santiago, San Antonio, Zambales'}</strong>.
        </p>
        <br />
        <p style="text-indent: 50px; text-align: justify;">
          This certification is being issued upon the request of the above-named person for 
          <strong>${data.purpose || '___________________'}</strong> purposes.
        </p>
        <br />
        <p style="text-indent: 50px;">
          Issued this <strong>${formatDate(new Date())}</strong> at Barangay Santiago, San Antonio, Zambales.
        </p>
      </div>
      
      <div class="print-signature" style="margin-top: 60px; text-align: right; padding-right: 50px;">
        <p style="margin-bottom: 40px;">_________________________________</p>
        <p style="font-weight: bold;">HON. PUNONG BARANGAY</p>
        <p>Barangay Captain</p>
      </div>
    </div>
  `,
  'Certificate of Indigency': (data: any) => `
    <div class="print-document">
      <div class="print-header">
        <img src="/santiago.jpg" alt="Logo" style="width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 10px;" />
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">REPUBLIC OF THE PHILIPPINES</h1>
        <h2 style="font-size: 18px; margin-bottom: 5px;">Province of Zambales</h2>
        <h2 style="font-size: 18px; margin-bottom: 5px;">Municipality of San Antonio</h2>
        <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 20px;">BARANGAY SANTIAGO</h2>
        <h1 style="font-size: 28px; font-weight: bold; text-decoration: underline; margin-bottom: 30px;">CERTIFICATE OF INDIGENCY</h1>
      </div>
      
      <div class="print-body" style="text-align: left; line-height: 2;">
        <p><strong>TO WHOM IT MAY CONCERN:</strong></p>
        <br />
        <p style="text-indent: 50px; text-align: justify;">
          This is to certify that <strong>${data.residentName || '___________________'}</strong>, 
          of legal age, Filipino, and a resident of <strong>${data.address || 'Barangay Santiago, San Antonio, Zambales'}</strong>,
          belongs to an indigent family and has no sufficient financial means to support the needed requirements.
        </p>
        <br />
        <p style="text-indent: 50px; text-align: justify;">
          This certification is being issued upon the request of the above-named person for 
          <strong>${data.purpose || '___________________'}</strong> purposes.
        </p>
        <br />
        <p style="text-indent: 50px;">
          Issued this <strong>${formatDate(new Date())}</strong> at Barangay Santiago, San Antonio, Zambales.
        </p>
      </div>
      
      <div class="print-signature" style="margin-top: 60px; text-align: right; padding-right: 50px;">
        <p style="margin-bottom: 40px;">_________________________________</p>
        <p style="font-weight: bold;">HON. PUNONG BARANGAY</p>
        <p>Barangay Captain</p>
      </div>
    </div>
  `,
};

export default function OfficialDocumentsPage() {
  const { data: documents, loading, error } = useDocumentRequests();
  const { userData, user } = useAuth();
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [printDoc, setPrintDoc] = useState<any | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleStatusUpdate = async (docId: string) => {
    if (!newStatus) return;

    try {
      await updateDocument('document_requests', docId, {
        status: newStatus,
        notes: notes,
        processedBy: user?.uid,
        ...(newStatus === 'approved' ? { approvedAt: new Date() } : {}),
      });

      // Add audit log
      await addAuditLog({
        userId: user?.uid || '',
        userName: userData?.fullName || '',
        userRole: 'official',
        action: `Updated document status to ${newStatus}`,
        module: 'Documents',
        details: `Document ${docId} status changed to ${newStatus}`,
      });

      toast.success('Document status updated');
      setSelectedDoc(null);
      setNewStatus('');
      setNotes('');
    } catch (err) {
      toast.error('Failed to update document status');
    }
  };

  const handlePrint = (doc: any) => {
    setPrintDoc(doc);
    setTimeout(() => {
      const printContent = printRef.current;
      if (printContent) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>${doc.documentType}</title>
                <style>
                  body { font-family: 'Times New Roman', serif; margin: 0; padding: 20mm; }
                  .print-document { max-width: 8.5in; margin: 0 auto; }
                  .print-header { text-align: center; margin-bottom: 30px; }
                  .print-body { text-align: justify; }
                  .print-signature { margin-top: 60px; }
                  @page { size: letter; margin: 20mm; }
                </style>
              </head>
              <body>
                ${printContent.innerHTML}
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        }
      }
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
        <PortalHeader title="Document Requests Management" description="Review and manage all resident document requests" />
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PortalHeader title="Document Requests Management" description="Review and manage all resident document requests" />
      
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Pending', value: stats.pending, color: 'bg-amber-100 text-amber-700' },
            { label: 'Processing', value: stats.processing, color: 'bg-blue-100 text-blue-700' },
            { label: 'Approved', value: stats.approved, color: 'bg-primary/10 text-primary' },
            { label: 'Rejected', value: stats.rejected, color: 'bg-destructive/10 text-destructive' },
            { label: 'Released', value: stats.released, color: 'bg-cyan-100 text-cyan-700' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.color} rounded-lg p-4 text-center`}>
              <p className="text-sm font-medium opacity-75">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto mb-6 pb-2">
          {['all', 'pending', 'processing', 'approved', 'rejected', 'released'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Documents Table */}
        {filteredDocuments.length === 0 ? (
          <Card className="p-12 text-center border-primary/20">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No documents found</p>
          </Card>
        ) : (
          <Card className="overflow-hidden border-primary/20">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Resident</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Document Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Purpose</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredDocuments.map((doc: any) => (
                    <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{doc.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 text-sm text-foreground font-medium">{doc.residentName}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{doc.documentType}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{doc.purpose}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          doc.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          doc.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                          doc.status === 'approved' ? 'bg-primary/10 text-primary' :
                          doc.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                          'bg-cyan-100 text-cyan-700'
                        }`}>
                          {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedDoc(doc)}
                          >
                            Update
                          </Button>
                          {doc.status === 'approved' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePrint(doc)}
                              className="text-primary border-primary/30 hover:bg-primary/10"
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Update Modal */}
        {selectedDoc && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-8 max-w-md w-full animate-scaleIn">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-foreground">Update Document Status</h2>
                <button onClick={() => setSelectedDoc(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Resident: <strong className="text-foreground">{selectedDoc.residentName}</strong></p>
                <p className="text-sm text-muted-foreground">Document: <strong className="text-foreground">{selectedDoc.documentType}</strong></p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">New Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Select status</option>
                    <option value="processing">Processing</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="released">Released</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes for the resident..."
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedDoc(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate(selectedDoc.id)}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={!newStatus}
                  >
                    Update
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Hidden Print Template */}
        {printDoc && (
          <div ref={printRef} className="hidden">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: (documentTemplates as any)[printDoc.documentType]?.(printDoc) || '' 
              }} 
            />
          </div>
        )}
      </div>
    </>
  );
}
