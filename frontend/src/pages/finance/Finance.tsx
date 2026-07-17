import { Tabs, TabPanel } from '../../components/ui/Tabs';
import { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { AccountsPayable } from './AccountsPayable';
import { AccountsReceivable } from './AccountsReceivable';
import { CashFlow } from './CashFlow';

export function Finance() {
  const [tab, setTab] = useState('payable');

  return (
    <div className="space-y-6">
      <PageHeader title="Finance" subtitle="Manage payables, receivables and cash flow" />
      <Tabs
        activeTab={tab}
        onChange={setTab}
        tabs={[
          { id: 'payable', label: 'Accounts Payable' },
          { id: 'receivable', label: 'Accounts Receivable' },
          { id: 'cashflow', label: 'Cash Flow' },
        ]}
      />
      <TabPanel active={tab === 'payable'}><AccountsPayable /></TabPanel>
      <TabPanel active={tab === 'receivable'}><AccountsReceivable /></TabPanel>
      <TabPanel active={tab === 'cashflow'}><CashFlow /></TabPanel>
    </div>
  );
}
