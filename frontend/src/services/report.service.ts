import { http } from './api';
import type { ReportType, ReportResult } from '../types/report.types';
import type { DateRange } from '../types/common.types';

export const reportService = {
  async generate(
    type: ReportType,
    range: DateRange,
    options?: { groupBy?: string },
  ): Promise<ReportResult> {
    return http.get<ReportResult>('/reports/generate', {
      type,
      startDate: range.startDate,
      endDate: range.endDate,
      groupBy: options?.groupBy,
    });
  },
  async exportPdf(type: ReportType, range: DateRange): Promise<Blob> {
    const response = await http.instance.get('/reports/export/pdf', {
      params: { type, startDate: range.startDate, endDate: range.endDate },
      responseType: 'blob',
    });
    return response.data as Blob;
  },
  async exportExcel(type: ReportType, range: DateRange): Promise<Blob> {
    const response = await http.instance.get('/reports/export/excel', {
      params: { type, startDate: range.startDate, endDate: range.endDate },
      responseType: 'blob',
    });
    return response.data as Blob;
  },
};
