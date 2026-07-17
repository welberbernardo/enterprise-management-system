import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { useAuth } from './hooks/useAuth';

import { Login } from './pages/auth/Login';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';

import { Dashboard } from './pages/dashboard/Dashboard';
import { UsersList } from './pages/users/UsersList';
import { UserDetail } from './pages/users/UserDetail';
import { RolesList } from './pages/roles/RolesList';
import { RoleDetail } from './pages/roles/RoleDetail';
import { PermissionsList } from './pages/permissions/PermissionsList';
import { CustomersList } from './pages/customers/CustomersList';
import { CustomerDetail } from './pages/customers/CustomerDetail';
import { SuppliersList } from './pages/suppliers/SuppliersList';
import { CategoriesList } from './pages/categories/CategoriesList';
import { ProductsList } from './pages/products/ProductsList';
import { ProductDetail } from './pages/products/ProductDetail';
import { OrdersList } from './pages/orders/OrdersList';
import { OrderDetail } from './pages/orders/OrderDetail';
import { OrderPrint } from './pages/orders/OrderPrint';
import { InvoicesList } from './pages/invoices/InvoicesList';
import { InvoiceDetail } from './pages/invoices/InvoiceDetail';
import { InvoicePrint } from './pages/invoices/InvoicePrint';
import { InventoryList } from './pages/inventory/InventoryList';
import { StockHistory } from './pages/inventory/StockHistory';
import { Finance } from './pages/finance/Finance';
import { Reports } from './pages/reports/Reports';
import { SalesReport } from './pages/reports/SalesReport';
import { InventoryReport } from './pages/reports/InventoryReport';
import { CustomerReport } from './pages/reports/CustomerReport';
import { ProductReport } from './pages/reports/ProductReport';
import { FinancialReport } from './pages/reports/FinancialReport';
import { Settings } from './pages/settings/Settings';
import { Profile } from './pages/settings/Profile';
import { AuditLogs } from './pages/audit/AuditLogs';
import { ActivityHistory } from './pages/audit/ActivityHistory';
import { NotFound } from './pages/error/NotFound';
import { ServerError } from './pages/error/ServerError';

function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/500" element={<ServerError />} />

          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/users" element={<UsersList />} />
            <Route path="/users/:id" element={<UserDetail />} />

            <Route path="/roles" element={<RolesList />} />
            <Route path="/roles/:id" element={<RoleDetail />} />

            <Route path="/permissions" element={<PermissionsList />} />

            <Route path="/customers" element={<CustomersList />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />

            <Route path="/suppliers" element={<SuppliersList />} />

            <Route path="/categories" element={<CategoriesList />} />

            <Route path="/products" element={<ProductsList />} />
            <Route path="/products/:id" element={<ProductDetail />} />

            <Route path="/orders" element={<OrdersList />} />
            <Route path="/orders/:id" element={<OrderDetail />} />

            <Route path="/invoices" element={<InvoicesList />} />
            <Route path="/invoices/:id" element={<InvoiceDetail />} />

            <Route path="/inventory" element={<InventoryList />} />
            <Route path="/inventory/history" element={<StockHistory />} />

            <Route path="/finance" element={<Finance />} />

            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/sales" element={<SalesReport />} />
            <Route path="/reports/inventory" element={<InventoryReport />} />
            <Route path="/reports/customer" element={<CustomerReport />} />
            <Route path="/reports/product" element={<ProductReport />} />
            <Route path="/reports/financial" element={<FinancialReport />} />

            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/company" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />

            <Route path="/audit" element={<AuditLogs />} />
            <Route path="/audit/activity" element={<ActivityHistory />} />
          </Route>

          <Route path="/orders/:id/print" element={<OrderPrint />} />
          <Route path="/invoices/:id/print" element={<InvoicePrint />} />

          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
