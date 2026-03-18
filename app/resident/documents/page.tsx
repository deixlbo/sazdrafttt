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
import { Sparkles, CheckCircle, Clock, XCircle, Trash2, FileText, AlertCircle } from 'lucide-react';

const documentTypes = [
  { id: '1', name: 'Barangay Clearance', description: 'For employment and legal purposes', days: 1 },
  { id: '2', name: 'Certificate of Residency', description: 'Proof of residence in the barangay', days: 1 },
  { id: '3', name: 'Certificate of Indigency', description: 'For financial assistance applications', days: 1 },
  { id: '4', name: 'Business Permit', description: 'For business registration', days: 3 },
  { id: '5', name: 'Building Permit', description: 'For construction purposes', days: 5 },
];

export default function DocumentsPage() {
  const { user, userData } = useAuth();
  const { data: requests, loading, error } = useDocumentRequests(user?.uid);
  const [newRequest, setNewRequest] = useState({ type: '', purpose: '' });
  const [aiRecommendation, setAiRecommendation] = useState<{ type: string; confidence: number } | null>(null);
  const [showForm, setShowForm] = useState(false);
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

  const handlePurposeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const purpose = e.target.value;
    setNewRequest({ ...newRequest, purpose });

    if (purpose.length > 3) {
      const keywords: Record<string, string> = {
        job: 'Barangay Clearance',
        employment: 'Barangay Clearance',
        work: 'Barangay Clearance',
        application: 'Barangay Clearance',
        school: 'Certificate of Residency',
        education: 'Certificate of Residency',
        enroll: 'Certificate of Residency',
        transfer: 'Certificate of Residency',
        business: 'Business Permit',
        store: 'Business Permit',
        shop: 'Business Permit',
        medical: 'Certificate of Indigency',
        hospital: 'Certificate of Indigency',
        assistance: 'Certificate of Indigency',
        financial: 'Certificate of Indigency',
        build: 'Building Permit',
        construct: 'Building Permit',
        renovation: 'Building Permit',
      };

      for (const [key, doc] of Object.entries(keywords)) {
        if (purpose.toLowerCase().includes(key)) {
          setAiRecommendation({
            type: doc,
            confidence: Math.min(95, Math.floor(70 + purpose.length / 2)),
          });
          return;
        }
      }
    }
    setAiRecommendation(null);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.type || !newRequest.purpose || !user || !userData) return;

    setSubmitting(true);
    try {
      await addDocument('document_requests', {
        residentId: user.uid,
        residentName: userData.fullName,
        documentType: newRequest.type,
        purpose: newRequest.purpose,
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
        details: `Requested ${newRequest.type} for ${newRequest.purpose}`,
      });

      toast.success('Document request submitted successfully');
      setNewRequest({ type: '', purpose: '' });
      setAiRecommendation(null);
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
        {/* Request Button */}
        {!showForm && (
          <Button 
            onClick={() => setShowForm(true)}
            className="mb-6 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Request New Document
          </Button>
        )}

        {/* Request Form */}
        {showForm && (
          <Card className="p-6 mb-8 border-primary/20 animate-fadeUp">
            <h2 className="text-2xl font-bold text-foreground mb-6">Request a Document</h2>
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Document Type</label>
                <select
                  value={newRequest.type}
                  onChange={(e) => setNewRequest({ ...newRequest, type: e.target.value })}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                >
                  <option value="">Select a document type...</option>
                  {documentTypes.map((doc) => (
                    <option key={doc.id} value={doc.name}>
                      {doc.name} ({doc.days} day{doc.days !== 1 ? 's' : ''})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Purpose of Request</label>
                <Input
                  type="text"
                  value={newRequest.purpose}
                  onChange={handlePurposeChange}
                  placeholder="e.g., Job application, school enrollment..."
                  className="border-input focus:ring-primary/50"
                  required
                />
              </div>

              {aiRecommendation && (
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg animate-fadeUp">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <p className="font-semibold text-primary">AI Recommendation</p>
                  </div>
                  <p className="text-foreground">
                    We recommend: <span className="font-semibold">{aiRecommendation.type}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Confidence: {aiRecommendation.confidence}%
                  </p>
                  <Button
                    type="button"
                    onClick={() => setNewRequest({ ...newRequest, type: aiRecommendation.type })}
                    className="mt-3 bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="sm"
                  >
                    Apply Recommendation
                  </Button>
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false);
                    setNewRequest({ type: '', purpose: '' });
                    setAiRecommendation(null);
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
        )}

        {/* Document Types Info */}
        <Card className="p-6 mb-8 border-primary/20 bg-primary/5">
          <h2 className="text-xl font-bold text-foreground mb-4">Available Documents</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentTypes.map((doc) => (
              <div key={doc.id} className="p-4 bg-card rounded-lg border border-border">
                <h3 className="font-semibold text-foreground mb-1">{doc.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{doc.description}</p>
                <Badge className="bg-primary/10 text-primary">
                  {doc.days} day{doc.days !== 1 ? 's' : ''}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Requests */}
        <Card className="border-primary/20">
          <div className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-6">Your Requests</h2>
            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No requests yet. Create your first request above!</p>
                </div>
              ) : (
                requests.map((req: any) => (
                  <div 
                    key={req.id} 
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-muted-foreground">{req.id.slice(0, 8)}</span>
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
