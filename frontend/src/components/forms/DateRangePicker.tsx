import { Calendar } from 'lucide-react';
import { Input } from '../ui/Input';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartChange: (date: string) => void;
  onEndChange: (date: string) => void;
  className?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  className,
}: DateRangePickerProps) {
  return (
    <div className={className}>
      <label className="label-base">Date Range</label>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="date"
            value={startDate}
            onChange={(e) => onStartChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <span className="hidden sm:flex items-center text-slate-400">to</span>
        <div className="relative flex-1">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => onEndChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    </div>
  );
}
