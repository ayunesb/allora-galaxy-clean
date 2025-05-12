import { AuditLogFilter } from '@/types/admin';

interface AuditLogFiltersProps {
  filters: AuditLogFilter;
  onChange: (newFilters: AuditLogFilter) => void;
}

export const AuditLogFilters: React.FC<AuditLogFiltersProps> = ({
  filters,
  onChange,
}) => {
  return (
    <Select
      value={filters.entityType}
      onChange={(val) => onChange({ ...filters, entityType: val })}
    >
      {/* ...existing options... */}
    </Select>
  );
};