'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  AlertTriangle, 
  Search, 
  Filter,
  Eye,
  Bell,
  MapPin,
  Calendar,
  User,
  FileText,
  CheckCircle,
  Clock,
  Send
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { mockBlotterCases, mockOfficials } from '@/lib/mock-data';
import { toast } from 'sonner';

// Dynamic import for Leaflet (client-side only)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

const statusColors: Record<string, string> = {
  'reported': 'bg-red-100 text-red-700 border-red-200',
  'investigating': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'mediation': 'bg-blue-100 text-blue-700 border-blue-200',
  'resolved': 'bg-green-100 text-green-700 border-green-200',
  'escalated': 'bg-purple-100 text-purple-700 border-purple-200',
};

export default function OfficialBlotterPage() {
  const [cases, setCases] = useState(mockBlotterCases);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCase, setSelectedCase] = useState<typeof mockBlotterCases[0] | null>(null);
  const [updateCase, setUpdateCase] = useState<typeof mockBlotterCases[0] | null>(null);
  const [notifyCase, setNotifyCase] = useState<typeof mockBlotterCases[0] | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [resolution, setResolution] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.incidentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.reportedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    reported: cases.filter(c => c.status === 'reported').length,
    investigating: cases.filter(c => c.status === 'investigating').length,
    mediation: cases.filter(c => c.status === 'mediation').length,
    resolved: cases.filter(c => c.status === 'resolved').length,
  };

  const handleUpdateStatus = () => {
    if (!updateCase || !newStatus) return;
    
    setCases(prev => prev.map(c => 
      c.id === updateCase.id 
        ? { ...c, status: newStatus as typeof c.status, resolution: resolution || c.resolution, assignedTo: mockOfficials[0].name }
        : c
    ));
    
    toast.success(`Case ${updateCase.id} updated to ${newStatus}`);
    setUpdateCase(null);
    setNewStatus('');
    setResolution('');
  };

  const handleNotify = () => {
    if (!notifyCase || !notifyMessage) return;
    
    toast.success(`Notification sent to ${notifyCase.reportedBy}`);
    setNotifyCase(null);
    setNotifyMessage('');
  };

  // Map center (Barangay Santiago)
  const mapCenter: [number, number] = [15.1950, 119.8700];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blotter Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and manage incident reports</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowMap(!showMap)}
        >
          <MapPin className="w-4 h-4 mr-2" />
          {showMap ? 'Hide Map' : 'Show Map'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Reported</p>
            <p className="text-2xl font-bold">{stats.reported}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Investigating</p>
            <p className="text-2xl font-bold">{stats.investigating}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Mediation</p>
            <p className="text-2xl font-bold">{stats.mediation}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Resolved</p>
            <p className="text-2xl font-bold">{stats.resolved}</p>
          </CardContent>
        </Card>
      </div>

      {/* Map View */}
      {showMap && isClient && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Incident Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 rounded-lg overflow-hidden border">
              <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                crossOrigin=""
              />
              <MapContainer
                center={mapCenter}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {cases.filter(c => c.coordinates).map(c => (
                  <Marker
                    key={c.id}
                    position={[c.coordinates!.lat, c.coordinates!.lng]}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold">{c.incidentType}</p>
                        <p className="text-muted-foreground">{c.location}</p>
                        <Badge className={`${statusColors[c.status]} mt-1`}>{c.status}</Badge>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search cases by ID, type, location, reporter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="reported">Reported</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="mediation">Mediation</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cases List */}
      <div className="grid gap-4">
        {filteredCases.map((blotterCase) => (
          <Card key={blotterCase.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-mono text-sm text-muted-foreground">{blotterCase.id}</span>
                    <Badge className={statusColors[blotterCase.status]} variant="outline">
                      {blotterCase.status}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg">{blotterCase.incidentType}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{blotterCase.narrative}</p>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {blotterCase.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {blotterCase.reportedBy}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {blotterCase.date} {blotterCase.time}
                    </span>
                  </div>

                  {blotterCase.assignedTo && (
                    <p className="text-xs text-primary mt-2">Assigned to: {blotterCase.assignedTo}</p>
                  )}
                </div>
                
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm" onClick={() => setSelectedCase(blotterCase)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setUpdateCase(blotterCase)}>
                    Update
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setNotifyCase(blotterCase)}>
                    <Bell className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCases.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No cases found matching your criteria</p>
        </div>
      )}

      {/* View Case Dialog */}
      <Dialog open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Case Details</DialogTitle>
          </DialogHeader>
          {selectedCase && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{selectedCase.id}</span>
                <Badge className={statusColors[selectedCase.status]}>{selectedCase.status}</Badge>
              </div>

              <div>
                <h3 className="text-lg font-semibold">{selectedCase.incidentType}</h3>
                {selectedCase.respondent && (
                  <p className="text-sm text-muted-foreground">Respondent: {selectedCase.respondent}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground">Date & Time</p>
                  <p className="font-medium">{selectedCase.date} {selectedCase.time}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedCase.location}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground">Reported By</p>
                  <p className="font-medium">{selectedCase.reportedBy}</p>
                </div>
                {selectedCase.assignedTo && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground">Assigned To</p>
                    <p className="font-medium">{selectedCase.assignedTo}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Narrative</p>
                <p className="text-sm p-3 bg-muted/50 rounded-lg">{selectedCase.narrative}</p>
              </div>

              {selectedCase.witnesses.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Witnesses</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedCase.witnesses.map((w, i) => (
                      <Badge key={i} variant="outline">{w}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedCase.resolution && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Resolution</p>
                  <p className="text-sm p-3 bg-green-50 rounded-lg text-green-700">{selectedCase.resolution}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={!!updateCase} onOpenChange={() => setUpdateCase(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Case Status</DialogTitle>
          </DialogHeader>
          {updateCase && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="font-medium">{updateCase.id}</p>
                <p className="text-sm text-muted-foreground">{updateCase.incidentType}</p>
              </div>

              <div className="grid gap-2">
                <Label>New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="mediation">Mediation</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="escalated">Escalated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Resolution Notes (if resolved)</Label>
                <Textarea 
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Enter resolution details..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setUpdateCase(null)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleUpdateStatus} disabled={!newStatus}>
                  Update Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Notify Parties Dialog */}
      <Dialog open={!!notifyCase} onOpenChange={() => setNotifyCase(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
          </DialogHeader>
          {notifyCase && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Notify parties involved in:</p>
                <p className="font-medium">{notifyCase.id} - {notifyCase.incidentType}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Recipients:</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{notifyCase.reportedBy}</Badge>
                  {notifyCase.respondent && (
                    <Badge variant="outline">{notifyCase.respondent}</Badge>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Message</Label>
                <Textarea 
                  value={notifyMessage}
                  onChange={(e) => setNotifyMessage(e.target.value)}
                  placeholder="Enter notification message..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setNotifyCase(null)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleNotify} disabled={!notifyMessage}>
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
