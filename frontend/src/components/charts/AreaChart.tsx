import {
  AreaChart as RechartsArea,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTheme } from '../../hooks/useTheme';

interface AreaChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  series: { key: string; name: string; color: string }[];
  height?: number;
}

export function AreaChart({ data, xKey, series, height = 300 }: AreaChartProps) {
  const { theme } = useTheme();
  const axisColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsArea data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={s.color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis dataKey={xKey} tick={{ fill: axisColor, fontSize: 12 }} />
        <YAxis tick={{ fill: axisColor, fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
            border: `1px solid ${gridColor}`,
            borderRadius: 8,
            color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {series.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color}
            strokeWidth={2}
            fill={`url(#grad-${s.key})`}
          />
        ))}
      </RechartsArea>
    </ResponsiveContainer>
  );
}
