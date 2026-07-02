import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { getChartColors, tooltipContentStyle, CHART_SERIES_COLORS } from './chartTheme';

export default function AreaChartWidget({ data, series, xKey = 'name', stacked = false, showLegend = true }) {
  const [colors, setColors] = useState(getChartColors());

  useEffect(() => {
    setColors(getChartColors());
    const observer = new MutationObserver(() => setColors(getChartColors()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <defs>
          {series.map((s, i) => {
            const color = s.color || CHART_SERIES_COLORS[i % CHART_SERIES_COLORS.length];
            return (
              <linearGradient key={s.key} id={`area-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.32} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            );
          })}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11.5, fill: colors.axis }}
          axisLine={{ stroke: colors.grid }}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 11.5, fill: colors.axis }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipContentStyle(colors)} cursor={{ stroke: colors.grid }} />
        {showLegend && <Legend wrapperStyle={{ fontSize: 12.5, color: colors.text }} iconType="circle" />}
        {series.map((s, i) => {
          const color = s.color || CHART_SERIES_COLORS[i % CHART_SERIES_COLORS.length];
          return (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stackId={stacked ? 'stack' : undefined}
              stroke={color}
              strokeWidth={2}
              fill={`url(#area-${s.key})`}
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
}
