import { useQuery, useMutation } from '@tanstack/react-query';
import { settingService } from '../../services/setting.service';
import { useNotification } from '../../hooks/useNotification';

import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';

export function CompanySettings() {
  const notify = useNotification();
  const { data, isLoading } = useQuery({
    queryKey: ['company-settings'],
    queryFn: settingService.getCompany,
  });

  const mutation = useMutation({
    mutationFn: () => settingService.update({ company: data }),
    onSuccess: () => notify.success('Company settings saved'),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner label="Loading..." /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Company Settings" subtitle="Manage your organization information" />
      <Card>
        <CardHeader title="Company Information" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Company Name" defaultValue={data?.name} />
          <Input label="Legal Name" defaultValue={data?.legalName} />
          <Input label="Tax ID" defaultValue={data?.taxId} />
          <Input label="Email" type="email" defaultValue={data?.email} />
          <Input label="Phone" defaultValue={data?.phone} />
          <Input label="Website" defaultValue={data?.website} />
          <Input label="City" defaultValue={data?.city} />
          <Input label="Country" defaultValue={data?.country} />
        </div>
        <div className="mt-4">
          <Input label="Address" defaultValue={data?.address} />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>Save Changes</Button>
        </div>
      </Card>
    </div>
  );
}
