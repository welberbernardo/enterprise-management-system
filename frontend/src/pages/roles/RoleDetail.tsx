import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { roleService } from '../../services/role.service';

import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

export function RoleDetail() {
  const { id } = useParams<{ id: string }>();


  const { data: role, isLoading } = useQuery({
    queryKey: ['role', id],
    queryFn: () => roleService.getById(id as string),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><Spinner label="Loading role..." /></div>;
  }

  if (!role) {
    return <div className="text-center text-slate-500 py-20">Role not found</div>;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Roles', to: '/roles' }, { label: role.name }]} />
      <PageHeader
        title="Role Details"
        actions={
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            <Link to="/roles">Back</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{role.name}</h2>
              <p className="text-sm text-slate-500">{role.description}</p>
            </div>
          </div>
          <div className="mt-4">
            <Badge variant="info">{role.userCount ?? 0} users</Badge>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Permissions" subtitle={`${role.permissions.length} assigned`} />
          <div className="flex flex-wrap gap-2">
            {role.permissions.map((p) => (
              <Badge key={p} variant="secondary">{p}</Badge>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
