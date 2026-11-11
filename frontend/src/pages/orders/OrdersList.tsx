import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Printer, Eye } from 'lucide-react';
import { orderService } from '../../services/order.service';
import { customerService } from '../../services/customer.service';
import { useNotification } from '../../hooks/useNotification';

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
import { Dropdown } from '../../components/ui/Dropdown';
import { PAGINATION } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { Order, OrderFilters, OrderStatus } from '../../types/order.types';
import { OrderForm } from './OrderForm';

export function OrdersList() {
  const notify = useNotification();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<OrderFilters>({ search: '', page: PAGINATION.DEFAULT_PAGE, limit: PAGINATION.DEFAULT_LIMIT, status: undefined });
  const debounced = useDebounce(filters.search ?? '', 400);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', { ...filters, search: debounced }],
    queryFn: () => orderService.getAll({ ...filters, search: debounced }),
  });

  const { data: customers } = useQuery({ queryKey: ['customers-order-form'], queryFn: () => customerService.getAll({ limit: 100 }) });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => orderService.remove(id),
    onSuccess: () => { notify.success('Order deleted'); queryClient.invalidateQueries({ queryKey: ['orders'] }); setDeleteId(null); },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => orderService.changeStatus(id, status),
    onSuccess: () => { notify.success('Status updated'); queryClient.invalidateQueries({ queryKey: ['orders'] }); },
  });

  const statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Shipped', value: 'SHIPPED' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  const columns: Column<Order>[] = [
    {
      key: 'orderNumber', header: 'Order #',
      render: (row) => <span className="font-medium font-mono text-xs">{row.orderNumber}</span>,
    },
    { key: 'customerName', header: 'Customer', render: (row) => row.customerName },
    { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
    { key: 'status', header: 'Status', render: (row) => <Badge status={row.status} dot>{row.status}</Badge> },
    { key: 'total', header: 'Total', align: 'right', render: (row) => formatCurrency(row.total) },
    {
      key: 'actions', header: '', align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => { setEditing(row); setFormOpen(true); }} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary-600" title="Edit"><Pencil className="h-4 w-4" /></button>
          <button onClick={() => window.open(`/orders/${row.id}/print`, '_blank')} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary-600" title="Print"><Printer className="h-4 w-4" /></button>
          <Dropdown
            trigger={<button className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"><Eye className="h-4 w-4" /></button>}
            items={[
              { label: 'Mark Confirmed', onClick: () => statusMutation.mutate({ id: row.id, status: 'CONFIRMED' }) },
              { label: 'Mark Shipped', onClick: () => statusMutation.mutate({ id: row.id, status: 'SHIPPED' }) },
              { label: 'Mark Delivered', onClick: () => statusMutation.mutate({ id: row.id, status: 'DELIVERED' }) },
              { label: 'Cancel', danger: true, onClick: () => statusMutation.mutate({ id: row.id, status: 'CANCELLED' }) },
              { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, danger: true, onClick: () => setDeleteId(row.id) },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" subtitle="Track and manage customer orders"
        actions={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => { setEditing(null); setFormOpen(true); }}>New Order</Button>} />

      <Card>
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <SearchBar value={filters.search ?? ''} onChange={(s) => setFilters((f) => ({ ...f, search: s, page: 1 }))} className="flex-1" />
          <Select value={filters.status ?? ''} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as OrderStatus || undefined, page: 1 }))} options={statusOptions} className="w-48" />
        </div>
        {isLoading && !data ? <div className="flex justify-center py-12"><Spinner label="Loading orders..." /></div> : (
          <Table columns={columns} data={data?.data ?? []} loading={isLoading} keyField="id" emptyMessage="No orders found" />
        )}
        {data && <Pagination page={data.page} totalPages={data.totalPages} total={data.total} limit={data.limit} onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))} onLimitChange={(l) => setFilters((f) => ({ ...f, limit: l, page: 1 }))} />}
      </Card>

      <OrderForm isOpen={formOpen} order={editing} customers={customers?.data ?? []} onClose={() => { setFormOpen(false); setEditing(null); }}
        onSaved={() => { queryClient.invalidateQueries({ queryKey: ['orders'] }); setFormOpen(false); setEditing(null); }} />

      <ConfirmDialog isOpen={deleteId !== null} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} loading={deleteMutation.isPending}
        message="Delete this order? This cannot be undone." confirmText="Delete Order" />
    </div>
  );
}
