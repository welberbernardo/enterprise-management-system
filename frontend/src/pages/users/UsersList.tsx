import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Plus, Pencil, Trash2, ShieldCheck, MoreVertical } from 'lucide-react';
import { userService } from '../../services/user.service';
import { roleService } from '../../services/role.service';
import { useNotification } from '../../hooks/useNotification';
import { getErrorMessage } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table, type Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { SearchBar } from '../../components/forms/SearchBar';
import { Select } from '../../components/ui/Select';
import { Dropdown } from '../../components/ui/Dropdown';
import { Spinner } from '../../components/ui/Spinner';
import { formatDateTime } from '../../utils/formatters';
import { PAGINATION } from '../../utils/constants';
import type { User, UserFilters } from '../../types/user.types';
import { UserForm } from './UserForm';

export function UsersList() {
  const notify = useNotification();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    roleId: '',
    status: undefined,
    page: PAGINATION.DEFAULT_PAGE,
    limit: PAGINATION.DEFAULT_LIMIT,
  });
  const debouncedSearch = useDebounce(filters.search ?? '', 400);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users', { ...filters, search: debouncedSearch }],
    queryFn: () => userService.getAll({ ...filters, search: debouncedSearch }),
  });

  const { data: roles } = useQuery({
    queryKey: ['roles-all'],
    queryFn: () => roleService.getAll({ limit: 100 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.remove(id),
    onSuccess: () => {
      notify.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteId(null);
    },
  });

  const statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Inactive', value: 'INACTIVE' },
    { label: 'Suspended', value: 'SUSPENDED' },
    { label: 'Pending', value: 'PENDING' },
  ];

  const roleOptions = [
    { label: 'All Roles', value: '' },
    ...(roles?.data?.map((r) => ({ label: r.name, value: r.id })) ?? []),
  ];

  const columns: Column<User>[] = [
    {
      key: 'user',
      header: 'User',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.fullName} src={row.avatar} size="sm" />
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{row.fullName}</p>
            <p className="text-xs text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'roleName', header: 'Role', render: (row) => <Badge variant="info">{row.roleName}</Badge> },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge status={row.status} dot>{row.status}</Badge>,
    },
    { key: 'lastLogin', header: 'Last Login', render: (row) => row.lastLogin ? formatDateTime(row.lastLogin) : '-' },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (row) => (
        <Dropdown
          trigger={
            <button className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
              <MoreVertical className="h-4 w-4" />
            </button>
          }
          items={[
            {
              label: 'Assign Roles',
              icon: <ShieldCheck className="h-4 w-4" />,
              onClick: () => {
                setEditing(row);
                setFormOpen(true);
              },
            },
            {
              label: 'Edit',
              icon: <Pencil className="h-4 w-4" />,
              onClick: () => {
                setEditing(row);
                setFormOpen(true);
              },
            },
            {
              label: 'Delete',
              icon: <Trash2 className="h-4 w-4" />,
              danger: true,
              onClick: () => setDeleteId(row.id),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle="Manage system users and their access"
        actions={
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Add User
          </Button>
        }
      />

      <Card>
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <SearchBar
            value={filters.search ?? ''}
            onChange={(search) => setFilters((f) => ({ ...f, search, page: 1 }))}
            placeholder="Search users..."
            className="flex-1"
          />
          <div className="flex gap-3">
            <Select
              value={filters.roleId ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, roleId: e.target.value, page: 1 }))}
              options={roleOptions}
              className="w-40"
            />
            <Select
              value={filters.status ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as User['status'] || undefined, page: 1 }))}
              options={statusOptions}
              className="w-40"
            />
          </div>
        </div>

        {isLoading && !data ? (
          <div className="flex justify-center py-12">
            <Spinner label="Loading users..." />
          </div>
        ) : (
          <Table
            columns={columns}
            data={data?.data ?? []}
            loading={isLoading}
            keyField="id"
            emptyMessage="No users found"
          />
        )}

        {data && (
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            limit={data.limit}
            onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
            onLimitChange={(limit) => setFilters((f) => ({ ...f, limit, page: 1 }))}
          />
        )}
      </Card>

      <UserForm
        isOpen={formOpen}
        user={editing}
        roles={roles?.data ?? []}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ['users'] });
          setFormOpen(false);
          setEditing(null);
        }}
      />

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete User"
      />
    </div>
  );
}
