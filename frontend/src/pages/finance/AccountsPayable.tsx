import { PageHeader } from '../../components/common/PageHeader';
import { FinanceTransactions } from './FinanceTransactions';

export function AccountsPayable() {
  return (
    <div className="space-y-6">
      <PageHeader title="Accounts Payable" subtitle="Track what you owe to suppliers" />
      <FinanceTransactions type="PAYABLE" title="Accounts Payable" />
    </div>
  );
}
