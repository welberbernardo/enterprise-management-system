import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { reportService } from '../../services/report.service';
import { useNotification } from '../../hooks/useNotification';
import { getErrorMessage } from '../../services/api';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/charts/StatCard';
import { BarChart } from '../../components/charts/BarChart';
import { Table } from '../../components/ui/Table';
import { DateRangePicker } from '../../components/forms/DateRangePicker';
import { Spinner } from '../../components/ui/Spinner';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import type { ReportResult, ReportType } from '../../types/report.types';
import type { DateRange } from '../../types/common.types';

interface ReportPageProps {
  type: ReportType;
  title: string;
  subtitle: string;
  chartType?: 'bar' | 'line' | 'none';
}

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function ReportPage({ type, title, subtitle, chartType = 'bar' }: ReportPageProps) {
  const notify = useNotification();
  const [range, setRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const { data, isLoading } = useQuery<ReportResult>({
    queryKey: ['report', type, range],
    queryFn: () => reportService.generate(type, range),
  });

  const handleExport = async (fmt: 'pdf' | 'excel') => {
    try {
      if (fmt === 'pdf') {
        const blob = await reportService.exportPdf(type, range);
        downloadBlob(blob, `${type}-report.pdf`);
      } else {
        const blob = await reportService.exportExcel(type, range);
        downloadBlob(blob, `${type}-report.xlsx`);
      }
      notify.success(`Exported ${fmt.toUpperCase()}`);
    } catch (e) {
      notify.error(getErrorMessage(e));
    }
  };

  const summaryCards = data?.summary ?? [];
  const tableData = (data?.tableData ?? []) as Record<string, string | number>[];

  const renderChart = () => {
    if (chartType === 'none' || !data) return null;
    const chartData = data.chartData as Record<string, string | number>[];
    const first = chartData[0] ?? {};
    const valueKeys = Object.keys(first).filter((k) => k !== 'label' && k !== 'date');
    const xKey = chartData[0] && 'date' in chartData[0] ? 'date' : 'label';
    const series = valueKeys.map((k, i) => ({
      key: k,
      name: k,
      color: ['#2563eb', '#16a34a', '#f59e0b', '#dc2626'][i % 4],
    }));
    if (chartType === 'bar') {
      return <BarChart data={chartData} xKey={xKey} series={series} height={320} />;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<FileText className="h-4 w-4" />} onClick={() => handleExport('pdf')}>PDF</Button>
            <Button variant="outline" leftIcon={<FileSpreadsheet className="h-4 w-4" />} onClick={() => handleExport('excel')}>Excel</Button>
          </div>
        }
      />

      <Card>
        <DateRangePicker
          startDate={range.startDate}
          endDate={range.endDate}
          onStartChange={(d) => setRange((r) => ({ ...r, startDate: d }))}
          onEndChange={(d) => setRange((r) => ({ ...r, endDate: d }))}
        />
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner label="Generating report..." /></div>
      ) : (
        data && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {summaryCards.map((s, i) => (
                <StatCard
                  key={i}
                  title={s.label}
                  value={s.value}
                  icon={[Download][i % 1] || Download}
                  color={(['primary', 'success', 'warning', 'info'] as const)[i % 4]}
                  format={s.label.toLowerCase().includes('revenue') || s.label.toLowerCase().includes('amount') ? 'currency' : 'number'}
                />
              ))}
            </div>

            {chartType !== 'none' && (
              <Card>
                <CardHeader title={`${title} Visualization`} />
                {renderChart()}
              </Card>
            )}

            <Card>
              <CardHeader title="Details" />
              <Table
                keyField="label"
                columns={(data.columns.length ? data.columns : Object.keys(tableData[0] ?? {})).map((col) => ({
                  key: col,
                  header: col,
                  align: 'right' as const,
                  render: (row: Record<string, string | number>) =>
                    typeof row[col] === 'number' &&
                    (col.toLowerCase().includes('revenue') || col.toLowerCase().includes('amount'))
                      ? formatCurrency(Number(row[col]))
                      : typeof row[col] === 'number'
                        ? formatNumber(Number(row[col]))
                        : String(row[col]),
                }))}
                data={tableData}
                loading={isLoading}
                emptyMessage="No data"
              />
            </Card>
          </>
        )
      )}
    </div>
  );
}

export const reportTypes: { type: ReportType; label: string }[] = [
  { type: 'SALES', label: 'Sales' },
  { type: 'INVENTORY', label: 'Inventory' },
  { type: 'CUSTOMER', label: 'Customer' },
  { type: 'PRODUCT', label: 'Product' },
  { type: 'FINANCIAL', label: 'Financial' },
];
