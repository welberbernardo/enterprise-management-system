import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../utils/helpers';

export interface DropdownItem {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, items, align = 'right', className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className={cn('relative inline-block', className)} ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            'absolute z-50 mt-2 min-w-[12rem] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg py-1 animate-scale-in',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {items.map((item, idx) =>
            item.divider ? (
              <div key={idx} className="my-1 border-t border-slate-200 dark:border-slate-700" />
            ) : (
              <button
                key={idx}
                disabled={item.disabled}
                onClick={() => {
                  item.onClick?.();
                  setOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                  item.danger
                    ? 'text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700',
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
