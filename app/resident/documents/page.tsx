'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PortalHeader } from '@/components/portal/header';
import { useDocumentRequests, addDocument, deleteDocument, addAuditLog, formatTimestamp } from '@/lib/firebase-hooks';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { Sparkles, CheckCircle, Clock, XCircle, Trash2, FileText, X, DollarSign, ClipboardList } from 'lucide-react';

const documentTypes = [
  { 
    id: '1', 
    name: 'Barangay Clearance', 
    description: 'For employment and legal purposes', 
    days: 1,
    requirements: [
      'Valid ID (Government-issued)',
      'Proof of residency (Utility bill or Barangay ID)',
      'Community Tax Certificate (Cedula)'
    ],
    price: 50,
    priceDescription: 'Processing fee'
  },
  { 
    id: '2', 
    name: 'Certificate of Residency', 
    description: 'Proof of residence in the barangay', 
    days: 1,
    requirements: [
      'Valid ID',
      'Proof of residency (Utility bill)',
      'Barangay ID (if available)'
    ],
    price: 30,
    priceDescription: 'Processing fee'
  },
  { 
    id: '3', 
    name: 'Certificate of Indigency', 
    description: 'For financial assistance applications', 
    days: 1,
    requirements: [
      'Barangay ID or Valid ID',
      'Proof of residency',
      'Interview with Barangay Social Worker'
    ],
    price: 0,
    priceDescription: 'Free service'
  },
  { 
    id: '4', 
    name: 'Business Permit', 
    description: 'For business registration', 
    days: 3,
    requirements: [
      'DTI/SEC Registration',
      'Mayor\'s Permit from previous location (if applicable)',
      'Zoning Clearance',
      'Fire Safety Inspection Certificate',
      'Community Tax Certificate (Cedula)',
      'Valid ID of business owner'
    ],
    price: 500,
    priceDescription: 'Base processing fee (varies by business type)'
  },
  { 
    id: '5', 
    name: 'Building Permit', 
    description: 'For construction purposes', 
    days: 5,
    requirements: [
      'Site Development Plan',
      'Floor Plan',
      'Elevation',
      'Structural Analysis',
      'Electrical Plan',
      'Plumbing Plan',
      'Location Plan',
      'Transfer Certificate of Title (TCT)',
      'Tax Declaration'
    ],
    price: 1000,
    priceDescription: 'Base processing fee (varies by project cost)'
  },
];

export default function DocumentsPage() {
  const { user, userData } = useAuth();
  const { data: requests, loading, error } = useDocumentRequests(user?.uid);
  const [purpose, setPurpose] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<typeof documentTypes[0] | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'released':
        return <CheckCircle className="w-5 h-5 text-primary" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  const handleDocumentSelect = (document: typeof documentTypes[0]) => {
    setSelectedDocument(document);
    setPurpose('');
    setShowForm(true);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocument || !purpose || !user || !userData) return;

    setSubmitting(true);
    try {
      await addDocument('document_requests', {
        residentId: user.uid,
        residentName: userData.fullName,
        documentType: selectedDocument.name,
        purpose: purpose,
        status: 'pending',
        address: userData.address,
      });

      // Add audit log
      await addAuditLog({
        userId: user.uid,
        userName: userData.fullName,
        userRole: 'resident',
        action: 'Submitted document request',
        module: 'Documents',
        details: `Requested ${selectedDocument.name} for ${purpose}`,
      });

      toast.success('Document request submitted successfully');
      setPurpose('');
      setSelectedDocument(null);
      setShowForm(false);
    } catch (err) {
      toast.error('Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return;

    try {
      await deleteDocument('document_requests', id);
      toast.success('Request deleted');
    } catch (err) {
      toast.error('Failed to delete request');
    }
  };

  if (loading) {
    return (
      <>
        <PortalHeader title="Document Requests" description="Request and track your barangay documents" />
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
      <PortalHeader title="Document Requests" description="Request and track your barangay documents" />
      
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        {/* Document Types Info */}
        <Card className="p-6 mb-8 border-primary/20 bg-primary/5">
          <h2 className="text-xl font-bold text-foreground mb-4">Available Documents</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentTypes.map((doc) => (
              <div 
                key={doc.id} 
                className="p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition cursor-pointer"
                onClick={() => handleDocumentSelect(doc)}
              >
                <h3 className="font-semibold text-foreground mb-1">{doc.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{doc.description}</p>
                <div className="flex items-center justify-between">
                  <Badge className="bg-primary/10 text-primary">
                    {doc.days} day{doc.days !== 1 ? 's' : ''}
                  </Badge>
                  <Badge className="bg-green-100 text-green-700">
                    ₱{doc.price.toLocaleString()}
                  </Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-3 w-full text-primary hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDocumentSelect(doc);
                  }}
                >
                  Request this document →
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Request Form Modal */}
        {showForm && selectedDocument && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-foreground">Request Document</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedDocument(null);
                    setPurpose('');
                  }}
                  className="p-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="mb-4 p-3 bg-primary/5 rounded-lg">
                <h3 className="font-semibold text-foreground">{selectedDocument.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-primary/10 text-primary text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {selectedDocument.days} day{selectedDocument.days !== 1 ? 's' : ''}
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    <DollarSign className="w-3 h-3 mr-1" />
                    ₱{selectedDocument.price.toLocaleString()}
                  </Badge>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                  <ClipboardList className="w-4 h-4" />
                  Requirements:
                </h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 max-h-40 overflow-y-auto">
                  {selectedDocument.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground mt-2 italic">
                  Note: {selectedDocument.priceDescription}
                </p>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Purpose of Request
                  </label>
                  <Input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g., Job application, school enrollment..."
                    className="border-input focus:ring-primary/50"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowForm(false);
                      setSelectedDocument(null);
                      setPurpose('');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Recent Requests */}
        <Card className="border-primary/20">
          <div className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-6">Your Requests</h2>
            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No requests yet. Click on any document above to request!</p>
                </div>
              ) : (
                requests.map((req: any) => (
                  <div 
                    key={req.id} 
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-foreground">{req.documentType}</h3>
                        {getStatusIcon(req.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{req.purpose}</p>
                      {req.notes && (
                        <p className="text-xs text-primary mt-1">Note: {req.notes}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Requested: {formatTimestamp(req.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`
                        ${req.status === 'approved' || req.status === 'released' ? 'bg-primary/10 text-primary' : ''}
                        ${req.status === 'processing' ? 'bg-blue-100 text-blue-700' : ''}
                        ${req.status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}
                        ${req.status === 'rejected' ? 'bg-destructive/10 text-destructive' : ''}
                      `}>
                        {req.status}
                      </Badge>
                      {req.status === 'pending' && (
                        <button
                          onClick={() => handleDelete(req.id)}
                          className="p-2 text-muted-foreground hover:text-destructive transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}