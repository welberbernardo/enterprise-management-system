import { cn } from '../../utils/helpers';
import { getInitials } from '../../utils/formatters';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sizeMap: Record<Size, string> = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
  xl: 'h-16 w-16 text-xl',
};

interface AvatarProps {
  src?: string;
  name: string;
  size?: Size;
  className?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
}

export function Avatar({ src, name, size = 'md', className, status }: AvatarProps) {
  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn('rounded-full object-cover', sizeMap[size])}
        />
      ) : (
        <div
          className={cn(
            'rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-semibold flex items-center justify-center',
            sizeMap[size],
          )}
        >
          {getInitials(name)}
        </div>
      )}
      {status && (
        <span
          className={cn('absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-slate-800', {
            'bg-success-500': status === 'online',
            'bg-slate-400': status === 'offline',
            'bg-danger-500': status === 'busy',
            'bg-warning-500': status === 'away',
          })}
        />
      )}
    </div>
  );
}
