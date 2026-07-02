import { useEffect, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { getChartColors, tooltipContentStyle, CHART_SERIES_COLORS } from './chartTheme';

/**
 * @param {Array} data - [{ name: 'Solar', value: 320 }, ...]
 */
export default function DonutChartWidget({ data, centerLabel, centerValue }) {
  const [colors, setColors] = useState(getChartColors());

  useEffect(() => {
    setColors(getChartColors());
    const observer = new MutationObserver(() => setColors(getChartColors()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="62%"
            outerRadius="92%"
            paddingAngle={2}
            cornerRadius={6}
            strokeWidth={0}
          >
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={entry.color || CHART_SERIES_COLORS[i % CHART_SERIES_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipContentStyle(colors)} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{ fontSize: 12.5, color: colors.text }}
          />
        </PieChart>
      </ResponsiveContainer>
      {centerLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-6">
          <span className="text-xl font-semibold text-ink tabular">{centerValue}</span>
          <span className="text-2xs text-ink-muted">{centerLabel}</span>
        </div>
      )}
    </div>
  );
}
