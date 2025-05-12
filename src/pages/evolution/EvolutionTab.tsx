import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { fetchAuditLogs } from '@/store/auditLogs/actions';
import { AuditLogFilters } from '@/components/evolution/logs/AuditLogFilters';
import { LogDetailDialog } from '@/components/evolution/logs/LogDetailDialog';
import { AuditLog } from '@/types/auditLogs';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { format } from 'date-fns';

const EvolutionTab: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { auditLogs, loading } = useSelector((state: RootState) => state.auditLogs);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    dispatch(fetchAuditLogs(filters));
  }, [dispatch, filters]);

  const handleRowClick = (params: GridValueGetterParams) => {
    setSelectedLog(params.row);
  };

  const handleCloseDialog = () => {
    setSelectedLog(null);
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    {
      field: 'timestamp',
      headerName: t('Timestamp'),
      width: 150,
      valueGetter: (params: GridValueGetterParams) => format(new Date(params.row.timestamp), 'Pp'),
    },
    { field: 'user', headerName: t('User'), width: 150 },
    { field: 'action', headerName: t('Action'), width: 150 },
    { field: 'details', headerName: t('Details'), width: 300 },
  ];

  return (
    <Box>
      <Typography variant="h4">{t('Audit Logs')}</Typography>
      <AuditLogFilters filters={filters} setFilters={setFilters} />
      {loading ? (
        <CircularProgress />
      ) : (
        <DataGrid rows={auditLogs} columns={columns} pageSize={5} onRowClick={handleRowClick} />
      )}
      {selectedLog && <LogDetailDialog log={selectedLog} onClose={handleCloseDialog} />}
    </Box>
  );
};

export default EvolutionTab;