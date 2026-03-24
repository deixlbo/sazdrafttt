'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  AlertTriangle, 
  Plus,
  MapPin,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  Sparkles
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
import { mockBlotterCases, puroks } from '@/lib/mock-data';
import { toast } from 'sonner';

// Dynamic import for Leaflet
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
const useMapEvents = dynamic(
  () => import('react-leaflet').then((mod) => mod.useMapEvents),
  { ssr: false }
) as any;

const statusColors: Record<string, string> = {
  'reported': 'bg-red-100 text-red-700',
  'investigating': 'bg-yellow-100 text-yellow-700',
  'mediation': 'bg-blue-100 text-blue-700',
  'resolved': 'bg-green-100 text-green-700',
  'escalated': 'bg-purple-100 text-purple-700',
};

const incidentTypes = [
  'Noise Complaint',
  'Property Dispute',
  'Physical Altercation',
  'Theft',
  'Trespassing',
  'Verbal Abuse',
  'Damage to Property',
  'Domestic Issue',
  'Lost Item',
  'Found Item',
  'Animal Complaint',
  'Traffic Incident',
  'Other',
];

function LocationMarker({ position, setPosition }: { position: [number, number] | null; setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e: any) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : <Marker position={position} />;
}

export default function ResidentBlotterPage() {
  const [cases, setCases] = useState(mockBlotterCases.slice(0, 5)); // User's cases
  const [showForm, setShowForm] = useState(false);
  const [selectedCase, setSelectedCase] = useState<typeof mockBlotterCases[0] | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const [aiSeverity, setAiSeverity] = useState<'low' | 'medium' | 'high' | null>(null);
  
  const [newReport, setNewReport] = useState({
    incidentType: '',
    date: '',
    time: '',
    location: '',
    description: '',
    narrative: '',
    respondent: '',
    witnesses: '',
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const mapCenter: [number, number] = [15.1950, 119.8700];

  const handleDescriptionChange = (value: string) => {
    setNewReport({ ...newReport, narrative: value });

    const highKeywords = ['violence', 'injury', 'assault', 'robbery', 'theft', 'accident', 'hurt', 'harm', 'fight', 'attack', 'threat', 'weapon', 'blood'];
    const mediumKeywords = ['noise', 'disturbance', 'property', 'damage', 'dispute', 'argument', 'trespass', 'vandalism', 'harassment'];

    const text = value.toLowerCase();
    if (highKeywords.some(keyword => text.includes(keyword))) {
      setAiSeverity('high');
    } else if (mediumKeywords.some(keyword => text.includes(keyword))) {
      setAiSeverity('medium');
    } else if (text.length > 20) {
      setAiSeverity('low');
    } else {
      setAiSeverity(null);
    }
  };

  const handleSubmit = () => {
    if (!newReport.incidentType || !newReport.narrative || !newReport.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newCase = {
      id: `BLT-${String(cases.length + 31).padStart(4, '0')}`,
      incidentType: newReport.incidentType,
      location: newReport.location,
      coordinates: markerPosition ? { lat: markerPosition[0], lng: markerPosition[1] } : undefined,
      reportedBy: 'You',
      reportedById: 'current-user',
      respondent: newReport.respondent || undefined,
      status: 'reported' as const,
      date: newReport.date || new Date().toISOString().split('T')[0],
      time: newReport.time || new Date().toTimeString().slice(0, 5),
      description: newReport.narrative.slice(0, 100),
      narrative: newReport.narrative,
      witnesses: newReport.witnesses ? newReport.witnesses.split(',').map(w => w.trim()) : [],
      notifyParties: true,
    };

    setCases([newCase, ...cases]);
    toast.success('Blotter report submitted successfully');
    setShowForm(false);
    setNewReport({
      incidentType: '', date: '', time: '', location: '',
      description: '', narrative: '', respondent: '', witnesses: '',
    });
    setMarkerPosition(null);
    setAiSeverity(null);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blotter Report</h1>
          <p className="text-sm text-muted-foreground mt-1">File and track your incident reports</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="bg-red-600 hover:bg-red-700">
            <Plus className="w-4 h-4 mr-2" />
            File a Report
          </Button>
        )}
      </div>

      {/* Report Form */}
      {showForm && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              File a Blotter Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Incident Type *</Label>
                <Select value={newReport.incidentType} onValueChange={(v) => setNewReport({...newReport, incidentType: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {incidentTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Location *</Label>
                <Select value={newReport.location} onValueChange={(v) => setNewReport({...newReport, location: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {puroks.map(purok => (
                      <SelectItem key={purok} value={purok}>{purok}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Date of Incident</Label>
                <Input 
                  type="date"
                  value={newReport.date}
                  onChange={(e) => setNewReport({...newReport, date: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Time of Incident</Label>
                <Input 
                  type="time"
                  value={newReport.time}
                  onChange={(e) => setNewReport({...newReport, time: e.target.value})}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Respondent (if known)</Label>
              <Input 
                value={newReport.respondent}
                onChange={(e) => setNewReport({...newReport, respondent: e.target.value})}
                placeholder="Name of person involved"
              />
            </div>

            <div className="grid gap-2">
              <Label>Witnesses (comma-separated)</Label>
              <Input 
                value={newReport.witnesses}
                onChange={(e) => setNewReport({...newReport, witnesses: e.target.value})}
                placeholder="e.g., Juan Dela Cruz, Maria Santos"
              />
            </div>

            <div className="grid gap-2">
              <Label>Detailed Narrative *</Label>
              <Textarea 
                value={newReport.narrative}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder="Describe the incident in detail. Include what happened, when, where, and who was involved..."
                rows={6}
              />
            </div>

            {aiSeverity && (
              <div className={`p-4 rounded-lg flex items-start gap-3 ${
                aiSeverity === 'high' ? 'bg-red-50 border border-red-200' :
                aiSeverity === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
                'bg-green-50 border border-green-200'
              }`}>
                <Sparkles className={`w-5 h-5 flex-shrink-0 ${
                  aiSeverity === 'high' ? 'text-red-600' :
                  aiSeverity === 'medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`} />
                <div>
                  <p className={`font-semibold text-sm ${
                    aiSeverity === 'high' ? 'text-red-700' :
                    aiSeverity === 'medium' ? 'text-yellow-700' :
                    'text-green-700'
                  }`}>
                    {aiSeverity === 'high' ? 'High Priority - Immediate Attention Required' :
                     aiSeverity === 'medium' ? 'Medium Priority - Requires Follow-up' :
                     'Low Priority - Routine Report'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on your description, this incident has been classified automatically.
                  </p>
                </div>
              </div>
            )}

            {/* Map for pinning location */}
            {isClient && (
              <div className="grid gap-2">
                <Label>Pin Exact Location (click on map)</Label>
                <div className="h-64 rounded-lg overflow-hidden border">
                  <link
                    rel="stylesheet"
                    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                  />
                  <MapContainer
                    center={mapCenter}
                    zoom={14}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {markerPosition && <Marker position={markerPosition} />}
                  </MapContainer>
                </div>
                {markerPosition && (
                  <p className="text-xs text-muted-foreground">
                    Location: {markerPosition[0].toFixed(4)}, {markerPosition[1].toFixed(4)}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => {
                setShowForm(false);
                setNewReport({
                  incidentType: '', date: '', time: '', location: '',
                  description: '', narrative: '', respondent: '', witnesses: '',
                });
                setMarkerPosition(null);
                setAiSeverity(null);
              }}>
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-700" 
                onClick={handleSubmit}
                disabled={!newReport.incidentType || !newReport.narrative || !newReport.location}
              >
                Submit Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {cases.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No reports filed yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cases.map((caseItem) => (
                <div 
                  key={caseItem.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedCase(caseItem)}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-mono text-sm text-muted-foreground">{caseItem.id}</span>
                    <Badge className={statusColors[caseItem.status]}>
                      {caseItem.status === 'resolved' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {caseItem.status === 'investigating' && <Clock className="w-3 h-3 mr-1" />}
                      {caseItem.status}
                    </Badge>
                  </div>
                  <h3 className="font-semibold">{caseItem.incidentType}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{caseItem.description}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {caseItem.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {caseItem.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Case Detail Dialog */}
      <Dialog open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
          </DialogHeader>
          {selectedCase && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{selectedCase.id}</span>
                <Badge className={statusColors[selectedCase.status]}>{selectedCase.status}</Badge>
              </div>

              <div>
                <h3 className="font-semibold text-lg">{selectedCase.incidentType}</h3>
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
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Narrative</p>
                <p className="text-sm p-3 bg-muted/50 rounded-lg">{selectedCase.narrative}</p>
              </div>

              {selectedCase.assignedTo && (
                <div className="p-3 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Assigned To</p>
                  <p className="font-medium text-primary">{selectedCase.assignedTo}</p>
                </div>
              )}

              {selectedCase.resolution && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-muted-foreground">Resolution</p>
                  <p className="font-medium text-green-700">{selectedCase.resolution}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
