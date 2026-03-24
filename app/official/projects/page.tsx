'use client';

import { useState } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  User,
  MapPin,
  Wallet,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Building2,
  FileText,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { mockProjects, mockOfficials } from '@/lib/mock-data';

const statusColors: Record<string, string> = {
  'planning': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'ongoing': 'bg-blue-100 text-blue-700 border-blue-200',
  'completed': 'bg-green-100 text-green-700 border-green-200',
  'cancelled': 'bg-red-100 text-red-700 border-red-200',
};

const statusIcons: Record<string, React.ElementType> = {
  'planning': Clock,
  'ongoing': AlertCircle,
  'completed': CheckCircle,
  'cancelled': AlertCircle,
};

const categoryColors: Record<string, string> = {
  'Health & Nutrition': 'bg-pink-100 text-pink-700',
  'Infrastructure': 'bg-blue-100 text-blue-700',
  'Livelihood': 'bg-green-100 text-green-700',
  'Social Welfare': 'bg-purple-100 text-purple-700',
  'Sports & Recreation': 'bg-orange-100 text-orange-700',
  'Environment': 'bg-teal-100 text-teal-700',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState(mockProjects);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<typeof mockProjects[0] | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    category: '',
    startDate: '',
    endDate: '',
    location: '',
    budget: '',
    leadBy: '',
    contractor: '',
    contractorContact: '',
    fundSource: '',
    requirements: '',
  });

  const categories = ['Health & Nutrition', 'Infrastructure', 'Livelihood', 'Social Welfare', 'Sports & Recreation', 'Environment'];
  const statuses = ['planning', 'ongoing', 'completed', 'cancelled'];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = {
    total: projects.length,
    ongoing: projects.filter(p => p.status === 'ongoing').length,
    completed: projects.filter(p => p.status === 'completed').length,
    totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
    totalUtilized: projects.reduce((sum, p) => sum + p.actualCost, 0),
    totalBeneficiaries: projects.reduce((sum, p) => sum + p.beneficiaries, 0),
  };

  const handleAddProject = () => {
    const project = {
      id: `PRJ-${String(projects.length + 1).padStart(3, '0')}`,
      title: newProject.title,
      description: newProject.description,
      category: newProject.category,
      status: 'planning' as const,
      startDate: newProject.startDate,
      endDate: newProject.endDate,
      location: newProject.location,
      budget: Number(newProject.budget),
      actualCost: 0,
      contractor: newProject.contractor || undefined,
      contractorContact: newProject.contractorContact || undefined,
      leadBy: newProject.leadBy,
      beneficiaries: 0,
      requirements: newProject.requirements.split('\n').filter(r => r.trim()),
      milestones: [],
      fundSource: newProject.fundSource,
    };
    setProjects([project, ...projects]);
    setIsAddDialogOpen(false);
    setNewProject({
      title: '', description: '', category: '', startDate: '', endDate: '',
      location: '', budget: '', leadBy: '', contractor: '', contractorContact: '',
      fundSource: '', requirements: '',
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Track barangay projects, programs, and activities</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Project Title</Label>
                <Input 
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                  placeholder="e.g., Feeding Program 2026"
                />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea 
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  placeholder="Detailed description of the project..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select value={newProject.category} onValueChange={(v) => setNewProject({...newProject, category: v})}>
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
                  <Label>Fund Source</Label>
                  <Input 
                    value={newProject.fundSource}
                    onChange={(e) => setNewProject({...newProject, fundSource: e.target.value})}
                    placeholder="e.g., Barangay Fund"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Start Date</Label>
                  <Input 
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>End Date</Label>
                  <Input 
                    type="date"
                    value={newProject.endDate}
                    onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Location</Label>
                  <Input 
                    value={newProject.location}
                    onChange={(e) => setNewProject({...newProject, location: e.target.value})}
                    placeholder="e.g., Barangay Hall"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Budget (PHP)</Label>
                  <Input 
                    type="number"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Project Lead</Label>
                <Select value={newProject.leadBy} onValueChange={(v) => setNewProject({...newProject, leadBy: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select official" />
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
                  <Label>Contractor (Optional)</Label>
                  <Input 
                    value={newProject.contractor}
                    onChange={(e) => setNewProject({...newProject, contractor: e.target.value})}
                    placeholder="Contractor name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Contractor Contact</Label>
                  <Input 
                    value={newProject.contractorContact}
                    onChange={(e) => setNewProject({...newProject, contractorContact: e.target.value})}
                    placeholder="Contact number"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Requirements (one per line)</Label>
                <Textarea 
                  value={newProject.requirements}
                  onChange={(e) => setNewProject({...newProject, requirements: e.target.value})}
                  placeholder="List all required materials, equipment, etc."
                  rows={4}
                />
              </div>
              <Button onClick={handleAddProject} disabled={!newProject.title || !newProject.category || !newProject.leadBy}>
                Create Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FolderKanban className="w-8 h-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ongoing</p>
                <p className="text-2xl font-bold">{stats.ongoing}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500/60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">P{(stats.totalBudget / 1000000).toFixed(1)}M</p>
              </div>
              <Wallet className="w-8 h-8 text-green-500/60" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Beneficiaries</p>
                <p className="text-2xl font-bold">{stats.totalBeneficiaries.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500/60" />
            </div>
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
            {statuses.map(status => (
              <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Projects List */}
      <div className="grid gap-4">
        {filteredProjects.map((project) => {
          const StatusIcon = statusIcons[project.status] || Clock;
          const utilizationRate = project.budget > 0 ? (project.actualCost / project.budget) * 100 : 0;
          const completedMilestones = project.milestones.filter(m => m.status === 'completed').length;
          
          return (
            <Card 
              key={project.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge className={statusColors[project.status]} variant="outline">
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {project.status}
                      </Badge>
                      <Badge className={categoryColors[project.category] || 'bg-gray-100 text-gray-700'}>
                        {project.category}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg text-foreground mb-1">{project.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {project.startDate} to {project.endDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {project.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {project.leadBy}
                      </span>
                      {project.contractor && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {project.contractor}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="lg:w-48 space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Budget</span>
                        <span className="font-medium">P{project.budget.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Utilized</span>
                        <span className="font-medium text-primary">P{project.actualCost.toLocaleString()}</span>
                      </div>
                      <Progress value={utilizationRate} className="h-2" />
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Milestones</span>
                      <span className="font-medium">{completedMilestones}/{project.milestones.length}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Beneficiaries</span>
                      <span className="font-medium">{project.beneficiaries}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderKanban className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No projects found matching your criteria</p>
        </div>
      )}

      {/* Project Detail Dialog */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge className={statusColors[selectedProject.status]} variant="outline">
                  {selectedProject.status}
                </Badge>
                <Badge className={categoryColors[selectedProject.category] || 'bg-gray-100 text-gray-700'}>
                  {selectedProject.category}
                </Badge>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-2">{selectedProject.title}</h2>
                <p className="text-muted-foreground">{selectedProject.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">{selectedProject.startDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-medium">{selectedProject.endDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedProject.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fund Source</p>
                  <p className="font-medium">{selectedProject.fundSource}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Project Lead</p>
                  <p className="font-medium">{selectedProject.leadBy}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Beneficiaries</p>
                  <p className="font-medium">{selectedProject.beneficiaries}</p>
                </div>
                {selectedProject.contractor && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Contractor</p>
                      <p className="font-medium">{selectedProject.contractor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Contractor Contact</p>
                      <p className="font-medium">{selectedProject.contractorContact}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Budget Utilization</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg text-center">
                    <p className="text-2xl font-bold text-primary">P{selectedProject.budget.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Budget</p>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">P{selectedProject.actualCost.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Utilized</p>
                  </div>
                </div>
                <Progress value={(selectedProject.actualCost / selectedProject.budget) * 100} className="h-3" />
                <p className="text-sm text-center text-muted-foreground">
                  {((selectedProject.actualCost / selectedProject.budget) * 100).toFixed(1)}% utilized
                </p>
              </div>

              {selectedProject.requirements.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Requirements</h3>
                  <ul className="space-y-1">
                    {selectedProject.requirements.map((req, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedProject.milestones.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Milestones</h3>
                  <div className="space-y-2">
                    {selectedProject.milestones.map((milestone, index) => (
                      <div 
                        key={index}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          milestone.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-muted/50'
                        }`}
                      >
                        {milestone.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-muted-foreground" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{milestone.name}</p>
                          <p className="text-xs text-muted-foreground">{milestone.date}</p>
                        </div>
                        <Badge variant="outline" className={
                          milestone.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }>
                          {milestone.status}
                        </Badge>
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
