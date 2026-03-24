'use client';

import { useState } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Users, 
  Phone, 
  AlertTriangle,
  Building,
  Droplets,
  Mountain,
  Waves,
  FileText,
  Download,
  Plus,
  Search,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  mockEvacuationCenters, 
  mockHazardZones, 
  mockCalamityRelief, 
  mockEmergencyContacts, 
  mockResponsePlans 
} from '@/lib/mock-data';

const hazardIcons: Record<string, React.ElementType> = {
  'Flood': Droplets,
  'Landslide': Mountain,
  'Storm Surge': Waves,
  'Fire': AlertTriangle,
  'Earthquake': AlertTriangle,
};

const riskColors: Record<string, string> = {
  'High': 'bg-red-100 text-red-700 border-red-200',
  'Medium': 'bg-orange-100 text-orange-700 border-orange-200',
  'Low': 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

const statusColors: Record<string, string> = {
  'available': 'bg-green-100 text-green-700',
  'standby': 'bg-yellow-100 text-yellow-700',
  'occupied': 'bg-blue-100 text-blue-700',
  'full': 'bg-red-100 text-red-700',
};

export default function DRRMPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCenter, setSelectedCenter] = useState<typeof mockEvacuationCenters[0] | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<typeof mockResponsePlans[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const totalCapacity = mockEvacuationCenters.reduce((sum, c) => sum + c.capacity, 0);
  const totalOccupancy = mockEvacuationCenters.reduce((sum, c) => sum + c.currentOccupancy, 0);

  const exportReport = () => {
    const report = `DRRM REPORT - BARANGAY SANTIAGO
================================
Generated: ${new Date().toLocaleDateString()}

EVACUATION CENTERS
${mockEvacuationCenters.map(c => `- ${c.name}: ${c.capacity} capacity, Status: ${c.status}`).join('\n')}

HAZARD ZONES
${mockHazardZones.map(h => `- ${h.type} (${h.riskLevel} Risk): ${h.affectedPuroks.join(', ')}`).join('\n')}

EMERGENCY CONTACTS
${mockEmergencyContacts.map(c => `- ${c.name}: ${c.number}`).join('\n')}
`;
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'drrm-report.txt';
    link.click();
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Disaster Risk Reduction & Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Evacuation centers, hazard mapping, and emergency response</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportReport}>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Evacuation Centers</p>
                <p className="text-2xl font-bold">{mockEvacuationCenters.length}</p>
              </div>
              <Building className="w-8 h-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Capacity</p>
                <p className="text-2xl font-bold">{totalCapacity.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-green-500/60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hazard Zones</p>
                <p className="text-2xl font-bold">{mockHazardZones.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500/60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Response Plans</p>
                <p className="text-2xl font-bold">{mockResponsePlans.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
          <TabsTrigger value="overview" className="text-xs md:text-sm py-2">Overview</TabsTrigger>
          <TabsTrigger value="evacuation" className="text-xs md:text-sm py-2">Evacuation</TabsTrigger>
          <TabsTrigger value="hazards" className="text-xs md:text-sm py-2">Hazards</TabsTrigger>
          <TabsTrigger value="contacts" className="text-xs md:text-sm py-2">Contacts</TabsTrigger>
          <TabsTrigger value="plans" className="text-xs md:text-sm py-2">Response Plans</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Map Placeholder */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Hazard Map - Barangay Santiago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-64 md:h-80 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border overflow-hidden">
                  {/* Simplified map visualization */}
                  <div className="absolute inset-4 border-2 border-dashed border-primary/30 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground">Barangay Santiago</p>
                      <p className="text-xs text-muted-foreground">Hazard Zone Map</p>
                    </div>
                  </div>
                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 bg-white/90 rounded-lg p-3 shadow-sm">
                    <p className="text-xs font-semibold mb-2">Legend</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        High Risk
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                        Medium Risk
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        Evacuation Center
                      </div>
                    </div>
                  </div>
                  {/* Hazard indicators */}
                  {mockHazardZones.map((zone, i) => (
                    <div
                      key={zone.id}
                      className={`absolute w-8 h-8 rounded-full flex items-center justify-center ${
                        zone.riskLevel === 'High' ? 'bg-red-500' : 'bg-orange-500'
                      } text-white shadow-lg`}
                      style={{
                        top: `${20 + i * 25}%`,
                        left: `${30 + i * 20}%`,
                      }}
                      title={`${zone.type} - ${zone.riskLevel} Risk`}
                    >
                      {(() => {
                        const Icon = hazardIcons[zone.type] || AlertTriangle;
                        return <Icon className="w-4 h-4" />;
                      })()}
                    </div>
                  ))}
                  {/* Evacuation center indicators */}
                  {mockEvacuationCenters.map((center, i) => (
                    <div
                      key={center.id}
                      className="absolute w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg"
                      style={{
                        top: `${40 + i * 15}%`,
                        right: `${20 + i * 10}%`,
                      }}
                      title={center.name}
                    >
                      <Building className="w-3 h-3" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Emergency Hotlines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {mockEmergencyContacts.slice(0, 4).map(contact => (
                  <div key={contact.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{contact.name}</span>
                    </div>
                    <a href={`tel:${contact.number}`} className="text-sm font-bold text-primary">{contact.number}</a>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Active Hazards */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Active Hazard Zones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {mockHazardZones.map(zone => {
                  const Icon = hazardIcons[zone.type] || AlertTriangle;
                  return (
                    <div key={zone.id} className="flex items-start gap-3 p-2 bg-muted/50 rounded-lg">
                      <div className={`p-2 rounded-lg ${zone.riskLevel === 'High' ? 'bg-red-100' : 'bg-orange-100'}`}>
                        <Icon className={`w-4 h-4 ${zone.riskLevel === 'High' ? 'text-red-600' : 'text-orange-600'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{zone.type}</span>
                          <Badge className={riskColors[zone.riskLevel]} variant="outline">{zone.riskLevel}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{zone.affectedPuroks.join(', ')}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Evacuation Centers Tab */}
        <TabsContent value="evacuation" className="space-y-4">
          <div className="grid gap-4">
            {mockEvacuationCenters.map(center => (
              <Card 
                key={center.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedCenter(center)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold">{center.name}</h3>
                        <Badge className={statusColors[center.status]}>{center.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {center.address}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {center.facilities.slice(0, 3).map(f => (
                          <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                        ))}
                        {center.facilities.length > 3 && (
                          <Badge variant="outline" className="text-xs">+{center.facilities.length - 3}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Capacity</p>
                      <p className="text-xl font-bold text-primary">{center.capacity}</p>
                      <p className="text-xs text-muted-foreground">Current: {center.currentOccupancy}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Hazards Tab */}
        <TabsContent value="hazards" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {mockHazardZones.map(zone => {
              const Icon = hazardIcons[zone.type] || AlertTriangle;
              return (
                <Card key={zone.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${zone.riskLevel === 'High' ? 'bg-red-100' : 'bg-orange-100'}`}>
                        <Icon className={`w-6 h-6 ${zone.riskLevel === 'High' ? 'text-red-600' : 'text-orange-600'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{zone.type} Zone</h3>
                          <Badge className={riskColors[zone.riskLevel]}>{zone.riskLevel} Risk</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{zone.description}</p>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Affected Areas:</p>
                          <div className="flex flex-wrap gap-1">
                            {zone.affectedPuroks.map(purok => (
                              <Badge key={purok} variant="outline" className="text-xs">{purok}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Emergency Contacts Tab */}
        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {mockEmergencyContacts.map(contact => (
                  <div key={contact.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <Badge variant="outline" className="text-xs mt-1">{contact.type}</Badge>
                      </div>
                    </div>
                    <a 
                      href={`tel:${contact.number}`}
                      className="text-lg font-bold text-primary hover:underline"
                    >
                      {contact.number}
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Response Plans Tab */}
        <TabsContent value="plans" className="space-y-4">
          <div className="grid gap-4">
            {mockResponsePlans.map(plan => (
              <Card 
                key={plan.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedPlan(plan)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        {(() => {
                          const Icon = hazardIcons[plan.type] || ShieldAlert;
                          return <Icon className="w-6 h-6 text-primary" />;
                        })()}
                      </div>
                      <div>
                        <h3 className="font-semibold">{plan.title}</h3>
                        <p className="text-sm text-muted-foreground">{plan.steps.length} steps - Last updated: {plan.lastUpdated}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Evacuation Center Detail Dialog */}
      <Dialog open={!!selectedCenter} onOpenChange={() => setSelectedCenter(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Evacuation Center Details</DialogTitle>
          </DialogHeader>
          {selectedCenter && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedCenter.name}</h3>
                  <Badge className={statusColors[selectedCenter.status]}>{selectedCenter.status}</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Address</p>
                  <p className="font-medium">{selectedCenter.address}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Capacity</p>
                  <p className="font-medium">{selectedCenter.capacity} persons</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Current Occupancy</p>
                  <p className="font-medium">{selectedCenter.currentOccupancy} persons</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Contact Person</p>
                  <p className="font-medium">{selectedCenter.contactPerson}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Contact Number</p>
                  <a href={`tel:${selectedCenter.contactNumber}`} className="font-medium text-primary hover:underline">
                    {selectedCenter.contactNumber}
                  </a>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Facilities</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCenter.facilities.map(facility => (
                    <Badge key={facility} variant="outline">{facility}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Response Plan Detail Dialog */}
      <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPlan?.title}</DialogTitle>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedPlan.type}</Badge>
                <span className="text-sm text-muted-foreground">Last updated: {selectedPlan.lastUpdated}</span>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm font-medium">Response Steps:</p>
                {selectedPlan.steps.map((step, index) => (
                  <div key={index} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-sm">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
