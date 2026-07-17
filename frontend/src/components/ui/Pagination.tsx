import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '../../utils/helpers';
import { PAGINATION } from '../../utils/constants';
import type { SelectOption } from '../../types/common.types';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  const safePage = Number.isFinite(page) ? page : 1;
  const safeTotalPages = Number.isFinite(totalPages) ? totalPages : 1;
  const safeTotal = Number.isFinite(total) ? total : 0;
  const safeLimit = Number.isFinite(limit) ? limit : 10;

  const start = safeTotal === 0 ? 0 : (safePage - 1) * safeLimit + 1;
  const end = Math.min(safePage * safeLimit, safeTotal);

  const pageSizeOptions: SelectOption[] = PAGINATION.PAGE_SIZE_OPTIONS.map((s) => ({
    label: `${s} / page`,
    value: String(s),
  }));

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 text-sm">
      <div className="text-slate-500 dark:text-slate-400">
        Showing <span className="font-medium">{start}</span> to{' '}
        <span className="font-medium">{end}</span> of <span className="font-medium">{safeTotal}</span> results
      </div>
      <div className="flex items-center gap-2">
        {onLimitChange && (
          <select
            value={String(safeLimit)}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1.5 text-sm"
          >
            {pageSizeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(1)}
            disabled={safePage === 1}
            className={cn(
              'p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40',
            )}
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => onPageChange(safePage - 1)}
            disabled={safePage === 1}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-3 py-1.5 text-slate-700 dark:text-slate-200">
            {safePage} / {safeTotalPages || 1}
          </span>
          <button
            onClick={() => onPageChange(safePage + 1)}
            disabled={safePage >= safeTotalPages}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => onPageChange(safeTotalPages)}
            disabled={safePage >= safeTotalPages}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40"
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
