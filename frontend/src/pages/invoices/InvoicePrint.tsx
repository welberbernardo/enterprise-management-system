import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { invoiceService } from '../../services/invoice.service';


import { Spinner } from '../../components/ui/Spinner';
import { formatCurrency, formatDate } from '../../utils/formatters';

export function InvoicePrint() {
  const { id } = useParams<{ id: string }>();


  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice-print', id],
    queryFn: () => invoiceService.getById(id as string),
    enabled: Boolean(id),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner label="Loading..." /></div>;
  if (!invoice) return <div className="text-center py-20">Invoice not found</div>;

  return (
    <div className="min-h-screen bg-white p-8 max-w-3xl mx-auto text-slate-900 print:p-0">
      <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Enterprise Management</h1>
          <p className="text-sm text-slate-500">Invoice</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg">{invoice.invoiceNumber}</p>
          <p className="text-sm text-slate-500">{formatDate(invoice.issueDate)}</p>
        </div>
      </div>

      <div className="mb-6 flex justify-between text-sm">
        <div>
          <p className="font-semibold">Bill To:</p>
          <p>{invoice.customerName}</p>
        </div>
        <div className="text-right">
          <p>Due: {formatDate(invoice.dueDate)}</p>
          <p>Status: {invoice.status}</p>
        </div>
      </div>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-300 text-left">
            <th className="py-2">Description</th>
            <th className="text-right">Qty</th>
            <th className="text-right">Price</th>
            <th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id} className="border-b border-slate-100">
              <td className="py-2">{item.description}</td>
              <td className="text-right">{item.quantity}</td>
              <td className="text-right">{formatCurrency(item.unitPrice)}</td>
              <td className="text-right">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mt-4 text-sm">
        <div className="text-right space-y-1">
          <p>Subtotal: {formatCurrency(invoice.subtotal)}</p>
          <p>Tax: {formatCurrency(invoice.tax)}</p>
          <p className="text-lg font-bold">Total: {formatCurrency(invoice.total)}</p>
          <p className="text-slate-500">Paid: {formatCurrency(invoice.paidAmount)}</p>
        </div>
      </div>

      <button onClick={() => window.print()} className="mt-6 px-4 py-2 bg-primary-600 text-white rounded print:hidden">
        Print
      </button>
    </div>
  );
}
