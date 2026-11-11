import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Barcode } from 'lucide-react';
import { productService } from '../../services/product.service';

import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { formatCurrency } from '../../utils/formatters';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();


  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getById(id as string),
    enabled: Boolean(id),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner label="Loading product..." /></div>;
  if (!product) return <div className="text-center text-slate-500 py-20">Product not found</div>;

  const margin = product.salePrice - product.costPrice;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Products', to: '/products' }, { label: product.name }]} />
      <PageHeader title={product.name}
        actions={<Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}><Link to="/products">Back</Link></Button>} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 flex flex-col items-center">
          {product.image ? (
            <img src={product.image} alt={product.name} className="h-40 w-40 object-cover rounded-lg" />
          ) : (
            <div className="h-40 w-40 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center"><Package className="h-16 w-16" /></div>
          )}
          <div className="mt-3 flex gap-2">
            <Badge variant="secondary" className="font-mono">{product.code}</Badge>
            <Badge status={product.status}>{product.status}</Badge>
          </div>
          {product.barcode && (
            <p className="mt-2 text-xs text-slate-400 flex items-center gap-1"><Barcode className="h-3 w-3" />{product.barcode}</p>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Pricing & Inventory" />
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><dt className="text-xs text-slate-400">Category</dt><dd className="text-sm">{product.categoryName}</dd></div>
            <div><dt className="text-xs text-slate-400">Unit</dt><dd className="text-sm">{product.unit}</dd></div>
            <div><dt className="text-xs text-slate-400">Cost Price</dt><dd className="text-sm">{formatCurrency(product.costPrice)}</dd></div>
            <div><dt className="text-xs text-slate-400">Sale Price</dt><dd className="text-sm font-semibold text-primary-600">{formatCurrency(product.salePrice)}</dd></div>
            <div><dt className="text-xs text-slate-400">Margin</dt><dd className="text-sm">{formatCurrency(margin)}</dd></div>
            <div><dt className="text-xs text-slate-400">Stock</dt><dd className="text-sm">{product.stock} (min {product.minStock})</dd></div>
          </dl>
          {product.description && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-300">{product.description}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
