'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PortalHeader } from '@/components/portal/header';
import { useBusinesses, addDocument, updateDocument, deleteDocument, addAuditLog, formatTimestamp } from '@/lib/firebase-hooks';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, Building2, Search, X } from 'lucide-react';

const businessTypes = [
  'Retail (Sari-Sari Store)',
  'Food & Beverage',
  'Services',
  'Manufacturing',
  'Agriculture',
  'Transportation',
  'Construction',
  'Other',
];

export default function BusinessPage() {
  const { data: businesses, loading } = useBusinesses();
  const { user, userData } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    type: '',
    address: '',
    permitNumber: '',
    status: 'pending',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateDocument('businesses', editingId, formData);
        await addAuditLog({
          userId: user?.uid || '',
          userName: userData?.fullName || '',
          userRole: 'official',
          action: 'Updated business record',
          module: 'Business',
          details: `Updated ${formData.businessName}`,
        });
        toast.success('Business updated');
      } else {
        await addDocument('businesses', {
          ...formData,
          ownerId: '',
        });
        await addAuditLog({
          userId: user?.uid || '',
          userName: userData?.fullName || '',
          userRole: 'official',
          action: 'Added business record',
          module: 'Business',
          details: `Added ${formData.businessName}`,
        });
        toast.success('Business added');
      }

      setFormData({
        businessName: '',
        ownerName: '',
        type: '',
        address: '',
        permitNumber: '',
        status: 'pending',
      });
      setEditingId(null);
      setShowModal(false);
    } catch (err) {
      toast.error('Failed to save business');
    }
  };

  const handleEdit = (business: any) => {
    setFormData({
      businessName: business.businessName,
      ownerName: business.ownerName,
      type: business.type,
      address: business.address,
      permitNumber: business.permitNumber || '',
      status: business.status,
    });
    setEditingId(business.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this business?')) return;

    try {
      await deleteDocument('businesses', id);
      toast.success('Business deleted');
    } catch (err) {
      toast.error('Failed to delete business');
    }
  };

  const filteredBusinesses = businesses
    .filter((b: any) => statusFilter === 'all' ? true : b.status === statusFilter)
    .filter((b: any) => 
      b.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.ownerName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const stats = {
    total: businesses.length,
    active: businesses.filter((b: any) => b.status === 'active').length,
    pending: businesses.filter((b: any) => b.status === 'pending').length,
    expired: businesses.filter((b: any) => b.status === 'expired').length,
  };

  if (loading) {
    return (
      <>
        <PortalHeader title="Business Management" description="Manage registered businesses and permits" />
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
      <PortalHeader title="Business Management" description="Manage registered businesses and permits" />
      
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'bg-muted text-foreground' },
            { label: 'Active', value: stats.active, color: 'bg-primary/10 text-primary' },
            { label: 'Pending', value: stats.pending, color: 'bg-amber-100 text-amber-700' },
            { label: 'Expired', value: stats.expired, color: 'bg-destructive/10 text-destructive' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.color} rounded-lg p-4 text-center`}>
              <p className="text-sm font-medium opacity-75">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search businesses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => {
              setFormData({
                businessName: '',
                ownerName: '',
                type: '',
                address: '',
                permitNumber: '',
                status: 'pending',
              });
              setEditingId(null);
              setShowModal(true);
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Business
          </Button>
        </div>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto mb-6 pb-2">
          {['all', 'active', 'pending', 'expired', 'revoked'].map((status) => (
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

        {/* Businesses Grid */}
        {filteredBusinesses.length === 0 ? (
          <Card className="p-12 text-center border-primary/20">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No businesses found</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map((business: any) => (
              <Card key={business.id} className="p-6 border-primary/20 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">{business.businessName}</h3>
                    <p className="text-sm text-muted-foreground">{business.ownerName}</p>
                  </div>
                  <Badge className={`
                    ${business.status === 'active' ? 'bg-primary/10 text-primary' : ''}
                    ${business.status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}
                    ${business.status === 'expired' ? 'bg-destructive/10 text-destructive' : ''}
                    ${business.status === 'revoked' ? 'bg-muted text-muted-foreground' : ''}
                  `}>
                    {business.status}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Type:</strong> {business.type}
                  </p>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Address:</strong> {business.address}
                  </p>
                  {business.permitNumber && (
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Permit #:</strong> {business.permitNumber}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Added: {formatTimestamp(business.createdAt)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(business)}
                    className="flex-1"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(business.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-8 max-w-lg w-full animate-scaleIn max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  {editingId ? 'Edit Business' : 'Add Business'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Business Name</label>
                  <Input
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="Enter business name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Owner Name</label>
                  <Input
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    placeholder="Enter owner name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Business Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  >
                    <option value="">Select type...</option>
                    {businessTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Address</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter business address"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Permit Number</label>
                  <Input
                    value={formData.permitNumber}
                    onChange={(e) => setFormData({ ...formData, permitNumber: e.target.value })}
                    placeholder="e.g., BP-2026-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="revoked">Revoked</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                    {editingId ? 'Update' : 'Add'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
