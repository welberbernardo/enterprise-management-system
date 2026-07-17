import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Plus, Pencil, Trash2, FolderTree } from 'lucide-react';
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
import { Spinner } from '../../components/ui/Spinner';
import { PAGINATION } from '../../utils/constants';
import type { Category } from '../../types/category.types';
import { CategoryForm } from './CategoryForm';

export function CategoriesList() {
  const notify = useNotification();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(PAGINATION.DEFAULT_PAGE);
  const debounced = useDebounce(search, 400);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['categories', { search: debounced, page }],
    queryFn: () => categoryService.getAll({ search: debounced, page, limit: PAGINATION.DEFAULT_LIMIT }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryService.remove(id),
    onSuccess: () => { notify.success('Category deleted'); queryClient.invalidateQueries({ queryKey: ['categories'] }); setDeleteId(null); },
  });

  const columns: Column<Category>[] = [
    { key: 'name', header: 'Name', render: (row) => <span className="font-medium flex items-center gap-2"><FolderTree className="h-4 w-4 text-primary-500" />{row.name}</span> },
    { key: 'parentName', header: 'Parent', render: (row) => row.parentName || '-' },
    { key: 'description', header: 'Description', render: (row) => row.description || '-' },
    { key: 'productCount', header: 'Products', align: 'center', render: (row) => <Badge variant="info">{row.productCount ?? 0}</Badge> },
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
      <PageHeader title="Categories" subtitle="Organize products into categories"
        actions={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => { setEditing(null); setFormOpen(true); }}>Add Category</Button>} />

      <Card>
        <div className="mb-4"><SearchBar value={search} onChange={(s) => { setSearch(s); setPage(1); }} /></div>
        {isLoading && !data ? <div className="flex justify-center py-12"><Spinner label="Loading categories..." /></div> : (
          <Table columns={columns} data={data?.data ?? []} loading={isLoading} keyField="id" emptyMessage="No categories found" />
        )}
        {data && <Pagination page={data.page} totalPages={data.totalPages} total={data.total} limit={data.limit} onPageChange={setPage} />}
      </Card>

      <CategoryForm isOpen={formOpen} category={editing} onClose={() => { setFormOpen(false); setEditing(null); }}
        onSaved={() => { queryClient.invalidateQueries({ queryKey: ['categories'] }); setFormOpen(false); setEditing(null); }} />

      <ConfirmDialog isOpen={deleteId !== null} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} loading={deleteMutation.isPending}
        message="Delete this category? Products in this category may be affected." confirmText="Delete Category" />
    </div>
  );
}
