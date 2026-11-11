import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { permissionService } from '../../services/permission.service';
import { useNotification } from '../../hooks/useNotification';

import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Table, type Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { PAGINATION } from '../../utils/constants';
import { useDebounce } from '../../hooks/useDebounce';
import { SearchBar } from '../../components/forms/SearchBar';
import { Select } from '../../components/ui/Select';
import type { Permission } from '../../types/permission.types';

export function PermissionsList() {

  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('');
  const [page, setPage] = useState(PAGINATION.DEFAULT_PAGE);
  const debounced = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ['permissions', { search: debounced, group, page }],
    queryFn: () => permissionService.getAll({ search: debounced, group, page, limit: PAGINATION.DEFAULT_LIMIT }),
  });

  const groupOptions = [
    { label: 'All Groups', value: '' },
    { label: 'Users', value: 'users' },
    { label: 'Roles', value: 'roles' },
    { label: 'Customers', value: 'customers' },
    { label: 'Products', value: 'products' },
    { label: 'Orders', value: 'orders' },
    { label: 'Finance', value: 'finance' },
  ];

  const columns: Column<Permission>[] = [
    { key: 'name', header: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'key', header: 'Key', render: (row) => <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{row.key}</code> },
    { key: 'group', header: 'Group', render: (row) => <Badge variant="info">{row.group}</Badge> },
    { key: 'description', header: 'Description', render: (row) => row.description || '-' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Permissions" subtitle="System permission definitions" />

      <Card>
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} className="flex-1" />
          <Select value={group} onChange={(e) => { setGroup(e.target.value); setPage(1); }} options={groupOptions} className="w-48" />
        </div>
        {isLoading && !data ? (
          <div className="flex justify-center py-12"><Spinner label="Loading permissions..." /></div>
        ) : (
          <Table columns={columns} data={data?.data ?? []} loading={isLoading} keyField="id" emptyMessage="No permissions found" />
        )}
        {data && (
          <Pagination page={data.page} totalPages={data.totalPages} total={data.total} limit={data.limit} onPageChange={setPage} />
        )}
      </Card>
    </div>
  );
}
