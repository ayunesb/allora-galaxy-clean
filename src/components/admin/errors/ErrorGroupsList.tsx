
// Fix the type issue in ErrorGroupsList.tsx
// Around line 147 where SystemLog is used but needs to be converted to LogEntry

// Transform the SystemLog to match LogEntry by mapping the level type
const logEntries = logs.map(log => ({
  ...log,
  level: log.level === 'debug' ? 'info' : log.level // Convert 'debug' to 'info'
})) as unknown as LogEntry[];
