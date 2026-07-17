import { PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '../../hooks/useTheme';

interface PieChartProps {
  data: { name: string; value: number; color?: string }[];
  height?: number;
  colors?: string[];
  donut?: boolean;
}

const DEFAULT_COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2', '#db2777'];

export function PieChart({ data, height = 300, colors = DEFAULT_COLORS, donut }: PieChartProps) {
  const { theme } = useTheme();
  const axisColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPie>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={donut ? '55%' : 0}
          outerRadius="80%"
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color || colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
            border: `1px solid ${gridColor}`,
            borderRadius: 8,
            color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: axisColor }} />
      </RechartsPie>
    </ResponsiveContainer>
  );
}
