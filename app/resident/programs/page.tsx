'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PortalHeader } from '@/components/portal/header';
import { mockPrograms } from '@/lib/mock-data';
import { Calendar, MapPin, Users } from 'lucide-react';

export default function ProgramsPage() {
  const [enrolled, setEnrolled] = useState<string[]>([]);
  const categories = ['All', 'Health', 'Livelihood', 'Sports', 'Environment'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleEnroll = (id: string) => {
    setEnrolled(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  const filteredPrograms = selectedCategory === 'All' 
    ? mockPrograms 
    : mockPrograms.filter(p => p.category === selectedCategory);

  return (
    <>
      <PortalHeader title="Community Programs" description="Browse and join barangay programs and activities" />
      
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
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

        {/* Programs Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredPrograms.map((program, index) => (
            <Card 
              key={program.id} 
              className="p-6 border-primary/20 hover:shadow-lg transition animate-fadeUp" 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-foreground flex-1">{program.title}</h3>
                <Badge className="bg-primary text-primary-foreground ml-2">{program.category}</Badge>
              </div>

              <p className="text-muted-foreground mb-4">{program.description}</p>

              <div className="space-y-2 mb-6">
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
                {program.attendees && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4 text-primary" />
                    {program.attendees} attendees
                  </div>
                )}
              </div>

              <Button
                onClick={() => handleEnroll(program.id)}
                className={`w-full ${
                  enrolled.includes(program.id)
                    ? 'bg-muted text-muted-foreground hover:bg-muted/80'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
              >
                {enrolled.includes(program.id) ? 'Enrolled' : 'Enroll Now'}
              </Button>
            </Card>
          ))}
        </div>

        {filteredPrograms.length === 0 && (
          <Card className="p-12 text-center bg-muted/50">
            <p className="text-muted-foreground text-lg">No programs in this category yet.</p>
          </Card>
        )}
      </div>
    </>
  );
}
