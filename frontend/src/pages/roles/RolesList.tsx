import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { roleService } from '../../services/role.service';
import { permissionService } from '../../services/permission.service';
import { useNotification } from '../../hooks/useNotification';
import { getErrorMessage } from '../../services/api';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table, type Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Spinner } from '../../components/ui/Spinner';
import { PAGINATION } from '../../utils/constants';
import type { Role } from '../../types/role.types';
import { RoleForm } from './RoleForm';

export function RolesList() {
  const notify = useNotification();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(PAGINATION.DEFAULT_PAGE);
  const [limit] = useState(PAGINATION.DEFAULT_LIMIT);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['roles', page, limit],
    queryFn: () => roleService.getAll({ page, limit }),
  });

  const { data: permissions } = useQuery({
    queryKey: ['permissions-all'],
    queryFn: () => permissionService.getAll({ limit: 500 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => roleService.remove(id),
    onSuccess: () => {
      notify.success('Role deleted');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setDeleteId(null);
    },
  });

  const columns: Column<Role>[] = [
    { key: 'name', header: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'description', header: 'Description', render: (row) => row.description || '-' },
    {
      key: 'permissions',
      header: 'Permissions',
      render: (row) => <Badge variant="info">{row.permissions.length} permissions</Badge>,
    },
    {
      key: 'userCount',
      header: 'Users',
      align: 'center',
      render: (row) => row.userCount ?? 0,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => { setEditing(row); setFormOpen(true); }} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary-600" title="Edit">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => setDeleteId(row.id)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-danger-600" title="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles"
        subtitle="Define roles and assign permissions"
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => { setEditing(null); setFormOpen(true); }}>
            Add Role
          </Button>
        }
      />

      <Card>
        {isLoading && !data ? (
          <div className="flex justify-center py-12"><Spinner label="Loading roles..." /></div>
        ) : (
          <Table columns={columns} data={data?.data ?? []} loading={isLoading} keyField="id" emptyMessage="No roles found" />
        )}
        {data && (
          <Pagination page={data.page} totalPages={data.totalPages} total={data.total} limit={data.limit} onPageChange={setPage} />
        )}
      </Card>

      <RoleForm
        isOpen={formOpen}
        role={editing}
        permissions={permissions?.data ?? []}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSaved={() => { queryClient.invalidateQueries({ queryKey: ['roles'] }); setFormOpen(false); setEditing(null); }}
      />

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
        message="Are you sure you want to delete this role? Users with this role may lose access."
        confirmText="Delete Role"
      />
    </div>
  );
}
