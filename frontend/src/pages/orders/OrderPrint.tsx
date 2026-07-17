import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { orderService } from '../../services/order.service';
import { useNotification } from '../../hooks/useNotification';
import { getErrorMessage } from '../../services/api';
import { Spinner } from '../../components/ui/Spinner';
import { formatCurrency, formatDate } from '../../utils/formatters';

export function OrderPrint() {
  const { id } = useParams<{ id: string }>();
  const notify = useNotification();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order-print', id],
    queryFn: () => orderService.getById(id as string),
    enabled: Boolean(id),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner label="Loading..." /></div>;
  if (!order) return <div className="text-center py-20">Order not found</div>;

  return (
    <div className="min-h-screen bg-white p-8 max-w-3xl mx-auto text-slate-900 print:p-0">
      <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Enterprise Management</h1>
          <p className="text-sm text-slate-500">Order Document</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg">{order.orderNumber}</p>
          <p className="text-sm text-slate-500">{formatDate(order.date)}</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm"><span className="font-semibold">Customer:</span> {order.customerName}</p>
        <p className="text-sm"><span className="font-semibold">Status:</span> {order.status}</p>
      </div>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-300 text-left">
            <th className="py-2">Code</th>
            <th>Product</th>
            <th className="text-right">Qty</th>
            <th className="text-right">Price</th>
            <th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id} className="border-b border-slate-100">
              <td className="py-2 font-mono text-xs">{item.productCode}</td>
              <td>{item.productName}</td>
              <td className="text-right">{item.quantity}</td>
              <td className="text-right">{formatCurrency(item.unitPrice)}</td>
              <td className="text-right">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mt-4 space-y-1 text-sm">
        <div className="text-right space-y-1">
          <p>Subtotal: {formatCurrency(order.subtotal)}</p>
          <p>Tax: {formatCurrency(order.tax)}</p>
          <p>Discount: -{formatCurrency(order.discount)}</p>
          <p className="text-lg font-bold">Total: {formatCurrency(order.total)}</p>
        </div>
      </div>

      <div className="mt-12 text-center text-xs text-slate-400">
        This is a computer-generated document.
      </div>

      <button onClick={() => window.print()} className="mt-6 px-4 py-2 bg-primary-600 text-white rounded print:hidden">
        Print
      </button>
    </div>
  );
}
