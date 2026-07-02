import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { getChartColors, tooltipContentStyle, CHART_SERIES_COLORS } from './chartTheme';

export default function BarChartWidget({ data, series, xKey = 'name', stacked = false, showLegend = true }) {
  const [colors, setColors] = useState(getChartColors());

  useEffect(() => {
    setColors(getChartColors());
    const observer = new MutationObserver(() => setColors(getChartColors()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barGap={6}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11.5, fill: colors.axis }}
          axisLine={{ stroke: colors.grid }}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 11.5, fill: colors.axis }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipContentStyle(colors)} cursor={{ fill: colors.grid, opacity: 0.4 }} />
        {showLegend && <Legend wrapperStyle={{ fontSize: 12.5, color: colors.text }} iconType="circle" />}
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            stackId={stacked ? 'stack' : undefined}
            fill={s.color || CHART_SERIES_COLORS[i % CHART_SERIES_COLORS.length]}
            radius={stacked ? [0, 0, 0, 0] : [6, 6, 0, 0]}
            maxBarSize={36}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
