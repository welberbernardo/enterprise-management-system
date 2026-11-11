import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { auditService } from '../../services/audit.service';
import { useNotification } from '../../hooks/useNotification';
import { useDebounce } from '../../hooks/useDebounce';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Table, type Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { SearchBar } from '../../components/forms/SearchBar';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { PAGINATION } from '../../utils/constants';
import { formatDateTime } from '../../utils/formatters';
import type { AuditLog, AuditFilters } from '../../types/audit.types';

export function AuditLogs() {
  const [filters, setFilters] = useState<AuditFilters>({ search: '', page: PAGINATION.DEFAULT_PAGE, limit: PAGINATION.DEFAULT_LIMIT, action: undefined });
  const debounced = useDebounce(filters.search ?? '', 400);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', { ...filters, search: debounced }],
    queryFn: () => auditService.getLogs({ ...filters, search: debounced }),
  });

  const actionOptions = [
    { label: 'All Actions', value: '' },
    { label: 'Create', value: 'CREATE' },
    { label: 'Update', value: 'UPDATE' },
    { label: 'Delete', value: 'DELETE' },
    { label: 'Login', value: 'LOGIN' },
    { label: 'Logout', value: 'LOGOUT' },
    { label: 'Export', value: 'EXPORT' },
  ];

  const columns: Column<AuditLog>[] = [
    { key: 'user', header: 'User', render: (row) => <span className="font-medium">{row.user}</span> },
    { key: 'action', header: 'Action', render: (row) => <Badge variant="info">{row.action}</Badge> },
    { key: 'entity', header: 'Entity', render: (row) => <span className="font-mono text-xs">{row.entity}</span> },
    { key: 'description', header: 'Description', render: (row) => row.description },
    { key: 'timestamp', header: 'Time', render: (row) => formatDateTime(row.timestamp) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" subtitle="Track system activity" />
      <Card>
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <SearchBar value={filters.search ?? ''} onChange={(s) => setFilters((f) => ({ ...f, search: s, page: 1 }))} className="flex-1" />
          <Select value={filters.action ?? ''} onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value as AuditLog['action'] || undefined, page: 1 }))} options={actionOptions} className="w-48" />
        </div>
        {isLoading && !data ? <div className="flex justify-center py-12"><Spinner label="Loading logs..." /></div> : (
          <Table columns={columns} data={data?.data ?? []} loading={isLoading} keyField="id" emptyMessage="No audit logs" />
        )}
        {data && <Pagination page={data.page} totalPages={data.totalPages} total={data.total} limit={data.limit} onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))} />}
      </Card>
    </div>
  );
}
