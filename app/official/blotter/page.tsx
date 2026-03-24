'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PortalHeader } from '@/components/portal/header';
import { useBlotterReports, updateDocument, deleteDocument, addAuditLog, formatTimestamp } from '@/lib/firebase-hooks';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { Trash2, AlertCircle, X, Eye, Bell } from 'lucide-react';

export default function OfficialBlotterPage() {
  const { data: cases, loading } = useBlotterReports();
  const { user, userData } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [viewCase, setViewCase] = useState<any | null>(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [handlerNotes, setHandlerNotes] = useState('');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationCase, setNotificationCase] = useState<any | null>(null);
  const [notificationMessage, setNotificationMessage] = useState('');
  
  // Add case numbers to each blotter (sequential numbers)
  const casesWithNumbers = cases.map((c: any, index: number) => ({
    ...c,
    caseNumber: index + 1
  }));

  const handleUpdateStatus = async () => {
    if (!updateStatus || !selectedCase) return;

    try {
      await updateDocument('blotter_reports', selectedCase.id, {
        status: updateStatus,
        handlerNotes: handlerNotes,
        handledBy: userData?.fullName,
        handledAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });

      // Add notification for the user who reported the blotter
      if (selectedCase.userId) {
        await addAuditLog({
          userId: selectedCase.userId,
          userName: selectedCase.reporterName || '',
          userRole: 'resident',
          action: `Blotter case #${selectedCase.caseNumber} status updated to ${updateStatus}`,
          module: 'Blotter',
          details: `Your blotter report has been updated to ${updateStatus}. ${handlerNotes || 'Please check with the barangay office for more details.'}`,
        });
      }

      await addAuditLog({
        userId: user?.uid || '',
        userName: userData?.fullName || '',
        userRole: 'official',
        action: `Updated blotter status to ${updateStatus}`,
        module: 'Blotter',
        details: `Case #${selectedCase.caseNumber} status changed to ${updateStatus}`,
      });

      toast.success('Case status updated and resident notified');
      setSelectedCase(null);
      setUpdateStatus('');
      setHandlerNotes('');
    } catch (err) {
      toast.error('Failed to update case status');
    }
  };

  const handleNotifyResident = async (blotterCase: any) => {
    setNotificationCase(blotterCase);
    setNotificationMessage('');
    setShowNotificationModal(true);
  };

  const sendNotification = async () => {
    if (!notificationCase || !notificationMessage) return;

    try {
      await addAuditLog({
        userId: notificationCase.userId,
        userName: notificationCase.reporterName || '',
        userRole: 'resident',
        action: `Blotter case #${notificationCase.caseNumber} - Barangay Notification`,
        module: 'Blotter',
        details: notificationMessage,
      });

      await addAuditLog({
        userId: user?.uid || '',
        userName: userData?.fullName || '',
        userRole: 'official',
        action: `Sent notification for blotter case #${notificationCase.caseNumber}`,
        module: 'Blotter',
        details: `Notification sent to ${notificationCase.reporterName}: ${notificationMessage}`,
      });

      toast.success('Notification sent to resident');
      setShowNotificationModal(false);
      setNotificationCase(null);
      setNotificationMessage('');
    } catch (err) {
      toast.error('Failed to send notification');
    }
  };

  const handleDelete = async (blotterCase: any) => {
    if (!confirm('Are you sure you want to delete this case?')) return;

    try {
      await deleteDocument('blotter_reports', blotterCase.id);
      toast.success(`Case #${blotterCase.caseNumber} deleted`);
    } catch (err) {
      toast.error('Failed to delete case');
    }
  };

  const filteredCases = casesWithNumbers.filter((c: any) =>
    statusFilter === 'all' ? true : c.status === statusFilter
  );

  const stats = {
    reported: casesWithNumbers.filter((c: any) => c.status === 'reported').length,
    investigating: casesWithNumbers.filter((c: any) => c.status === 'investigating').length,
    resolved: casesWithNumbers.filter((c: any) => c.status === 'resolved').length,
    closed: casesWithNumbers.filter((c: any) => c.status === 'closed').length,
  };

  if (loading) {
    return (
      <>
        <PortalHeader title="Blotter Management" description="Track and manage incident reports" />
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
      <PortalHeader title="Blotter Management" description="Track and manage incident reports" />
      
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Reported', value: stats.reported, color: 'bg-destructive/10 text-destructive' },
            { label: 'Investigating', value: stats.investigating, color: 'bg-amber-100 text-amber-700' },
            { label: 'Resolved', value: stats.resolved, color: 'bg-blue-100 text-blue-700' },
            { label: 'Closed', value: stats.closed, color: 'bg-primary/10 text-primary' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.color} rounded-lg p-4 text-center`}>
              <p className="text-sm font-medium opacity-75">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto mb-6 pb-2">
          {['all', 'reported', 'investigating', 'resolved', 'closed'].map((status) => (
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

        {/* Cases Table */}
        {filteredCases.length === 0 ? (
          <Card className="p-12 text-center border-primary/20">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No cases found</p>
          </Card>
        ) : (
          <Card className="overflow-hidden border-primary/20">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Case #</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Incident Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Location</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Reported By</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Severity</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Processed By</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCases.map((blotterCase: any) => (
                    <tr key={blotterCase.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono font-semibold text-foreground">#{blotterCase.caseNumber}</td>
                      <td className="px-6 py-4 text-sm text-foreground font-medium">{blotterCase.incidentType}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{blotterCase.location}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{blotterCase.reporterName}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          blotterCase.severity === 'high' ? 'bg-destructive/10 text-destructive' :
                          blotterCase.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-primary/10 text-primary'
                        }`}>
                          {blotterCase.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          blotterCase.status === 'reported'
                            ? 'bg-destructive/10 text-destructive'
                            : blotterCase.status === 'investigating'
                            ? 'bg-amber-100 text-amber-700'
                            : blotterCase.status === 'resolved'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-primary/10 text-primary'
                        }`}>
                          {blotterCase.status.charAt(0).toUpperCase() + blotterCase.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {blotterCase.handledBy ? (
                          <div>
                            <p className="text-foreground font-medium">{blotterCase.handledBy}</p>
                            {blotterCase.handledAt && (
                              <p className="text-xs text-muted-foreground">
                                {new Date(blotterCase.handledAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">Not yet assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewCase(blotterCase)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedCase(blotterCase)}
                        >
                          Update
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleNotifyResident(blotterCase)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Bell className="w-4 h-4" />
                        </Button>
                        <button
                          onClick={() => handleDelete(blotterCase)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* View Case Modal */}
        {viewCase && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-8 max-w-2xl w-full animate-scaleIn max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Blotter Report Details</h2>
                <button onClick={() => setViewCase(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Case Number</p>
                    <p className="font-mono font-semibold text-foreground">#{viewCase.caseNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      viewCase.status === 'reported' ? 'bg-destructive/10 text-destructive' :
                      viewCase.status === 'investigating' ? 'bg-amber-100 text-amber-700' :
                      viewCase.status === 'resolved' ? 'bg-blue-100 text-blue-700' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {viewCase.status}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Incident Type</p>
                  <p className="font-semibold text-foreground">{viewCase.incidentType}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="font-semibold text-foreground">{viewCase.title}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-foreground bg-muted p-3 rounded-lg">{viewCase.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="text-foreground">{viewCase.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Severity</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      viewCase.severity === 'high' ? 'bg-destructive/10 text-destructive' :
                      viewCase.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {viewCase.severity}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Reported By</p>
                    <p className="text-foreground">{viewCase.reporterName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date Reported</p>
                    <p className="text-foreground">{formatTimestamp(viewCase.createdAt)}</p>
                  </div>
                </div>

                {viewCase.handledBy && (
                  <div>
                    <p className="text-sm text-muted-foreground">Processed By</p>
                    <p className="text-foreground font-medium">{viewCase.handledBy}</p>
                    {viewCase.handledAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Processed on: {new Date(viewCase.handledAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {viewCase.handlerNotes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Handler Notes</p>
                    <p className="text-foreground bg-muted p-3 rounded-lg">{viewCase.handlerNotes}</p>
                  </div>
                )}
              </div>

              <Button onClick={() => setViewCase(null)} className="w-full mt-6">
                Close
              </Button>
            </Card>
          </div>
        )}

        {/* Update Modal */}
        {selectedCase && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-8 max-w-md w-full animate-scaleIn">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-foreground">Update Case Status</h2>
                <button onClick={() => setSelectedCase(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Case #<strong className="text-foreground">{selectedCase.caseNumber}</strong> - {selectedCase.incidentType}</p>
                <p className="text-sm text-muted-foreground">Reporter: <strong className="text-foreground">{selectedCase.reporterName}</strong></p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">New Status</label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Select status</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Handler Notes</label>
                  <textarea
                    value={handlerNotes}
                    onChange={(e) => setHandlerNotes(e.target.value)}
                    placeholder="Add investigation notes..."
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCase(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateStatus}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={!updateStatus}
                  >
                    Update & Notify
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Notification Modal */}
        {showNotificationModal && notificationCase && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-8 max-w-md w-full animate-scaleIn">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-foreground">Notify Resident</h2>
                <button onClick={() => setShowNotificationModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Case #<strong className="text-foreground">{notificationCase.caseNumber}</strong></p>
                <p className="text-sm text-muted-foreground">Resident: <strong className="text-foreground">{notificationCase.reporterName}</strong></p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Notification Message
                  </label>
                  <textarea
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    placeholder="Example: Please visit the barangay hall for a meeting regarding your blotter report #1. We are currently investigating your case. Thank you."
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    rows={5}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    This notification will be sent to the resident's notification center
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowNotificationModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={sendNotification}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={!notificationMessage}
                  >
                    Send Notification
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}