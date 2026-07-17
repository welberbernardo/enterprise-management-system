import { useState, type ReactNode } from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../utils/helpers';

interface FilterPanelProps {
  children: ReactNode;
  onApply?: () => void;
  onReset?: () => void;
  defaultOpen?: boolean;
  className?: string;
}

export function FilterPanel({ children, onApply, onReset, defaultOpen = false, className }: FilterPanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn('rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800', className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        <span className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="px-4 pb-4 animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-3">{children}</div>
          {(onApply || onReset) && (
            <div className="flex justify-end gap-2 mt-2">
              {onReset && (
                <Button variant="outline" size="sm" onClick={onReset}>
                  Reset
                </Button>
              )}
              {onApply && (
                <Button variant="primary" size="sm" onClick={onApply}>
                  Apply
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
