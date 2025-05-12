import React, { useState } from 'react';
import { AuditLog } from './types';
import LogDetailDialog from './LogDetailDialog';

const AuditLogList: React.FC<{ logs: AuditLog[] }> = ({ logs }) => {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  return (
    <div>
      <ul>
        {logs.map(log => (
          <li key={log.id} onClick={() => setSelectedLog(log)}>
            {log.message}
          </li>
        ))}
      </ul>
      {selectedLog && <LogDetailDialog log={selectedLog} />}
    </div>
  );
};

export default AuditLogList;