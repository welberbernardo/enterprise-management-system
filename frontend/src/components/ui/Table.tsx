import { cn } from '../../utils/helpers';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  keyField: keyof T;
  sortConfig?: { field: string; direction: 'asc' | 'desc' };
  onSort?: (field: string) => void;
  className?: string;
}

export function Table<T extends object>({
  columns,
  data,
  loading,
  emptyMessage = 'No data available',
  onRowClick,
  keyField,
  sortConfig,
  onSort,
  className,
}: TableProps<T>) {
  return (
    <div className={cn('overflow-x-auto w-full', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap',
                  col.align === 'center' && 'text-center',
                  col.align === 'right' && 'text-right',
                  col.sortable && 'cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200',
                  col.className,
                )}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <span className={cn('inline-flex items-center gap-1', col.align === 'right' && 'flex-row-reverse')}>
                  {col.header}
                  {col.sortable && (
                    <span className="text-xs">
                      {sortConfig?.field === col.key
                        ? sortConfig.direction === 'asc'
                          ? 'â–²'
                          : 'â–¼'
                        : 'â†•'}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="skeleton h-4 w-full rounded" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={String(row[keyField])}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'border-b border-slate-100 dark:border-slate-800 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50',
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right',
                      col.className,
                    )}
                  >
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
