'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PortalHeader } from '@/components/portal/header';
import { useAuditLogs, formatTimestamp } from '@/lib/firebase-hooks';
import { Search, ClipboardList, FileText, Users, AlertTriangle, Building2, Megaphone, Calendar } from 'lucide-react';

const moduleIcons: Record<string, React.ElementType> = {
  'Documents': FileText,
  'Blotter': AlertTriangle,
  'Business': Building2,
  'Announcements': Megaphone,
  'Programs': Calendar,
  'Residents': Users,
};

const moduleColors: Record<string, string> = {
  'Documents': 'bg-blue-100 text-blue-700',
  'Blotter': 'bg-destructive/10 text-destructive',
  'Business': 'bg-amber-100 text-amber-700',
  'Announcements': 'bg-purple-100 text-purple-700',
  'Programs': 'bg-primary/10 text-primary',
  'Residents': 'bg-cyan-100 text-cyan-700',
};

export default function AuditLogsPage() {
  const { data: logs, loading } = useAuditLogs(100);
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  const filteredLogs = logs
    .filter((log: any) => moduleFilter === 'all' ? true : log.module === moduleFilter)
    .filter((log: any) => 
      log.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const modules = ['all', 'Documents', 'Blotter', 'Business', 'Announcements', 'Programs', 'Residents'];

  if (loading) {
    return (
      <>
        <PortalHeader title="Audit Logs" description="System activity and change history" />
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
      <PortalHeader title="Audit Logs" description="System activity and change history" />
      
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto mb-6 pb-2">
          {modules.map((module) => (
            <button
              key={module}
              onClick={() => setModuleFilter(module)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                moduleFilter === module
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {module === 'all' ? 'All Modules' : module}
            </button>
          ))}
        </div>

        {/* Logs Table */}
        {filteredLogs.length === 0 ? (
          <Card className="p-12 text-center border-primary/20">
            <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No audit logs found</p>
          </Card>
        ) : (
          <Card className="overflow-hidden border-primary/20">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Timestamp</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">User</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Module</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Action</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLogs.map((log: any) => {
                    const ModuleIcon = moduleIcons[log.module] || ClipboardList;
                    const moduleColor = moduleColors[log.module] || 'bg-muted text-muted-foreground';
                    
                    return (
                      <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                          {formatTimestamp(log.timestamp)}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground font-medium">
                          {log.userName}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Badge variant="outline" className="capitalize">
                            {log.userRole}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded ${moduleColor}`}>
                            <ModuleIcon className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">{log.module}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {log.action}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">
                          {log.details}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Object.keys(moduleColors).map((module) => {
            const count = logs.filter((l: any) => l.module === module).length;
            const ModuleIcon = moduleIcons[module] || ClipboardList;
            
            return (
              <Card key={module} className="p-4 text-center border-primary/20">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${moduleColors[module]} mb-2`}>
                  <ModuleIcon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-foreground">{count}</p>
                <p className="text-xs text-muted-foreground">{module}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
