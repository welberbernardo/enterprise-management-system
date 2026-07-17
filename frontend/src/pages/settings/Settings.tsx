import { Tabs, TabPanel } from '../../components/ui/Tabs';
import { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { CompanySettings } from './CompanySettings';
import { Preferences } from './Preferences';

export function Settings() {
  const [tab, setTab] = useState('company');

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Configure system settings" />
      <Tabs
        activeTab={tab}
        onChange={setTab}
        tabs={[
          { id: 'company', label: 'Company' },
          { id: 'preferences', label: 'Preferences' },
        ]}
      />
      <TabPanel active={tab === 'company'}><CompanySettings /></TabPanel>
      <TabPanel active={tab === 'preferences'}><Preferences /></TabPanel>
    </div>
  );
}
