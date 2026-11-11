import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';


import { inventoryService } from '../../services/inventory.service';
import { Card } from '../../components/ui/Card';
import { Table, type Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { DateRangePicker } from '../../components/forms/DateRangePicker';
import { PAGINATION } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import type { StockMovement } from '../../types/inventory.types';

export function StockHistory() {

  const [page, setPage] = useState(PAGINATION.DEFAULT_PAGE);
  const [range, setRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const { data, isLoading } = useQuery({
    queryKey: ['stock-history', { page, range }],
    queryFn: () => inventoryService.getMovements({ ...range, page, limit: PAGINATION.DEFAULT_LIMIT }),
  });

  const columns: Column<StockMovement>[] = [
    { key: 'reference', header: 'Reference', render: (row) => <span className="font-mono text-xs">{row.reference}</span> },
    { key: 'productName', header: 'Product', render: (row) => row.productName },
    { key: 'type', header: 'Type', render: (row) => <Badge status={row.type}>{row.type}</Badge> },
    { key: 'quantity', header: 'Qty', align: 'right', render: (row) => `${row.type === 'EXIT' ? '-' : '+'}${row.quantity}` },
    { key: 'previousStock', header: 'Prev', align: 'right', render: (row) => row.previousStock },
    { key: 'newStock', header: 'New', align: 'right', render: (row) => row.newStock },
    { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
  ];

  return (
    <Card>
      <div className="mb-4">
        <DateRangePicker startDate={range.startDate} endDate={range.endDate} onStartChange={(d) => setRange((r) => ({ ...r, startDate: d }))} onEndChange={(d) => setRange((r) => ({ ...r, endDate: d }))} />
      </div>
      {isLoading ? <div className="flex justify-center py-12"><Spinner label="Loading history..." /></div> : (
        <Table columns={columns} data={data?.data ?? []} keyField="id" emptyMessage="No history" />
      )}
      {data && <Pagination page={data.page} totalPages={data.totalPages} total={data.total} limit={data.limit} onPageChange={setPage} />}
    </Card>
  );
}
