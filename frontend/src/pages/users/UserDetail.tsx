import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Shield, Calendar } from 'lucide-react';
import { userService } from '../../services/user.service';
import { useNotification } from '../../hooks/useNotification';

import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { formatDateTime } from '../../utils/formatters';

export function UserDetail() {
  const { id } = useParams<{ id: string }>();


  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getById(id as string),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner label="Loading user..." />
      </div>
    );
  }

  if (!user) {
    return <EmptyState title="User not found" description="The requested user does not exist" />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Users', to: '/users' }, { label: user.fullName }]} />
      <PageHeader
        title="User Details"
        actions={
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            <Link to="/users">Back</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 flex flex-col items-center text-center">
          <Avatar name={user.fullName} src={user.avatar} size="xl" />
          <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">{user.fullName}</h2>
          <p className="text-sm text-slate-500">{user.email}</p>
          <div className="mt-3">
            <Badge status={user.status} dot>{user.status}</Badge>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-primary-600">
            <Shield className="h-4 w-4" />
            {user.roles.map((r) => r.name).join(', ') || user.roleName}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Information" />
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-slate-400" />
              <div>
                <dt className="text-xs text-slate-400">Email</dt>
                <dd className="text-sm text-slate-700 dark:text-slate-200">{user.email}</dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-slate-400" />
              <div>
                <dt className="text-xs text-slate-400">Phone</dt>
                <dd className="text-sm text-slate-700 dark:text-slate-200">{user.phone || '-'}</dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-slate-400" />
              <div>
                <dt className="text-xs text-slate-400">Role</dt>
                <dd className="text-sm text-slate-700 dark:text-slate-200">{user.roleName}</dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-slate-400" />
              <div>
                <dt className="text-xs text-slate-400">Last Login</dt>
                <dd className="text-sm text-slate-700 dark:text-slate-200">
                  {user.lastLogin ? formatDateTime(user.lastLogin) : 'Never'}
                </dd>
              </div>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}
