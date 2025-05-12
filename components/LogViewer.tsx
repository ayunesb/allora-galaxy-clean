import React, { useState } from 'react';
import { LogDetailDialog } from './LogDetailDialog';
import { AuditLog } from '../types';

interface LogViewerProps {
  logs: AuditLog[];
}

const LogViewer: React.FC<LogViewerProps> = ({ logs }) => {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  return (
    <div>
      <h1>Log Viewer</h1>
      <ul>
        {logs.map((log) => (
          <li key={log.id} onClick={() => setSelectedLog(log)}>
            {log.event_type}
          </li>
        ))}
      </ul>
      {selectedLog && 'event_type' in selectedLog && (
        <LogDetailDialog log={selectedLog} />
      )}
    </div>
  );
};

export default LogViewer;