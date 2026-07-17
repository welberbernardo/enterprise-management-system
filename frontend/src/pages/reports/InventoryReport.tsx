import { ReportPage } from './ReportPage';

export function InventoryReport() {
  return <ReportPage type="INVENTORY" title="Inventory Report" subtitle="Stock levels and movement" chartType="bar" />;
}
