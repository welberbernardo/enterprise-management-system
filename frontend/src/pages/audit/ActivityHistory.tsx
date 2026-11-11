import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Clock } from 'lucide-react';
import { auditService } from '../../services/audit.service';
import { useNotification } from '../../hooks/useNotification';
import { useDebounce } from '../../hooks/useDebounce';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { SearchBar } from '../../components/forms/SearchBar';
import { formatRelativeTime } from '../../utils/formatters';
import type { ActivityItem } from '../../types/audit.types';

export function ActivityHistory() {
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ['activity', debounced],
    queryFn: () => auditService.getActivity({ search: debounced, limit: 50 }),
  });

  if (isLoading) return <div className="flex justify-center py-12"><Spinner label="Loading activity..." /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Activity History" subtitle="Recent user activity across the system" />
      <Card>
        <div className="mb-4"><SearchBar value={search} onChange={setSearch} placeholder="Search activity..." /></div>
        <ul className="space-y-3">
          {(data?.data ?? []).map((a: ActivityItem) => (
            <li key={a.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <div className="p-1.5 rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 mt-0.5">
                <Clock className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-700 dark:text-slate-200">{a.description}</p>
                <p className="text-xs text-slate-400">{a.user} Â· {formatRelativeTime(a.timestamp)}</p>
              </div>
            </li>
          ))}
          {data?.data.length === 0 && <p className="text-center text-slate-500 py-8">No activity found</p>}
        </ul>
      </Card>
    </div>
  );
}
