import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../utils/helpers';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable, padding = true, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'card',
          hoverable && 'hover:shadow-md transition-shadow cursor-pointer',
          padding && 'p-5',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

interface CardHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-4', className)}>
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mt-4 pt-4 border-t border-slate-200 dark:border-slate-700', className)}
      {...props}
    />
  );
}
