import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { dashboardService } from '../../services/dashboard.service';
import { StatCard } from '../../components/charts/StatCard';
import { Card, CardHeader } from '../../components/ui/Card';
import { LineChart } from '../../components/charts/LineChart';
import { PieChart } from '../../components/charts/PieChart';
import { BarChart } from '../../components/charts/BarChart';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { formatCurrency, formatDateTime, formatRelativeTime } from '../../utils/formatters';
import { PageHeader } from '../../components/common/PageHeader';

export function Dashboard() {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardService.getData,
  });

  if (error) {
    return <div className="text-center text-danger-600 py-20">Não foi possível carregar o painel. Tente atualizar a página.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader title="Painel de gestão" subtitle="Indicadores e atividade da empresa" />
        <button type="button" onClick={() => void refetch()} disabled={isFetching}
          aria-label="Atualizar indicadores" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800">
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" label="A carregar indicadores..." />
        </div>
      ) : (
        data && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                title="Total de encomendas"
                value={data.stats.totalOrders}
                icon={ShoppingCart}
                color="primary"
                growth={data.stats.ordersGrowth}
              />
              <StatCard
                title="Total de clientes"
                value={data.stats.totalCustomers}
                icon={Users}
                color="info"
                growth={data.stats.customersGrowth}
              />
              <StatCard
                title="Total de produtos"
                value={data.stats.totalProducts}
                icon={Package}
                color="warning"
                growth={data.stats.productsGrowth}
              />
              <StatCard
                title="Faturação"
                value={data.stats.totalRevenue}
                icon={DollarSign}
                color="success"
                format="currency"
                growth={data.stats.revenueGrowth}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <CardHeader title="Evolução das vendas" subtitle="Faturação e encomendas ao longo do tempo" />
                <LineChart
                  data={data.salesOverTime.map((p) => ({ date: p.date, Sales: p.sales, Orders: p.orders }))}
                  xKey="date"
                  series={[
                    { key: 'Sales', name: 'Vendas', color: '#2563eb' },
                    { key: 'Orders', name: 'Orders', color: '#16a34a' },
                  ]}
                  height={260}
                />
              </Card>

              <Card>
                <CardHeader title="Encomendas por estado" />
                <PieChart
                  data={data.ordersByStatus.map((s) => ({ name: s.status, value: s.count }))}
                  height={260}
                />
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <CardHeader
                  title="Produtos mais vendidos"
                  action={
                    <Link to="/products" className="text-sm text-primary-600 hover:underline flex items-center">
                      Ver todos <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  }
                />
                <BarChart
                  data={data.topProducts.map((p) => ({
                    name: p.productName,
                    Revenue: p.revenue,
                    Quantity: p.quantity,
                  }))}
                  xKey="name"
                  series={[
                    { key: 'Revenue', name: 'Faturação', color: '#2563eb' },
                    { key: 'Quantity', name: 'Quantidade', color: '#16a34a' },
                  ]}
                  height={260}
                />
              </Card>

              <Card>
                <CardHeader
                  title="Atividade recente"
                  action={
                    <Link to="/audit" className="text-sm text-primary-600 hover:underline">
                      Ver todos
                    </Link>
                  }
                />
                <ul className="space-y-3">
                  {data.recentActivity.map((a) => (
                    <li key={a.id} className="flex items-start gap-3">
                      <div className="p-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 mt-0.5">
                        <Clock className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 dark:text-slate-200 truncate">{a.description}</p>
                        <p className="text-xs text-slate-400">{formatRelativeTime(a.timestamp)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <Card>
              <CardHeader
                title="Encomendas recentes"
                action={
                  <Link to="/orders" className="text-sm text-primary-600 hover:underline flex items-center">
                    Ver todos <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                }
              />
              <Table
                keyField="id"
                columns={[
                  { key: 'orderNumber', header: 'N.º encomenda' },
                  { key: 'customerName', header: 'Cliente' },
                  {
                    key: 'status',
                    header: 'Estado',
                    render: (row) => <Badge status={row.status}>{row.status}</Badge>,
                  },
                  {
                    key: 'total',
                    header: 'Total',
                    align: 'right',
                    render: (row) => formatCurrency(row.total),
                  },
                  { key: 'date', header: 'Data', render: (row) => formatDateTime(row.date) },
                ]}
                data={data.recentOrders}
              />
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning-100 text-warning-600 dark:bg-warning-500/20">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Faturas pendentes</p>
                    <p className="text-xl font-bold">{data.stats.pendingInvoices}</p>
                  </div>
                </div>
              </Card>
              <Card>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-danger-100 text-danger-600 dark:bg-danger-900/30">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Produtos com stock baixo</p>
                    <p className="text-xl font-bold">{data.stats.lowStockProducts}</p>
                  </div>
                </div>
              </Card>
              <Card>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total de fornecedores</p>
                    <p className="text-xl font-bold">{data.stats.totalSuppliers}</p>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )
      )}
    </div>
  );
}
