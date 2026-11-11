import type { ReportType } from '../../types/report.types';

export const reportTypes: { type: ReportType; label: string }[] = [
  { type: 'SALES', label: 'Sales' },
  { type: 'INVENTORY', label: 'Inventory' },
  { type: 'CUSTOMER', label: 'Customer' },
  { type: 'PRODUCT', label: 'Product' },
  { type: 'FINANCIAL', label: 'Financial' },
];
