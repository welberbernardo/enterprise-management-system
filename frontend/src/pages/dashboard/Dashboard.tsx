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
import { useNotification } from '../../hooks/useNotification';
import { PageHeader } from '../../components/common/PageHeader';

export function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardService.getData,
  });

  if (error) {
    return <div className="text-center text-danger-600 py-20">Failed to load dashboard data.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Welcome back to your enterprise overview" />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" label="Loading dashboard..." />
        </div>
      ) : (
        data && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                title="Total Orders"
                value={data.stats.totalOrders}
                icon={ShoppingCart}
                color="primary"
                growth={data.stats.ordersGrowth}
              />
              <StatCard
                title="Total Customers"
                value={data.stats.totalCustomers}
                icon={Users}
                color="info"
                growth={data.stats.customersGrowth}
              />
              <StatCard
                title="Total Products"
                value={data.stats.totalProducts}
                icon={Package}
                color="warning"
                growth={data.stats.productsGrowth}
              />
              <StatCard
                title="Revenue"
                value={data.stats.totalRevenue}
                icon={DollarSign}
                color="success"
                format="currency"
                growth={data.stats.revenueGrowth}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <CardHeader title="Sales Over Time" subtitle="Revenue and orders trend" />
                <LineChart
                  data={data.salesOverTime.map((p) => ({ date: p.date, Sales: p.sales, Orders: p.orders }))}
                  xKey="date"
                  series={[
                    { key: 'Sales', name: 'Sales ($)', color: '#2563eb' },
                    { key: 'Orders', name: 'Orders', color: '#16a34a' },
                  ]}
                  height={260}
                />
              </Card>

              <Card>
                <CardHeader title="Orders by Status" />
                <PieChart
                  data={data.ordersByStatus.map((s) => ({ name: s.status, value: s.count }))}
                  height={260}
                />
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <CardHeader
                  title="Top Products"
                  action={
                    <Link to="/products" className="text-sm text-primary-600 hover:underline flex items-center">
                      View all <ArrowRight className="h-4 w-4 ml-1" />
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
                    { key: 'Revenue', name: 'Revenue ($)', color: '#2563eb' },
                    { key: 'Quantity', name: 'Quantity', color: '#16a34a' },
                  ]}
                  height={260}
                />
              </Card>

              <Card>
                <CardHeader
                  title="Recent Activity"
                  action={
                    <Link to="/audit" className="text-sm text-primary-600 hover:underline">
                      View all
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
                title="Recent Orders"
                action={
                  <Link to="/orders" className="text-sm text-primary-600 hover:underline flex items-center">
                    View all <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                }
              />
              <Table
                keyField="id"
                columns={[
                  { key: 'orderNumber', header: 'Order #' },
                  { key: 'customerName', header: 'Customer' },
                  {
                    key: 'status',
                    header: 'Status',
                    render: (row) => <Badge status={row.status}>{row.status}</Badge>,
                  },
                  {
                    key: 'total',
                    header: 'Total',
                    align: 'right',
                    render: (row) => formatCurrency(row.total),
                  },
                  { key: 'date', header: 'Date', render: (row) => formatDateTime(row.date) },
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
                    <p className="text-sm text-slate-500">Pending Invoices</p>
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
                    <p className="text-sm text-slate-500">Low Stock Items</p>
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
                    <p className="text-sm text-slate-500">Total Suppliers</p>
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
