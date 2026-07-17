import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/helpers';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, id, ...props }, ref) => {
    const checkboxId = id || props.name;
    return (
      <label htmlFor={checkboxId} className={cn('inline-flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-300', className)}>
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:bg-slate-900 dark:border-slate-600"
          {...props}
        />
        {label}
      </label>
    );
  },
);

Checkbox.displayName = 'Checkbox';
