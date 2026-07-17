import { type ReactNode } from 'react';
import { Inbox, FileX, Users, Package, ShoppingCart } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: 'default' | 'search' | 'users' | 'products' | 'orders';
}

const variantIcons = {
  default: Inbox,
  search: FileX,
  users: Users,
  products: Package,
  orders: ShoppingCart,
};

export function EmptyState({ icon, title, description, action, variant = 'default' }: EmptyStateProps) {
  const Icon = icon ? null : variantIcons[variant];
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
      <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-4">
        {icon ?? (Icon && <Icon className="h-8 w-8" />)}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
