'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PortalHeader } from '@/components/portal/header';
import { mockPrograms } from '@/lib/mock-data';
import { Plus, Trash2, Edit2, Calendar, MapPin, Users } from 'lucide-react';

type Program = {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  location?: string;
  attendees?: number;
};

export default function OfficialProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>(mockPrograms);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Health',
    date: '',
    location: '',
  });

  const handleCreateOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      setPrograms(prev =>
        prev.map(prog =>
          prog.id === editingId
            ? { ...prog, ...formData }
            : prog
        )
      );
    } else {
      const newProg: Program = {
        id: `PROG-${Date.now()}`,
        ...formData,
        attendees: 0,
      };
      setPrograms([newProg, ...programs]);
    }

    setFormData({ title: '', description: '', category: 'Health', date: '', location: '' });
    setEditingId(null);
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this program?')) {
      setPrograms(programs.filter(p => p.id !== id));
    }
  };

  const handleEdit = (program: Program) => {
    setFormData({
      title: program.title,
      description: program.description,
      category: program.category,
      date: program.date,
      location: program.location || '',
    });
    setEditingId(program.id);
    setShowModal(true);
  };

  return (
    <>
      <PortalHeader title="Programs Management" description="Create and manage community programs and events" />
      
      <div className="p-4 sm:p-6 lg:p-8">
        <Button
          onClick={() => {
            setFormData({ title: '', description: '', category: 'Health', date: '', location: '' });
            setEditingId(null);
            setShowModal(true);
          }}
          className="mb-6 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Program
        </Button>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-8 max-w-2xl w-full animate-scaleIn max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {editingId ? 'Edit Program' : 'Create New Program'}
              </h2>
              <form onSubmit={handleCreateOrUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Title</label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="border-input focus:ring-primary/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    rows={4}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="Health">Health</option>
                      <option value="Livelihood">Livelihood</option>
                      <option value="Sports">Sports</option>
                      <option value="Environment">Environment</option>
                      <option value="Education">Education</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Date/Schedule</label>
                    <Input
                      type="text"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      placeholder="e.g., March 25-29, 2026"
                      className="border-input focus:ring-primary/50"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Location</label>
                  <Input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Barangay Covered Court"
                    className="border-input focus:ring-primary/50"
                  />
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
                    {editingId ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Programs Grid */}
        {programs.length === 0 ? (
          <Card className="p-12 text-center border-primary/20">
            <p className="text-muted-foreground mb-4">No programs yet</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {programs.map((program) => (
              <Card key={program.id} className="p-6 border-primary/20 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-foreground flex-1">{program.title}</h3>
                  <div className="flex gap-2 ml-2">
                    <Badge className="bg-primary text-primary-foreground">{program.category}</Badge>
                    <button
                      onClick={() => handleEdit(program)}
                      className="p-1 text-primary hover:bg-primary/10 rounded transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(program.id)}
                      className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-muted-foreground mb-4">{program.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    {program.date}
                  </div>
                  {program.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary" />
                      {program.location}
                    </div>
                  )}
                  {program.attendees !== undefined && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4 text-primary" />
                      {program.attendees} attendees
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
