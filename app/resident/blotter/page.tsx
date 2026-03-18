'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PortalHeader } from '@/components/portal/header';
import { useBlotterReports, addDocument, deleteDocument, addAuditLog, formatTimestamp } from '@/lib/firebase-hooks';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { AlertTriangle, AlertCircle, Info, Sparkles, Trash2, FileText } from 'lucide-react';

const incidentTypes = [
  'Noise Complaint',
  'Property Dispute',
  'Lost Item',
  'Found Item',
  'Theft',
  'Vandalism',
  'Trespassing',
  'Domestic Dispute',
  'Traffic Incident',
  'Other',
];

export default function BlotterPage() {
  const { user, userData } = useAuth();
  const { data: cases, loading } = useBlotterReports(user?.uid);
  const [newCase, setNewCase] = useState({ 
    incidentType: '', 
    title: '', 
    description: '', 
    location: '' 
  });
  const [aiSeverity, setAiSeverity] = useState<'low' | 'medium' | 'high' | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'low':
        return <Info className="w-5 h-5 text-primary" />;
      default:
        return <Info className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const handleDescriptionChange = (value: string) => {
    setNewCase({ ...newCase, description: value });

    const highSeverityKeywords = ['violence', 'injury', 'assault', 'robbery', 'theft', 'accident', 'injured', 'harm', 'fight', 'attack', 'threat', 'weapon'];
    const mediumSeverityKeywords = ['noise', 'disturbance', 'property', 'damage', 'dispute', 'argument', 'trespass', 'vandalism'];

    const text = value.toLowerCase();
    if (highSeverityKeywords.some(keyword => text.includes(keyword))) {
      setAiSeverity('high');
    } else if (mediumSeverityKeywords.some(keyword => text.includes(keyword))) {
      setAiSeverity('medium');
    } else if (text.length > 10) {
      setAiSeverity('low');
    } else {
      setAiSeverity(null);
    }
  };

  const handleSubmitCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCase.incidentType || !newCase.title || !newCase.description || !user || !userData) return;

    setSubmitting(true);
    const severity = aiSeverity || 'low';

    try {
      await addDocument('blotter_reports', {
        reporterId: user.uid,
        reporterName: userData.fullName,
        incidentType: newCase.incidentType,
        title: newCase.title,
        description: newCase.description,
        location: newCase.location || userData.address,
        severity,
        status: 'reported',
      });

      await addAuditLog({
        userId: user.uid,
        userName: userData.fullName,
        userRole: 'resident',
        action: 'Filed blotter report',
        module: 'Blotter',
        details: `${newCase.incidentType}: ${newCase.title}`,
      });

      toast.success('Blotter report filed successfully');
      setNewCase({ incidentType: '', title: '', description: '', location: '' });
      setAiSeverity(null);
      setShowForm(false);
    } catch (err) {
      toast.error('Failed to file report');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      await deleteDocument('blotter_reports', id);
      toast.success('Report deleted');
    } catch (err) {
      toast.error('Failed to delete report');
    }
  };

  if (loading) {
    return (
      <>
        <PortalHeader title="Blotter Report" description="File and track incident reports" />
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
      <PortalHeader title="Blotter Report" description="File and track incident reports" />
      
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        {/* File Report Button */}
        {!showForm && (
          <Button 
            onClick={() => setShowForm(true)}
            className="mb-6 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            File a Report
          </Button>
        )}

        {/* Report Form */}
        {showForm && (
          <Card className="p-6 mb-8 border-primary/20 animate-fadeUp">
            <h2 className="text-2xl font-bold text-foreground mb-6">File a Blotter Report</h2>
            <form onSubmit={handleSubmitCase} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Incident Type</label>
                <select
                  value={newCase.incidentType}
                  onChange={(e) => setNewCase({ ...newCase, incidentType: e.target.value })}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                >
                  <option value="">Select incident type...</option>
                  {incidentTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Incident Title</label>
                <Input
                  type="text"
                  value={newCase.title}
                  onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                  placeholder="Brief title of the incident..."
                  className="border-input focus:ring-primary/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Location</label>
                <Input
                  type="text"
                  value={newCase.location}
                  onChange={(e) => setNewCase({ ...newCase, location: e.target.value })}
                  placeholder="Where did the incident occur?"
                  className="border-input focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  value={newCase.description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  placeholder="Describe what happened in detail..."
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  rows={5}
                  required
                />
              </div>

              {aiSeverity && (
                <div className={`p-4 border rounded-lg animate-fadeUp ${
                  aiSeverity === 'high' ? 'bg-destructive/10 border-destructive/20' :
                  aiSeverity === 'medium' ? 'bg-amber-50 border-amber-200' :
                  'bg-primary/10 border-primary/20'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4" />
                    <p className={`font-semibold ${
                      aiSeverity === 'high' ? 'text-destructive' :
                      aiSeverity === 'medium' ? 'text-amber-700' :
                      'text-primary'
                    }`}>
                      {aiSeverity === 'high' ? 'High Priority Incident' :
                       aiSeverity === 'medium' ? 'Medium Priority Incident' :
                       'Low Priority Report'}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {aiSeverity === 'high' && 'This appears to be a serious incident requiring immediate attention.'}
                    {aiSeverity === 'medium' && 'This incident requires regular follow-up.'}
                    {aiSeverity === 'low' && 'This is a routine report.'}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false);
                    setNewCase({ incidentType: '', title: '', description: '', location: '' });
                    setAiSeverity(null);
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
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Recent Cases */}
        <Card className="border-primary/20">
          <div className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-6">Your Reports</h2>
            <div className="space-y-4">
              {cases.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No reports yet.</p>
                </div>
              ) : (
                cases.map((caseItem: any) => (
                  <div key={caseItem.id} className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-muted-foreground">{caseItem.id.slice(0, 8)}</span>
                        <h3 className="font-semibold text-foreground text-lg">{caseItem.title}</h3>
                        {getSeverityIcon(caseItem.severity)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`
                          ${caseItem.severity === 'high' ? 'bg-destructive/10 text-destructive' : ''}
                          ${caseItem.severity === 'medium' ? 'bg-amber-100 text-amber-700' : ''}
                          ${caseItem.severity === 'low' ? 'bg-primary/10 text-primary' : ''}
                        `}>
                          {caseItem.severity}
                        </Badge>
                        <Badge className={
                          caseItem.status === 'resolved' || caseItem.status === 'closed' 
                            ? 'bg-primary/10 text-primary' 
                            : caseItem.status === 'investigating'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-destructive/10 text-destructive'
                        }>
                          {caseItem.status}
                        </Badge>
                        {caseItem.status === 'reported' && (
                          <button
                            onClick={() => handleDelete(caseItem.id)}
                            className="p-2 text-muted-foreground hover:text-destructive transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      <strong>Type:</strong> {caseItem.incidentType}
                    </p>
                    <p className="text-muted-foreground mb-2">{caseItem.description}</p>
                    {caseItem.location && (
                      <p className="text-xs text-muted-foreground">Location: {caseItem.location}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Reported: {formatTimestamp(caseItem.createdAt)}
                    </p>
                    {caseItem.handlerNotes && (
                      <p className="text-xs text-primary mt-2 p-2 bg-primary/5 rounded">
                        <strong>Official Note:</strong> {caseItem.handlerNotes}
                      </p>
                    )}
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
