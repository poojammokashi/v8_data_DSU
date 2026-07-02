import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { getChartColors, tooltipContentStyle, CHART_SERIES_COLORS } from './chartTheme';

/**
 * @param {Array} data - [{ name: 'Mon', purchase: 120, generation: 98 }, ...]
 * @param {Array} series - [{ key: 'purchase', label: 'Power Purchase' }, ...]
 */
export default function LineChartWidget({ data, series, xKey = 'name', showLegend = true }) {
  const [colors, setColors] = useState(getChartColors());

  useEffect(() => {
    setColors(getChartColors());
    const observer = new MutationObserver(() => setColors(getChartColors()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
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
        {series.map((s, i) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color || CHART_SERIES_COLORS[i % CHART_SERIES_COLORS.length]}
            strokeWidth={2.25}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
