import { useQuery, useMutation } from '@tanstack/react-query';
import { settingService } from '../../services/setting.service';
import { useNotification } from '../../hooks/useNotification';

import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useTheme } from '../../hooks/useTheme';

export function Preferences() {
  const notify = useNotification();
  const { theme, setTheme } = useTheme();
  const { data, isLoading } = useQuery({
    queryKey: ['preferences'],
    queryFn: settingService.getPreferences,
  });

  const mutation = useMutation({
    mutationFn: () => settingService.update({ preferences: { defaultTheme: theme } }),
    onSuccess: () => notify.success('Preferences saved'),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner label="Loading..." /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Preferences" subtitle="Customize your experience" />
      <Card>
        <CardHeader title="General Preferences" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Theme" value={theme} onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
            options={[{ label: 'Light', value: 'light' }, { label: 'Dark', value: 'dark' }, { label: 'System', value: 'system' }]} />
          <Select label="Language" defaultValue={data?.language}
            options={[{ label: 'English', value: 'en' }, { label: 'Spanish', value: 'es' }, { label: 'French', value: 'fr' }]} />
          <Select label="Date Format" defaultValue={data?.dateFormat}
            options={[{ label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' }, { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' }, { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' }]} />
          <Select label="Time Format" defaultValue={data?.timeFormat}
            options={[{ label: '12h', value: '12h' }, { label: '24h', value: '24h' }]} />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>Save Preferences</Button>
        </div>
      </Card>
    </div>
  );
}
