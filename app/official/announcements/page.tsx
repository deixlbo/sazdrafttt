'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PortalHeader } from '@/components/portal/header';
import { mockAnnouncements } from '@/lib/mock-data';
import { Plus, Trash2, Edit2 } from 'lucide-react';

type Announcement = {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  date: string;
  author?: string;
};

export default function OfficialAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Event',
    priority: 'medium',
  });

  const handleCreateOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      setAnnouncements(prev =>
        prev.map(ann =>
          ann.id === editingId
            ? { ...ann, ...formData, date: new Date().toISOString().split('T')[0] }
            : ann
        )
      );
    } else {
      const newAnn: Announcement = {
        id: `ANN-${Date.now()}`,
        ...formData,
        date: new Date().toISOString().split('T')[0],
        author: 'Current Official',
      };
      setAnnouncements([newAnn, ...announcements]);
    }

    setFormData({ title: '', content: '', category: 'Event', priority: 'medium' });
    setEditingId(null);
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      setAnnouncements(announcements.filter(a => a.id !== id));
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      category: announcement.category,
      priority: announcement.priority,
    });
    setEditingId(announcement.id);
    setShowModal(true);
  };

  return (
    <>
      <PortalHeader title="Announcements" description="Create and manage community announcements" />
      
      <div className="p-4 sm:p-6 lg:p-8">
        <Button
          onClick={() => {
            setFormData({ title: '', content: '', category: 'Event', priority: 'medium' });
            setEditingId(null);
            setShowModal(true);
          }}
          className="mb-6 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-5 h-5 mr-2" />
          Post Announcement
        </Button>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-8 max-w-2xl w-full animate-scaleIn max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {editingId ? 'Edit Announcement' : 'Post New Announcement'}
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
                  <label className="block text-sm font-semibold text-foreground mb-2">Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    rows={5}
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
                      <option value="Event">Event</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Alert">Alert</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
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
                    {editingId ? 'Update' : 'Post'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Announcements List */}
        {announcements.length === 0 ? (
          <Card className="p-12 text-center border-primary/20">
            <p className="text-muted-foreground mb-4">No announcements yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <Card
                key={announcement.id}
                className="p-6 border-primary/20 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">{announcement.title}</h3>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-semibold capitalize">
                        {announcement.category}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                        announcement.priority === 'high'
                          ? 'bg-destructive/10 text-destructive'
                          : announcement.priority === 'low'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-accent/20 text-accent-foreground'
                      }`}>
                        {announcement.priority}
                      </span>
                      <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                        {announcement.date}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="p-2 text-primary hover:bg-primary/10 rounded transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-muted-foreground whitespace-pre-wrap">{announcement.content}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
