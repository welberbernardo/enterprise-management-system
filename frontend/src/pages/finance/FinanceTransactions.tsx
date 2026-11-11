import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Table, type Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { SearchBar } from '../../components/forms/SearchBar';
import { useNotification } from '../../hooks/useNotification';
import { financeService } from '../../services/finance.service';
import { useDebounce } from '../../hooks/useDebounce';
import { PAGINATION } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { FinanceTransaction, TransactionType } from '../../types/finance.types';

interface FinanceTransactionsProps {
  type: TransactionType;
  title: string;
}

export function FinanceTransactions({ type, title }: FinanceTransactionsProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(PAGINATION.DEFAULT_PAGE);
  const debounced = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ['finance', type, { search: debounced, page }],
    queryFn: () =>
      type === 'PAYABLE'
        ? financeService.getPayables({ search: debounced, page, limit: PAGINATION.DEFAULT_LIMIT })
        : financeService.getReceivables({ search: debounced, page, limit: PAGINATION.DEFAULT_LIMIT }),
  });

  const columns: Column<FinanceTransaction>[] = [
    { key: 'reference', header: 'Reference', render: (row) => <span className="font-mono text-xs">{row.reference}</span> },
    { key: 'partyName', header: type === 'PAYABLE' ? 'Supplier' : 'Customer', render: (row) => row.partyName },
    { key: 'category', header: 'Category', render: (row) => row.category },
    { key: 'dueDate', header: 'Due Date', render: (row) => formatDate(row.dueDate) },
    { key: 'amount', header: 'Amount', align: 'right', render: (row) => formatCurrency(row.amount) },
    { key: 'remaining', header: 'Remaining', align: 'right', render: (row) => <span className="text-danger-600">{formatCurrency(row.remaining)}</span> },
    { key: 'status', header: 'Status', render: (row) => <Badge status={row.status} dot>{row.status}</Badge> },
  ];

  return (
    <Card>
      <div className="mb-4">
        <SearchBar value={search} onChange={(s) => { setSearch(s); setPage(1); }} placeholder={`Search ${title.toLowerCase()}...`} />
      </div>
      {isLoading && !data ? (
        <div className="flex justify-center py-12"><Spinner label={`Loading ${title.toLowerCase()}...`} /></div>
      ) : (
        <Table columns={columns} data={data?.data ?? []} loading={isLoading} keyField="id" emptyMessage={`No ${title.toLowerCase()} found`} />
      )}
      {data && (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          total={data.total}
          limit={data.limit}
          onPageChange={setPage}
        />
      )}
    </Card>
  );
}
