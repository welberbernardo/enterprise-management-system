import { Card } from '../ui/Card';
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { cn } from '../../utils/helpers';
import { formatNumber, formatPercent } from '../../utils/formatters';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  growth?: number;
  format?: 'number' | 'currency' | 'percent';
  loading?: boolean;
  currency?: string;
}

const colorMap = {
  primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
  success: 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400',
  warning: 'bg-warning-100 text-warning-600 dark:bg-warning-500/20 dark:text-warning-500',
  danger: 'bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400',
  info: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
};

export function StatCard({
  title,
  value,
  icon: Icon,
  color = 'primary',
  growth,
  format = 'number',
  loading,
  currency = 'USD',
}: StatCardProps) {
  const formattedValue =
    format === 'currency'
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value)
      : format === 'percent'
        ? formatPercent(value)
        : formatNumber(value);

  const isPositive = (growth ?? 0) >= 0;

  if (loading) {
    return (
      <Card>
        <div className="skeleton h-4 w-24 rounded mb-3" />
        <div className="skeleton h-8 w-32 rounded" />
        <div className="skeleton h-4 w-20 rounded mt-3" />
      </Card>
    );
  }

  return (
    <Card hoverable className="animate-slide-up">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formattedValue}</p>
          {growth !== undefined && (
            <div
              className={cn(
                'flex items-center gap-1 mt-2 text-xs font-medium',
                isPositive ? 'text-success-600' : 'text-danger-600',
              )}
            >
              {isPositive ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {formatPercent(Math.abs(growth))}
              <span className="text-slate-400 font-normal">vs last period</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', colorMap[color])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
