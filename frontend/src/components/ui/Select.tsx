import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/helpers';
import type { SelectOption } from '../../types/common.types';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  hint?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, hint, className, id, ...props }, ref) => {
    const selectId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="label-base">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'input-base appearance-none pr-10',
              error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/30',
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
        {error ? (
          <p className="mt-1 text-xs text-danger-600">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs text-slate-400">{hint}</p>
        ) : null}
      </div>
    );
  },
);

Select.displayName = 'Select';
