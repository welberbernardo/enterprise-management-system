import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function Spinner({ size = 'md', className, label }: SpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)} role="status">
      <Loader2 className={cn('animate-spin text-primary-600', sizeMap[size])} />
      {label && <span className="text-sm text-slate-500">{label}</span>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-900">
      <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
    </div>
  );
}
