import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';
import { customerService } from '../../services/customer.service';

import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Tabs, TabPanel } from '../../components/ui/Tabs';
import { Avatar } from '../../components/ui/Avatar';
import { Spinner } from '../../components/ui/Spinner';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { formatCurrency } from '../../utils/formatters';
import { CustomerContacts } from './CustomerContacts';

export function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useStateTab();

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customerService.getById(id as string),
    enabled: Boolean(id),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner label="Loading customer..." /></div>;
  if (!customer) return <div className="text-center text-slate-500 py-20">Customer not found</div>;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Customers', to: '/customers' }, { label: customer.name }]} />
      <PageHeader title={customer.name}
        actions={<Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}><Link to="/customers">Back</Link></Button>} />

      <Card>
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <Avatar name={customer.name} size="xl" />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-semibold">{customer.name}</h2>
              <Badge status={customer.status} dot>{customer.status}</Badge>
              <Badge variant="secondary" className="font-mono">{customer.code}</Badge>
            </div>
            <div className="mt-2 space-y-1 text-sm text-slate-500">
              {customer.email && <p className="flex items-center gap-2"><Mail className="h-4 w-4" />{customer.email}</p>}
              {customer.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4" />{customer.phone}</p>}
              {customer.city && <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{customer.city}, {customer.country}</p>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Credit Limit</p>
            <p className="text-lg font-bold">{formatCurrency(customer.creditLimit ?? 0)}</p>
          </div>
        </div>
      </Card>

      <Card>
        <Tabs
          activeTab={tab}
          onChange={setTab}
          tabs={[
            { id: 'info', label: 'Information' },
            { id: 'contacts', label: 'Contacts' },
            { id: 'orders', label: 'Orders' },
          ]}
        />
        <TabPanel active={tab === 'info'}>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><dt className="text-xs text-slate-400">Tax ID</dt><dd className="text-sm">{customer.taxId || '-'}</dd></div>
            <div><dt className="text-xs text-slate-400">Address</dt><dd className="text-sm">{customer.address || '-'}</dd></div>
            <div><dt className="text-xs text-slate-400">Created</dt><dd className="text-sm">{new Date(customer.createdAt).toLocaleDateString()}</dd></div>
          </dl>
        </TabPanel>
        <TabPanel active={tab === 'contacts'}>
          <CustomerContacts customerId={customer.id} />
        </TabPanel>
        <TabPanel active={tab === 'orders'}>
          <p className="text-sm text-slate-500">Order history will be displayed here.</p>
        </TabPanel>
      </Card>
    </div>
  );
}

function useStateTab(): [string, (v: string) => void] {
  const [tab, setTab] = useState('info');
  return [tab, setTab];
}
