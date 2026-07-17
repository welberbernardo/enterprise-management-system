import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTheme } from '../../hooks/useTheme';

interface BarChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  series: { key: string; name: string; color: string }[];
  height?: number;
  horizontal?: boolean;
}

export function BarChart({ data, xKey, series, height = 300, horizontal }: BarChartProps) {
  const { theme } = useTheme();
  const axisColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBar data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        {horizontal ? (
          <>
            <XAxis type="number" tick={{ fill: axisColor, fontSize: 12 }} />
            <YAxis type="category" dataKey={xKey} tick={{ fill: axisColor, fontSize: 12 }} width={100} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={{ fill: axisColor, fontSize: 12 }} />
            <YAxis tick={{ fill: axisColor, fontSize: 12 }} />
          </>
        )}
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
          <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={[4, 4, 0, 0]} />
        ))}
      </RechartsBar>
    </ResponsiveContainer>
  );
}
