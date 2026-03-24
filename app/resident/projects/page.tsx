'use client';

import { useState } from 'react';
import { 
  FolderKanban, 
  Search, 
  Calendar,
  User,
  MapPin,
  Users,
  CheckCircle,
  Clock,
  Building2,
  Filter
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { mockProjects } from '@/lib/mock-data';

const statusColors: Record<string, string> = {
  'planning': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'ongoing': 'bg-blue-100 text-blue-700 border-blue-200',
  'completed': 'bg-green-100 text-green-700 border-green-200',
  'cancelled': 'bg-red-100 text-red-700 border-red-200',
};

const categoryColors: Record<string, string> = {
  'Health & Nutrition': 'bg-pink-100 text-pink-700',
  'Infrastructure': 'bg-blue-100 text-blue-700',
  'Livelihood': 'bg-green-100 text-green-700',
  'Social Welfare': 'bg-purple-100 text-purple-700',
  'Sports & Recreation': 'bg-orange-100 text-orange-700',
  'Environment': 'bg-teal-100 text-teal-700',
};

export default function ResidentProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<typeof mockProjects[0] | null>(null);

  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const ongoingProjects = mockProjects.filter(p => p.status === 'ongoing');
  const upcomingProjects = mockProjects.filter(p => p.status === 'planning');

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Barangay Projects</h1>
        <p className="text-sm text-muted-foreground mt-1">View ongoing and upcoming community projects and programs</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Ongoing</p>
            <p className="text-2xl font-bold">{ongoingProjects.length}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Upcoming</p>
            <p className="text-2xl font-bold">{upcomingProjects.length}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold">{mockProjects.filter(p => p.status === 'completed').length}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Beneficiaries</p>
            <p className="text-2xl font-bold">{mockProjects.reduce((sum, p) => sum + p.beneficiaries, 0).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="planning">Upcoming</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects List */}
      <div className="grid gap-4">
        {filteredProjects.map((project) => {
          const completedMilestones = project.milestones.filter(m => m.status === 'completed').length;
          
          return (
            <Card 
              key={project.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge className={statusColors[project.status]} variant="outline">
                    {project.status === 'ongoing' && <Clock className="w-3 h-3 mr-1" />}
                    {project.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {project.status}
                  </Badge>
                  <Badge className={categoryColors[project.category] || 'bg-gray-100 text-gray-700'}>
                    {project.category}
                  </Badge>
                </div>
                
                <h3 className="font-semibold text-lg text-foreground mb-1">{project.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
                
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {project.startDate} - {project.endDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {project.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {project.beneficiaries} beneficiaries
                  </span>
                </div>

                {project.milestones.length > 0 && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{completedMilestones}/{project.milestones.length} milestones</span>
                    </div>
                    <Progress value={(completedMilestones / project.milestones.length) * 100} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderKanban className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No projects found</p>
        </div>
      )}

      {/* Project Detail Dialog */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className={statusColors[selectedProject.status]} variant="outline">
                  {selectedProject.status}
                </Badge>
                <Badge className={categoryColors[selectedProject.category] || 'bg-gray-100 text-gray-700'}>
                  {selectedProject.category}
                </Badge>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold">{selectedProject.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{selectedProject.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Duration
                  </p>
                  <p className="font-medium">{selectedProject.startDate} - {selectedProject.endDate}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Location
                  </p>
                  <p className="font-medium">{selectedProject.location}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground flex items-center gap-1">
                    <User className="w-3 h-3" /> Lead By
                  </p>
                  <p className="font-medium">{selectedProject.leadBy}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" /> Beneficiaries
                  </p>
                  <p className="font-medium">{selectedProject.beneficiaries}</p>
                </div>
              </div>

              {selectedProject.contractor && (
                <div className="p-3 bg-muted/50 rounded-lg text-sm">
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Contractor
                  </p>
                  <p className="font-medium">{selectedProject.contractor}</p>
                </div>
              )}

              {selectedProject.milestones.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Project Milestones</h3>
                  <div className="space-y-2">
                    {selectedProject.milestones.map((milestone, index) => (
                      <div 
                        key={index}
                        className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                          milestone.status === 'completed' ? 'bg-green-50' : 'bg-muted/50'
                        }`}
                      >
                        {milestone.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="flex-1">{milestone.name}</span>
                        <span className="text-xs text-muted-foreground">{milestone.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
