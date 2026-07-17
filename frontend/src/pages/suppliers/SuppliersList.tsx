import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Truck, Mail, Phone } from 'lucide-react';
import { supplierService } from '../../services/supplier.service';
import { useNotification } from '../../hooks/useNotification';
import { getErrorMessage } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table, type Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { SearchBar } from '../../components/forms/SearchBar';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { PAGINATION } from '../../utils/constants';
import type { Supplier, SupplierFilters } from '../../types/supplier.types';
import { SupplierForm } from './SupplierForm';

export function SuppliersList() {
  const notify = useNotification();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<SupplierFilters>({ search: '', page: PAGINATION.DEFAULT_PAGE, limit: PAGINATION.DEFAULT_LIMIT, status: undefined });
  const debounced = useDebounce(filters.search ?? '', 400);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', { ...filters, search: debounced }],
    queryFn: () => supplierService.getAll({ ...filters, search: debounced }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => supplierService.remove(id),
    onSuccess: () => { notify.success('Supplier deleted'); queryClient.invalidateQueries({ queryKey: ['suppliers'] }); setDeleteId(null); },
  });

  const statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Inactive', value: 'INACTIVE' },
    { label: 'Blocked', value: 'BLOCKED' },
  ];

  const columns: Column<Supplier>[] = [
    { key: 'code', header: 'Code', render: (row) => <span className="font-mono text-xs">{row.code}</span> },
    {
      key: 'name', header: 'Name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30"><Truck className="h-4 w-4" /></div>
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1"><Mail className="h-3 w-3" />{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'contactName', header: 'Contact', render: (row) => row.contactName || '-' },
    { key: 'phone', header: 'Phone', render: (row) => <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-slate-400" />{row.phone || '-'}</span> },
    { key: 'status', header: 'Status', render: (row) => <Badge status={row.status} dot>{row.status}</Badge> },
    {
      key: 'actions', header: '', align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => { setEditing(row); setFormOpen(true); }} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary-600"><Pencil className="h-4 w-4" /></button>
          <button onClick={() => setDeleteId(row.id)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-danger-600"><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Suppliers" subtitle="Manage your supply chain partners"
        actions={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => { setEditing(null); setFormOpen(true); }}>Add Supplier</Button>} />

      <Card>
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <SearchBar value={filters.search ?? ''} onChange={(s) => setFilters((f) => ({ ...f, search: s, page: 1 }))} className="flex-1" />
          <Select value={filters.status ?? ''} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as Supplier['status'] || undefined, page: 1 }))} options={statusOptions} className="w-48" />
        </div>
        {isLoading && !data ? <div className="flex justify-center py-12"><Spinner label="Loading suppliers..." /></div> : (
          <Table columns={columns} data={data?.data ?? []} loading={isLoading} keyField="id" emptyMessage="No suppliers found" />
        )}
        {data && <Pagination page={data.page} totalPages={data.totalPages} total={data.total} limit={data.limit} onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))} onLimitChange={(l) => setFilters((f) => ({ ...f, limit: l, page: 1 }))} />}
      </Card>

      <SupplierForm isOpen={formOpen} supplier={editing} onClose={() => { setFormOpen(false); setEditing(null); }}
        onSaved={() => { queryClient.invalidateQueries({ queryKey: ['suppliers'] }); setFormOpen(false); setEditing(null); }} />

      <ConfirmDialog isOpen={deleteId !== null} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} loading={deleteMutation.isPending}
        message="Delete this supplier? This cannot be undone." confirmText="Delete Supplier" />
    </div>
  );
}
