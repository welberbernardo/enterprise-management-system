import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { DateRangePicker } from '../../components/forms/DateRangePicker';
import { AreaChart } from '../../components/charts/AreaChart';
import { useNotification } from '../../hooks/useNotification';
import { getErrorMessage } from '../../services/api';
import { financeService } from '../../services/finance.service';
import { PageHeader } from '../../components/common/PageHeader';

export function CashFlow() {
  const notify = useNotification();
  const [range, setRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const { data, isLoading } = useQuery({
    queryKey: ['cash-flow', range],
    queryFn: () => financeService.getCashFlow(range),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Cash Flow" subtitle="Inflow, outflow and balance over time" />
      <Card>
        <div className="mb-4">
          <DateRangePicker
            startDate={range.startDate}
            endDate={range.endDate}
            onStartChange={(d) => setRange((r) => ({ ...r, startDate: d }))}
            onEndChange={(d) => setRange((r) => ({ ...r, endDate: d }))}
          />
        </div>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner label="Loading..." />
          </div>
        ) : (
          <AreaChart
            data={(data ?? []).map((p) => ({ date: p.date, Inflow: p.inflow, Outflow: p.outflow, Balance: p.balance }))}
            xKey="date"
            series={[
              { key: 'Inflow', name: 'Inflow', color: '#16a34a' },
              { key: 'Outflow', name: 'Outflow', color: '#dc2626' },
              { key: 'Balance', name: 'Balance', color: '#2563eb' },
            ]}
            height={320}
          />
        )}
      </Card>
    </div>
  );
}
