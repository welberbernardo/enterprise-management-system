import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Fragment } from 'react';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400" aria-label="Breadcrumb">
      <Link to="/dashboard" className="flex items-center hover:text-slate-700 dark:hover:text-slate-200">
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, idx) => (
        <Fragment key={idx}>
          <ChevronRight className="h-4 w-4 mx-1" />
          {item.to ? (
            <Link to={item.to} className="hover:text-slate-700 dark:hover:text-slate-200">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-700 dark:text-slate-200 font-medium">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
