'use client';

import { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter,
  FileText,
  Scale,
  Gavel,
  Download,
  Plus,
  Calendar,
  User,
  Eye,
  Printer
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { mockOrdinances, mockOfficials } from '@/lib/mock-data';

const typeIcons: Record<string, React.ElementType> = {
  'Ordinance': Scale,
  'Resolution': FileText,
  'Executive Order': Gavel,
};

const statusColors: Record<string, string> = {
  'Active': 'bg-green-100 text-green-700 border-green-200',
  'Amended': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Repealed': 'bg-red-100 text-red-700 border-red-200',
};

const typeColors: Record<string, string> = {
  'Ordinance': 'bg-blue-100 text-blue-700',
  'Resolution': 'bg-purple-100 text-purple-700',
  'Executive Order': 'bg-orange-100 text-orange-700',
};

export default function OrdinancesPage() {
  const [ordinances, setOrdinances] = useState(mockOrdinances);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrdinance, setSelectedOrdinance] = useState<typeof mockOrdinances[0] | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newOrdinance, setNewOrdinance] = useState({
    number: '',
    title: '',
    type: '',
    author: '',
    summary: '',
    fullText: '',
  });

  const types = ['Ordinance', 'Resolution', 'Executive Order'];
  const statuses = ['Active', 'Amended', 'Repealed'];

  const filteredOrdinances = ordinances.filter(ord => {
    const matchesSearch = 
      ord.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || ord.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || ord.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    ordinances: ordinances.filter(o => o.type === 'Ordinance').length,
    resolutions: ordinances.filter(o => o.type === 'Resolution').length,
    executiveOrders: ordinances.filter(o => o.type === 'Executive Order').length,
    active: ordinances.filter(o => o.status === 'Active').length,
  };

  const handleAddOrdinance = () => {
    const ord = {
      id: `ORD-${String(ordinances.length + 1).padStart(3, '0')}`,
      number: newOrdinance.number,
      title: newOrdinance.title,
      type: newOrdinance.type as typeof mockOrdinances[0]['type'],
      dateEnacted: new Date().toISOString().split('T')[0],
      author: newOrdinance.author,
      status: 'Active' as const,
      summary: newOrdinance.summary,
      fullText: newOrdinance.fullText,
    };
    setOrdinances([ord, ...ordinances]);
    setIsAddDialogOpen(false);
    setNewOrdinance({ number: '', title: '', type: '', author: '', summary: '', fullText: '' });
  };

  const handlePrint = (ordinance: typeof mockOrdinances[0]) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${ordinance.number} - ${ordinance.title}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { font-size: 18px; margin: 0; }
            .header h2 { font-size: 14px; margin: 10px 0; font-weight: normal; }
            .content { white-space: pre-wrap; text-align: justify; }
            .footer { margin-top: 50px; }
            .signature { margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>REPUBLIC OF THE PHILIPPINES</h1>
            <h2>Province of Zambales</h2>
            <h2>Municipality of San Felipe</h2>
            <h2>BARANGAY SANTIAGO</h2>
            <hr style="margin: 20px 0;">
            <h1>${ordinance.type.toUpperCase()} NO. ${ordinance.number.split('-').pop()}</h1>
            <h2>${ordinance.title}</h2>
          </div>
          <div class="content">${ordinance.fullText}</div>
          <div class="footer">
            <p>Enacted: ${ordinance.dateEnacted}</p>
            <p>Author: ${ordinance.author}</p>
            <div class="signature">
              <p>_________________________</p>
              <p>HON. ROBERTO CRUZ</p>
              <p>Punong Barangay</p>
            </div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const downloadPDF = (ordinance: typeof mockOrdinances[0]) => {
    // Create text content for download
    const content = `
${ordinance.type.toUpperCase()} NO. ${ordinance.number}
${ordinance.title}

Enacted: ${ordinance.dateEnacted}
Author: ${ordinance.author}
Status: ${ordinance.status}

SUMMARY:
${ordinance.summary}

FULL TEXT:
${ordinance.fullText}

---
Barangay Santiago
San Felipe, Zambales
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${ordinance.number}.txt`;
    link.click();
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ordinances & Resolutions</h1>
          <p className="text-sm text-muted-foreground mt-1">Repository of barangay laws, resolutions, and executive orders</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Ordinance/Resolution</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Select value={newOrdinance.type} onValueChange={(v) => setNewOrdinance({...newOrdinance, type: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Number</Label>
                  <Input 
                    value={newOrdinance.number}
                    onChange={(e) => setNewOrdinance({...newOrdinance, number: e.target.value})}
                    placeholder="e.g., BO-2026-006"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input 
                  value={newOrdinance.title}
                  onChange={(e) => setNewOrdinance({...newOrdinance, title: e.target.value})}
                  placeholder="Full title of the ordinance"
                />
              </div>
              <div className="grid gap-2">
                <Label>Author</Label>
                <Select value={newOrdinance.author} onValueChange={(v) => setNewOrdinance({...newOrdinance, author: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select author" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockOfficials.map(off => (
                      <SelectItem key={off.id} value={off.name}>{off.name}</SelectItem>
                    ))}
                    <SelectItem value="Barangay Council">Barangay Council</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Summary</Label>
                <Textarea 
                  value={newOrdinance.summary}
                  onChange={(e) => setNewOrdinance({...newOrdinance, summary: e.target.value})}
                  placeholder="Brief summary of the ordinance"
                  rows={2}
                />
              </div>
              <div className="grid gap-2">
                <Label>Full Text</Label>
                <Textarea 
                  value={newOrdinance.fullText}
                  onChange={(e) => setNewOrdinance({...newOrdinance, fullText: e.target.value})}
                  placeholder="Complete text of the ordinance..."
                  rows={6}
                />
              </div>
              <Button onClick={handleAddOrdinance} disabled={!newOrdinance.number || !newOrdinance.title || !newOrdinance.type}>
                Add Ordinance
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ordinances</p>
                <p className="text-2xl font-bold">{stats.ordinances}</p>
              </div>
              <Scale className="w-8 h-8 text-blue-500/60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolutions</p>
                <p className="text-2xl font-bold">{stats.resolutions}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500/60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Executive Orders</p>
                <p className="text-2xl font-bold">{stats.executiveOrders}</p>
              </div>
              <Gavel className="w-8 h-8 text-orange-500/60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <BookOpen className="w-8 h-8 text-green-500/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search ordinances, resolutions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {types.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statuses.map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Ordinances List */}
      <div className="grid gap-4">
        {filteredOrdinances.map((ordinance) => {
          const Icon = typeIcons[ordinance.type] || BookOpen;
          return (
            <Card 
              key={ordinance.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    ordinance.type === 'Ordinance' ? 'bg-blue-100' :
                    ordinance.type === 'Resolution' ? 'bg-purple-100' : 'bg-orange-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      ordinance.type === 'Ordinance' ? 'text-blue-600' :
                      ordinance.type === 'Resolution' ? 'text-purple-600' : 'text-orange-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-muted-foreground">{ordinance.number}</span>
                      <Badge className={typeColors[ordinance.type]}>{ordinance.type}</Badge>
                      <Badge className={statusColors[ordinance.status]} variant="outline">{ordinance.status}</Badge>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{ordinance.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{ordinance.summary}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {ordinance.dateEnacted}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {ordinance.author}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedOrdinance(ordinance)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadPDF(ordinance)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePrint(ordinance)}
                    >
                      <Printer className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredOrdinances.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No ordinances found matching your criteria</p>
        </div>
      )}

      {/* Ordinance Detail Dialog */}
      <Dialog open={!!selectedOrdinance} onOpenChange={() => setSelectedOrdinance(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="font-mono text-sm text-muted-foreground">{selectedOrdinance?.number}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedOrdinance && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className={typeColors[selectedOrdinance.type]}>{selectedOrdinance.type}</Badge>
                <Badge className={statusColors[selectedOrdinance.status]} variant="outline">{selectedOrdinance.status}</Badge>
              </div>
              
              <h2 className="text-xl font-semibold">{selectedOrdinance.title}</h2>
              
              <div className="grid grid-cols-2 gap-4 text-sm p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-muted-foreground">Date Enacted</p>
                  <p className="font-medium">{selectedOrdinance.dateEnacted}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Author</p>
                  <p className="font-medium">{selectedOrdinance.author}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Summary</p>
                <p className="text-sm">{selectedOrdinance.summary}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Full Text</p>
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <pre className="whitespace-pre-wrap text-sm font-mono">{selectedOrdinance.fullText}</pre>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => downloadPDF(selectedOrdinance)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" onClick={() => handlePrint(selectedOrdinance)}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
