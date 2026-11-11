import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { inventoryService } from '../../services/inventory.service';

import { useNotification } from '../../hooks/useNotification';
import { getErrorMessage } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table, type Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { SearchBar } from '../../components/forms/SearchBar';
import { Spinner } from '../../components/ui/Spinner';
import { PAGINATION } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import type { StockMovement, StockMovementFilters } from '../../types/inventory.types';
import { StockEntry } from './StockEntry';
import { StockExit } from './StockExit';

export function InventoryList() {
  const notify = useNotification();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<StockMovementFilters>({ search: '', page: PAGINATION.DEFAULT_PAGE, limit: PAGINATION.DEFAULT_LIMIT, type: undefined });
  const debounced = useDebounce(filters.search ?? '', 400);
  const [entryOpen, setEntryOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['stock-movements', { ...filters, search: debounced }],
    queryFn: () => inventoryService.getMovements({ ...filters, search: debounced }),
  });

  const { data: summary } = useQuery({
    queryKey: ['stock-summary'],
    queryFn: () => inventoryService.getSummary({ limit: 5 }),
  });

  const typeOptions = [
    { label: 'All Types', value: '' },
    { label: 'Entry', value: 'ENTRY' },
    { label: 'Exit', value: 'EXIT' },
    { label: 'Adjustment', value: 'ADJUSTMENT' },
  ];

  const columns: Column<StockMovement>[] = [
    { key: 'reference', header: 'Reference', render: (row) => <span className="font-mono text-xs">{row.reference}</span> },
    { key: 'productName', header: 'Product', render: (row) => row.productName },
    { key: 'type', header: 'Type', render: (row) => <Badge status={row.type} dot>{row.type}</Badge> },
    { key: 'reason', header: 'Reason', render: (row) => row.reason },
    { key: 'quantity', header: 'Qty', align: 'right', render: (row) => <span className={row.type === 'EXIT' ? 'text-danger-600' : 'text-success-600'}>{row.type === 'EXIT' ? '-' : '+'}{row.quantity}</span> },
    { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory" subtitle="Track stock movements"
        actions={
          <div className="flex gap-2">
            <Button leftIcon={<LogIn className="h-4 w-4" />} onClick={() => setEntryOpen(true)}>Stock Entry</Button>
            <Button variant="danger" leftIcon={<LogOut className="h-4 w-4" />} onClick={() => setExitOpen(true)}>Stock Exit</Button>
          </div>
        } />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(summary?.data ?? []).map((s) => (
          <Card key={s.productId}>
            <p className="text-sm font-medium">{s.productName}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-bold">{s.stock}</span>
              <Badge status={s.status}>{s.status}</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">Min: {s.minStock}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <SearchBar value={filters.search ?? ''} onChange={(s) => setFilters((f) => ({ ...f, search: s, page: 1 }))} className="flex-1" />
          <select value={filters.type ?? ''} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value as StockMovement['type'] || undefined, page: 1 }))} className="input-base w-48">
            {typeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        {isLoading && !data ? <div className="flex justify-center py-12"><Spinner label="Loading movements..." /></div> : (
          <Table columns={columns} data={data?.data ?? []} loading={isLoading} keyField="id" emptyMessage="No stock movements" />
        )}
        {data && <Pagination page={data.page} totalPages={data.totalPages} total={data.total} limit={data.limit} onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))} onLimitChange={(l) => setFilters((f) => ({ ...f, limit: l, page: 1 }))} />}
      </Card>

      <StockEntry isOpen={entryOpen} onClose={() => setEntryOpen(false)} onSaved={() => { queryClient.invalidateQueries({ queryKey: ['stock-movements'] }); queryClient.invalidateQueries({ queryKey: ['stock-summary'] }); setEntryOpen(false); }} />
      <StockExit isOpen={exitOpen} onClose={() => setExitOpen(false)} onSaved={() => { queryClient.invalidateQueries({ queryKey: ['stock-movements'] }); queryClient.invalidateQueries({ queryKey: ['stock-summary'] }); setExitOpen(false); }} />

    </div>
  );
}
