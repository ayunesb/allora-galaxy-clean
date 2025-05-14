
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { SystemLog } from '@/types/logs';
import { LogDetailDialog } from './logs/LogDetailDialog';

interface AuditLogProps {
  logs: SystemLog[];
  isLoading: boolean;
}

const AuditLog: React.FC<AuditLogProps> = ({ logs, isLoading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  
  // Filter logs based on search query
  const filteredLogs = logs.filter(log => 
    log.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.module?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.level?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleLogClick = (log: SystemLog) => {
    setSelectedLog(log);
  };
  
  const handleCloseDialog = () => {
    setSelectedLog(null);
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>System Audit Logs</CardTitle>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-[240px]"
              />
              <Button variant="outline" size="sm">
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No logs found matching your criteria
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div 
                  key={log.id}
                  className="p-3 border rounded-md cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => handleLogClick(log)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        log.level === 'error' ? 'bg-red-100 text-red-800' :
                        log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {log.level}
                      </span>
                      <span className="text-sm font-medium">{log.module}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm truncate">{log.description}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedLog && (
        <LogDetailDialog 
          log={selectedLog} 
          open={Boolean(selectedLog)} 
          onOpenChange={handleCloseDialog} 
        />
      )}
    </div>
  );
};

export default AuditLog;
