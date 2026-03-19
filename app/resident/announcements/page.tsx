'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PortalHeader } from '@/components/portal/header';
import { AlertCircle, Megaphone, MessageSquare } from 'lucide-react';

export default function AnnouncementsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const categories = ['All', 'Event', 'Meeting', 'Maintenance', 'Alert'];
  const [selectedCategory, setSelectedCategory] = useState('All');
  const announcements: any[] = [];

  const filteredAnnouncements = selectedCategory === 'All'
    ? announcements
    : announcements.filter(a => a.category === selectedCategory);

  const sortedAnnouncements = [...filteredAnnouncements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'medium':
        return 'bg-accent/20 text-accent-foreground border-accent/30';
      default:
        return 'bg-primary/10 text-primary border-primary/30';
    }
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'high') return <AlertCircle className="w-4 h-4" />;
    if (priority === 'medium') return <Megaphone className="w-4 h-4" />;
    return <MessageSquare className="w-4 h-4" />;
  };

  return (
    <>
      <PortalHeader title="Announcements" description="Stay updated with barangay news and alerts" />
      
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full font-medium transition text-sm ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {sortedAnnouncements.length === 0 ? (
            <Card className="p-12 text-center bg-muted/50">
              <p className="text-muted-foreground text-lg">No announcements in this category.</p>
            </Card>
          ) : (
            sortedAnnouncements.map((announcement, index) => (
              <Card
                key={announcement.id}
                className={`p-6 border-primary/20 hover:shadow-lg transition cursor-pointer animate-fadeUp ${
                  announcement.priority === 'high' ? 'border-l-4 border-l-destructive' : ''
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => setExpandedId(expandedId === announcement.id ? null : announcement.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-xl font-semibold text-foreground">{announcement.title}</h3>
                      <Badge className={`${getPriorityColor(announcement.priority)} flex items-center gap-1 text-xs`}>
                        {getPriorityIcon(announcement.priority)}
                        {announcement.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {new Date(announcement.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-muted-foreground line-clamp-2">
                      {announcement.content}
                    </p>
                  </div>
                </div>

                {expandedId === announcement.id && (
                  <div className="mt-4 pt-4 border-t border-border animate-fadeUp">
                    <p className="text-foreground leading-relaxed">{announcement.content}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge className="bg-primary/10 text-primary">{announcement.category}</Badge>
                      {announcement.author && (
                        <Badge className="bg-muted text-muted-foreground">By: {announcement.author}</Badge>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
}
