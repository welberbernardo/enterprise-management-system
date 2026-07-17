import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { orderService } from '../../services/order.service';
import { useNotification } from '../../hooks/useNotification';
import { getErrorMessage } from '../../services/api';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Table, type Column } from '../../components/ui/Table';
import { Spinner } from '../../components/ui/Spinner';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { OrderItem } from '../../types/order.types';

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const notify = useNotification();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getById(id as string),
    enabled: Boolean(id),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner label="Loading order..." /></div>;
  if (!order) return <div className="text-center text-slate-500 py-20">Order not found</div>;

  const columns: Column<OrderItem>[] = [
    { key: 'productCode', header: 'Code', render: (row) => <span className="font-mono text-xs">{row.productCode}</span> },
    { key: 'productName', header: 'Product', render: (row) => row.productName },
    { key: 'quantity', header: 'Qty', align: 'right' },
    { key: 'unitPrice', header: 'Unit Price', align: 'right', render: (row) => formatCurrency(row.unitPrice) },
    { key: 'discount', header: 'Discount', align: 'right', render: (row) => formatCurrency(row.discount) },
    { key: 'total', header: 'Total', align: 'right', render: (row) => formatCurrency(row.total) },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Orders', to: '/orders' }, { label: order.orderNumber }]} />
      <PageHeader title={`Order ${order.orderNumber}`}
        actions={<Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}><Link to="/orders">Back</Link></Button>} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Items" />
          <Table columns={columns} data={order.items} keyField="id" />
          <div className="flex justify-end mt-4 space-y-1 text-sm">
            <div className="text-right space-y-1">
              <p className="text-slate-500">Subtotal: {formatCurrency(order.subtotal)}</p>
              <p className="text-slate-500">Tax: {formatCurrency(order.tax)}</p>
              <p className="text-slate-500">Discount: -{formatCurrency(order.discount)}</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">Total: {formatCurrency(order.total)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Information" />
          <dl className="space-y-3">
            <div><dt className="text-xs text-slate-400">Customer</dt><dd className="text-sm font-medium">{order.customerName}</dd></div>
            <div><dt className="text-xs text-slate-400">Date</dt><dd className="text-sm">{formatDate(order.date)}</dd></div>
            <div><dt className="text-xs text-slate-400">Status</dt><dd><Badge status={order.status} dot>{order.status}</Badge></dd></div>
            {order.notes && <div><dt className="text-xs text-slate-400">Notes</dt><dd className="text-sm">{order.notes}</dd></div>}
          </dl>
        </Card>
      </div>
    </div>
  );
}
