import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { invoiceService } from '../../services/invoice.service';
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
import type { InvoiceItem } from '../../types/invoice.types';

export function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const notify = useNotification();

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoiceService.getById(id as string),
    enabled: Boolean(id),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner label="Loading invoice..." /></div>;
  if (!invoice) return <div className="text-center text-slate-500 py-20">Invoice not found</div>;

  const columns: Column<InvoiceItem>[] = [
    { key: 'description', header: 'Description', render: (row) => row.description },
    { key: 'quantity', header: 'Qty', align: 'right' },
    { key: 'unitPrice', header: 'Unit Price', align: 'right', render: (row) => formatCurrency(row.unitPrice) },
    { key: 'total', header: 'Total', align: 'right', render: (row) => formatCurrency(row.total) },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Invoices', to: '/invoices' }, { label: invoice.invoiceNumber }]} />
      <PageHeader title={`Invoice ${invoice.invoiceNumber}`}
        actions={<Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}><Link to="/invoices">Back</Link></Button>} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Items" />
          <Table columns={columns} data={invoice.items} keyField="id" />
          <div className="flex justify-end mt-4 text-sm">
            <div className="text-right space-y-1">
              <p className="text-slate-500">Subtotal: {formatCurrency(invoice.subtotal)}</p>
              <p className="text-slate-500">Tax: {formatCurrency(invoice.tax)}</p>
              <p className="text-lg font-bold">Total: {formatCurrency(invoice.total)}</p>
              <p className="text-slate-500">Paid: {formatCurrency(invoice.paidAmount)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Information" />
          <dl className="space-y-3">
            <div><dt className="text-xs text-slate-400">Customer</dt><dd className="text-sm font-medium">{invoice.customerName}</dd></div>
            <div><dt className="text-xs text-slate-400">Issue Date</dt><dd className="text-sm">{formatDate(invoice.issueDate)}</dd></div>
            <div><dt className="text-xs text-slate-400">Due Date</dt><dd className="text-sm">{formatDate(invoice.dueDate)}</dd></div>
            <div><dt className="text-xs text-slate-400">Status</dt><dd><Badge status={invoice.status} dot>{invoice.status}</Badge></dd></div>
            {invoice.notes && <div><dt className="text-xs text-slate-400">Notes</dt><dd className="text-sm">{invoice.notes}</dd></div>}
          </dl>
        </Card>
      </div>
    </div>
  );
}
