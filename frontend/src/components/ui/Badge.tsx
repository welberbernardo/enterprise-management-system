import { cn } from '../../utils/helpers';
import { STATUS_COLORS } from '../../utils/constants';

type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'light'
  | 'dark';

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
  secondary: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  success: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300',
  warning: 'bg-warning-100 text-warning-600 dark:bg-warning-500/20 dark:text-warning-500',
  danger: 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  light: 'bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300',
  dark: 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-800',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  status?: string;
  dot?: boolean;
  className?: string;
}

export function Badge({ children, variant = 'secondary', status, dot, className }: BadgeProps) {
  const resolvedVariant = (status ? STATUS_COLORS[status] : undefined) as BadgeVariant | undefined;
  const finalVariant = resolvedVariant ?? variant;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[finalVariant],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
