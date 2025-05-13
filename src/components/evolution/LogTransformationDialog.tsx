
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { JsonView } from '@/components/ui/json-view';
import { SystemLog, AuditLog } from '@/types/logs';
import { auditLogToSystemLog, systemLogToAuditLog } from '@/lib/utils/logTransformations';

interface LogTransformationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: SystemLog | AuditLog | null;
  type: 'system' | 'audit';
}

const LogTransformationDialog: React.FC<LogTransformationDialogProps> = ({
  open,
  onOpenChange,
  log,
  type
}) => {
  const [activeTab, setActiveTab] = useState<'original' | 'transformed'>('original');
  
  if (!log) return null;
  
  const transformedLog = type === 'system' 
    ? systemLogToAuditLog(log as SystemLog)
    : auditLogToSystemLog(log as AuditLog);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Log Transformation</DialogTitle>
          <DialogDescription>
            View the log in its original format and after transformation
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'original' | 'transformed')}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="original">Original Log ({type === 'system' ? 'System' : 'Audit'})</TabsTrigger>
            <TabsTrigger value="transformed">Transformed Log ({type === 'system' ? 'Audit' : 'System'})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="original" className="max-h-[400px] overflow-y-auto">
            <JsonView data={log} />
          </TabsContent>
          
          <TabsContent value="transformed" className="max-h-[400px] overflow-y-auto">
            <JsonView data={transformedLog} />
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogTransformationDialog;
