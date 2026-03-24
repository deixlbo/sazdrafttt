'use client';

import { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  Car,
  Monitor,
  Armchair,
  Building,
  Wrench,
  MapPin,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { mockAssets, mockOfficials } from '@/lib/mock-data';

const categoryIcons: Record<string, React.ElementType> = {
  'Vehicle': Car,
  'Equipment': Wrench,
  'Furniture': Armchair,
  'Building': Building,
  'Land': MapPin,
  'IT Equipment': Monitor,
};

const conditionColors: Record<string, string> = {
  'Excellent': 'bg-green-100 text-green-700 border-green-200',
  'Good': 'bg-blue-100 text-blue-700 border-blue-200',
  'Fair': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Poor': 'bg-orange-100 text-orange-700 border-orange-200',
  'For Disposal': 'bg-red-100 text-red-700 border-red-200',
};

export default function AssetsPage() {
  const [assets, setAssets] = useState(mockAssets);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<typeof mockAssets[0] | null>(null);
  const [newAsset, setNewAsset] = useState({
    name: '',
    category: '',
    description: '',
    acquisitionDate: '',
    acquisitionCost: '',
    condition: '',
    location: '',
    accountableOfficer: '',
    serialNumber: '',
    warranty: '',
  });

  const categories = ['Equipment', 'Vehicle', 'Furniture', 'Building', 'Land', 'IT Equipment'];
  const conditions = ['Excellent', 'Good', 'Fair', 'Poor', 'For Disposal'];

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || asset.category === categoryFilter;
    const matchesCondition = conditionFilter === 'all' || asset.condition === conditionFilter;
    return matchesSearch && matchesCategory && matchesCondition;
  });

  const totalValue = assets.reduce((sum, asset) => sum + asset.acquisitionCost, 0);
  const categoryStats = categories.map(cat => ({
    category: cat,
    count: assets.filter(a => a.category === cat).length,
    value: assets.filter(a => a.category === cat).reduce((sum, a) => sum + a.acquisitionCost, 0),
  }));

  const handleAddAsset = () => {
    const asset = {
      id: `AST-${String(assets.length + 1).padStart(3, '0')}`,
      name: newAsset.name,
      category: newAsset.category as typeof mockAssets[0]['category'],
      description: newAsset.description,
      acquisitionDate: newAsset.acquisitionDate,
      acquisitionCost: Number(newAsset.acquisitionCost),
      condition: newAsset.condition as typeof mockAssets[0]['condition'],
      location: newAsset.location,
      accountableOfficer: newAsset.accountableOfficer,
      serialNumber: newAsset.serialNumber || undefined,
      warranty: newAsset.warranty || undefined,
    };
    setAssets([asset, ...assets]);
    setIsAddDialogOpen(false);
    setNewAsset({
      name: '', category: '', description: '', acquisitionDate: '',
      acquisitionCost: '', condition: '', location: '', accountableOfficer: '',
      serialNumber: '', warranty: '',
    });
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Category', 'Description', 'Acquisition Date', 'Cost', 'Condition', 'Location', 'Accountable Officer'];
    const rows = assets.map(a => [a.id, a.name, a.category, a.description, a.acquisitionDate, a.acquisitionCost, a.condition, a.location, a.accountableOfficer]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'barangay-assets.csv';
    link.click();
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Property & Asset Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Inventory of barangay-owned assets and equipment</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Asset</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Asset Name</Label>
                  <Input 
                    value={newAsset.name}
                    onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
                    placeholder="e.g., Office Computer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Category</Label>
                    <Select value={newAsset.category} onValueChange={(v) => setNewAsset({...newAsset, category: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Condition</Label>
                    <Select value={newAsset.condition} onValueChange={(v) => setNewAsset({...newAsset, condition: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map(cond => (
                          <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea 
                    value={newAsset.description}
                    onChange={(e) => setNewAsset({...newAsset, description: e.target.value})}
                    placeholder="Brief description of the asset"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Acquisition Date</Label>
                    <Input 
                      type="date"
                      value={newAsset.acquisitionDate}
                      onChange={(e) => setNewAsset({...newAsset, acquisitionDate: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Acquisition Cost (PHP)</Label>
                    <Input 
                      type="number"
                      value={newAsset.acquisitionCost}
                      onChange={(e) => setNewAsset({...newAsset, acquisitionCost: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Location</Label>
                  <Input 
                    value={newAsset.location}
                    onChange={(e) => setNewAsset({...newAsset, location: e.target.value})}
                    placeholder="e.g., Barangay Hall Office"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Accountable Officer</Label>
                  <Select value={newAsset.accountableOfficer} onValueChange={(v) => setNewAsset({...newAsset, accountableOfficer: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select officer" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockOfficials.map(off => (
                        <SelectItem key={off.id} value={off.name}>{off.name} - {off.position}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Serial Number (Optional)</Label>
                    <Input 
                      value={newAsset.serialNumber}
                      onChange={(e) => setNewAsset({...newAsset, serialNumber: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Warranty Until (Optional)</Label>
                    <Input 
                      type="date"
                      value={newAsset.warranty}
                      onChange={(e) => setNewAsset({...newAsset, warranty: e.target.value})}
                    />
                  </div>
                </div>
                <Button onClick={handleAddAsset} disabled={!newAsset.name || !newAsset.category || !newAsset.condition}>
                  Add Asset
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Assets</p>
                <p className="text-2xl font-bold">{assets.length}</p>
              </div>
              <Package className="w-8 h-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">P{(totalValue / 1000000).toFixed(1)}M</p>
              </div>
              <FileText className="w-8 h-8 text-green-500/60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Good Condition</p>
                <p className="text-2xl font-bold">{assets.filter(a => a.condition === 'Excellent' || a.condition === 'Good').length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500/60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Needs Attention</p>
                <p className="text-2xl font-bold">{assets.filter(a => a.condition === 'Fair' || a.condition === 'Poor').length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Asset Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categoryStats.map(stat => {
              const Icon = categoryIcons[stat.category] || Package;
              return (
                <button
                  key={stat.category}
                  onClick={() => setCategoryFilter(categoryFilter === stat.category ? 'all' : stat.category)}
                  className={`p-3 rounded-lg border text-left transition-all hover:shadow-md ${
                    categoryFilter === stat.category 
                      ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Icon className="w-5 h-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">{stat.category}</p>
                  <p className="font-semibold">{stat.count} items</p>
                  <p className="text-xs text-muted-foreground">P{stat.value.toLocaleString()}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={conditionFilter} onValueChange={setConditionFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Conditions</SelectItem>
            {conditions.map(cond => (
              <SelectItem key={cond} value={cond}>{cond}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Asset List */}
      <div className="grid gap-4">
        {filteredAssets.map((asset) => {
          const Icon = categoryIcons[asset.category] || Package;
          return (
            <Card 
              key={asset.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedAsset(asset)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-primary/10`}>
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{asset.name}</h3>
                      <Badge variant="outline" className="text-xs">{asset.category}</Badge>
                      <Badge className={`text-xs ${conditionColors[asset.condition]}`}>
                        {asset.condition}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{asset.description}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {asset.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {asset.accountableOfficer}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {asset.acquisitionDate}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Value</p>
                    <p className="font-semibold text-primary">P{asset.acquisitionCost.toLocaleString()}</p>
                    {asset.serialNumber && (
                      <p className="text-xs text-muted-foreground mt-1">SN: {asset.serialNumber}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAssets.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No assets found matching your criteria</p>
        </div>
      )}

      {/* Asset Detail Dialog */}
      <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Asset Details</DialogTitle>
          </DialogHeader>
          {selectedAsset && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-primary/10">
                  {(() => {
                    const Icon = categoryIcons[selectedAsset.category] || Package;
                    return <Icon className="w-8 h-8 text-primary" />;
                  })()}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedAsset.name}</h3>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline">{selectedAsset.category}</Badge>
                    <Badge className={conditionColors[selectedAsset.condition]}>{selectedAsset.condition}</Badge>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">{selectedAsset.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Asset ID</p>
                  <p className="font-medium">{selectedAsset.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Acquisition Cost</p>
                  <p className="font-medium text-primary">P{selectedAsset.acquisitionCost.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Acquisition Date</p>
                  <p className="font-medium">{selectedAsset.acquisitionDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedAsset.location}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Accountable Officer</p>
                  <p className="font-medium">{selectedAsset.accountableOfficer}</p>
                </div>
                {selectedAsset.serialNumber && (
                  <div>
                    <p className="text-muted-foreground">Serial Number</p>
                    <p className="font-medium">{selectedAsset.serialNumber}</p>
                  </div>
                )}
                {selectedAsset.warranty && (
                  <div>
                    <p className="text-muted-foreground">Warranty Until</p>
                    <p className="font-medium">{selectedAsset.warranty}</p>
                  </div>
                )}
                {selectedAsset.lastMaintenance && (
                  <div>
                    <p className="text-muted-foreground">Last Maintenance</p>
                    <p className="font-medium">{selectedAsset.lastMaintenance}</p>
                  </div>
                )}
                {selectedAsset.nextMaintenance && (
                  <div>
                    <p className="text-muted-foreground">Next Maintenance</p>
                    <p className="font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {selectedAsset.nextMaintenance}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
