import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Package, Barcode, AlertTriangle } from 'lucide-react';
import { productService } from '../../services/product.service';
import { categoryService } from '../../services/category.service';
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
import { formatCurrency } from '../../utils/formatters';
import type { Product, ProductFilters } from '../../types/product.types';
import { ProductForm } from './ProductForm';

export function ProductsList() {
  const notify = useNotification();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ProductFilters>({ search: '', page: PAGINATION.DEFAULT_PAGE, limit: PAGINATION.DEFAULT_LIMIT, status: undefined, categoryId: '' });
  const debounced = useDebounce(filters.search ?? '', 400);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['products', { ...filters, search: debounced }],
    queryFn: () => productService.getAll({ ...filters, search: debounced }),
  });

  const { data: categories } = useQuery({ queryKey: ['categories-all-products'], queryFn: () => categoryService.getAll({ limit: 100 }) });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.remove(id),
    onSuccess: () => { notify.success('Product deleted'); queryClient.invalidateQueries({ queryKey: ['products'] }); setDeleteId(null); },
  });

  const statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Inactive', value: 'INACTIVE' },
    { label: 'Discontinued', value: 'DISCONTINUED' },
  ];

  const categoryOptions = [
    { label: 'All Categories', value: '' },
    ...(categories?.data.map((c) => ({ label: c.name, value: c.id })) ?? []),
  ];

  const columns: Column<Product>[] = [
    {
      key: 'product', header: 'Product',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.image ? (
            <img src={row.image} alt={row.name} className="h-9 w-9 rounded object-cover" />
          ) : (
            <div className="p-2 rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30"><Package className="h-4 w-4" /></div>
          )}
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-xs text-slate-400 font-mono">{row.code}</p>
          </div>
        </div>
      ),
    },
    { key: 'categoryName', header: 'Category', render: (row) => <Badge variant="secondary">{row.categoryName}</Badge> },
    { key: 'price', header: 'Price', align: 'right', render: (row) => formatCurrency(row.salePrice) },
    {
      key: 'stock', header: 'Stock',
      render: (row) => (
        <span className="flex items-center gap-1">
          {row.stock <= row.minStock && <AlertTriangle className="h-3.5 w-3.5 text-warning-500" />}
          <span className={row.stock <= row.minStock ? 'text-warning-600 font-medium' : ''}>{row.stock}</span>
        </span>
      ),
    },
    { key: 'barcode', header: 'Barcode', render: (row) => row.barcode ? <span className="flex items-center gap-1 text-xs"><Barcode className="h-3 w-3" />{row.barcode}</span> : '-' },
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
      <PageHeader title="Products" subtitle="Manage your product catalog"
        actions={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => { setEditing(null); setFormOpen(true); }}>Add Product</Button>} />

      <Card>
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <SearchBar value={filters.search ?? ''} onChange={(s) => setFilters((f) => ({ ...f, search: s, page: 1 }))} className="flex-1" />
          <Select value={filters.categoryId ?? ''} onChange={(e) => setFilters((f) => ({ ...f, categoryId: e.target.value, page: 1 }))} options={categoryOptions} className="w-48" />
          <Select value={filters.status ?? ''} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as Product['status'] || undefined, page: 1 }))} options={statusOptions} className="w-40" />
        </div>
        {isLoading && !data ? <div className="flex justify-center py-12"><Spinner label="Loading products..." /></div> : (
          <Table columns={columns} data={data?.data ?? []} loading={isLoading} keyField="id" emptyMessage="No products found" />
        )}
        {data && <Pagination page={data.page} totalPages={data.totalPages} total={data.total} limit={data.limit} onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))} onLimitChange={(l) => setFilters((f) => ({ ...f, limit: l, page: 1 }))} />}
      </Card>

      <ProductForm isOpen={formOpen} product={editing} onClose={() => { setFormOpen(false); setEditing(null); }}
        onSaved={() => { queryClient.invalidateQueries({ queryKey: ['products'] }); setFormOpen(false); setEditing(null); }} />

      <ConfirmDialog isOpen={deleteId !== null} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} loading={deleteMutation.isPending}
        message="Delete this product? This cannot be undone." confirmText="Delete Product" />
    </div>
  );
}
