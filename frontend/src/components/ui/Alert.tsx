import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { cn } from '../../utils/helpers';

type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

const variantConfig: Record<
  AlertVariant,
  { icon: React.ReactNode; classes: string }
> = {
  info: {
    icon: <Info className="h-5 w-5" />,
    classes: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
  },
  success: {
    icon: <CheckCircle className="h-5 w-5" />,
    classes: 'bg-success-50 text-success-700 border-success-100 dark:bg-success-900/20 dark:text-success-300 dark:border-success-800',
  },
  warning: {
    icon: <AlertCircle className="h-5 w-5" />,
    classes: 'bg-warning-50 text-warning-600 border-warning-100 dark:bg-warning-500/10 dark:text-warning-500 dark:border-warning-800',
  },
  danger: {
    icon: <XCircle className="h-5 w-5" />,
    classes: 'bg-danger-50 text-danger-700 border-danger-100 dark:bg-danger-900/20 dark:text-danger-300 dark:border-danger-800',
  },
};

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Alert({ variant = 'info', title, children, onClose, className }: AlertProps) {
  const config = variantConfig[variant];
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4 animate-slide-up',
        config.classes,
        className,
      )}
      role="alert"
    >
      <span className="mt-0.5 shrink-0">{config.icon}</span>
      <div className="flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="text-sm mt-0.5">{children}</div>}
      </div>
      {onClose && (
        <button onClick={onClose} className="shrink-0 opacity-70 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
