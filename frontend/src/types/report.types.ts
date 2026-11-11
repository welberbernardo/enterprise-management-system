
export type ReportType =
  | 'SALES'
  | 'INVENTORY'
  | 'CUSTOMER'
  | 'PRODUCT'
  | 'FINANCIAL';

export interface ReportSummary {
  label: string;
  value: number;
  formatted: string;
}

export interface ReportDataPoint {
  label: string;
  value: number;
  [key: string]: string | number;
}

export interface ReportSeriesPoint {
  date: string;
  series: Record<string, number>;
}

export interface ReportResult {
  type: ReportType;
  title: string;
  startDate: string;
  endDate: string;
  summary: ReportSummary[];
  chartData: ReportDataPoint[] | ReportSeriesPoint[];
  tableData: Record<string, string | number>[];
  columns: string[];
}
