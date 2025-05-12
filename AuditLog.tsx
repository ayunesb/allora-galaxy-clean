import React, { useState } from 'react';
import { AuditLog, SystemLog } from './types';
import LogDetailDialog from './LogDetailDialog';

interface LogViewerProps {
  logs: (AuditLog | SystemLog)[];
}

const LogViewer: React.FC<LogViewerProps> = ({ logs }) => {
  const [selectedLog, setSelectedLog] = useState<AuditLog | SystemLog | null>(null);

  return (
    <div>
      <ul>
        {logs.map((log, index) => (
          <li key={index} onClick={() => setSelectedLog(log)}>
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