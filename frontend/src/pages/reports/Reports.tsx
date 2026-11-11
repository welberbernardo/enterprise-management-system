import { useNavigate } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { reportTypes } from './reportTypes';

export function Reports() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <PageHeader title="Reports" subtitle="Generate and export business reports" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((r) => (
          <Card key={r.type} hoverable onClick={() => navigate(`/reports/${r.type.toLowerCase()}`)} className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold">{r.label} Report</h3>
              <p className="text-sm text-slate-500">View and export</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
