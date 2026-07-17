import { PageHeader } from '../../components/common/PageHeader';
import { FinanceTransactions } from './FinanceTransactions';

export function AccountsReceivable() {
  return (
    <div className="space-y-6">
      <PageHeader title="Accounts Receivable" subtitle="Track what customers owe you" />
      <FinanceTransactions type="RECEIVABLE" title="Accounts Receivable" />
    </div>
  );
}
