import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { EmptyState } from '../EmptyState/EmptyState.jsx';

const PALETTE = ['#3163f0', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#db2777', '#65a30d'];

function ChartShell({ title, subtitle, children, action }) {
  return (
    <div className="card p-4 flex flex-col gap-3 animate-fade-in">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-ink-light dark:text-ink-dark">{title}</h3>
          {subtitle && <p className="text-xs text-muted-light dark:text-muted-dark mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="h-64">{children}</div>
    </div>
  );
}

const axisStyle = { fontSize: 11, fill: 'currentColor' };
const tooltipStyle = {
  borderRadius: 10,
  border: '1px solid var(--tw-border-opacity, #e4e7ee)',
  fontSize: 12,
  backgroundColor: 'var(--chart-tooltip-bg, #ffffff)'
};

export function BarChartCard({ title, subtitle, data, xKey, yKey, color = PALETTE[0], action }) {
  if (!data || data.length === 0) {
    return (
      <ChartShell title={title} subtitle={subtitle} action={action}>
        <EmptyState variant="empty" title="No chartable data" />
      </ChartShell>
    );
  }
  return (
    <ChartShell title={title} subtitle={subtitle} action={action}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border-light dark:stroke-border-dark" vertical={false} />
          <XAxis dataKey={xKey} tick={axisStyle} interval={0} angle={-20} textAnchor="end" height={50} className="text-muted-light dark:text-muted-dark" />
          <YAxis tick={axisStyle} className="text-muted-light dark:text-muted-dark" />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(49,99,240,0.06)' }} />
          <Bar dataKey={yKey} fill={color} radius={[6, 6, 0, 0]} maxBarSize={42} />
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

export function LineChartCard({ title, subtitle, data, xKey, yKey, color = PALETTE[0], action, area = false }) {
  if (!data || data.length === 0) {
    return (
      <ChartShell title={title} subtitle={subtitle} action={action}>
        <EmptyState variant="empty" title="No chartable data" />
      </ChartShell>
    );
  }
  const Chart = area ? AreaChart : LineChart;
  return (
    <ChartShell title={title} subtitle={subtitle} action={action}>
      <ResponsiveContainer width="100%" height="100%">
        <Chart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border-light dark:stroke-border-dark" vertical={false} />
          <XAxis dataKey={xKey} tick={axisStyle} className="text-muted-light dark:text-muted-dark" />
          <YAxis tick={axisStyle} className="text-muted-light dark:text-muted-dark" />
          <Tooltip contentStyle={tooltipStyle} />
          {area ? (
            <Area type="monotone" dataKey={yKey} stroke={color} fill={color} fillOpacity={0.15} strokeWidth={2} />
          ) : (
            <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} dot={{ r: 3 }} />
          )}
        </Chart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

export function PieChartCard({ title, subtitle, data, nameKey, valueKey, action }) {
  if (!data || data.length === 0) {
    return (
      <ChartShell title={title} subtitle={subtitle} action={action}>
        <EmptyState variant="empty" title="No chartable data" />
      </ChartShell>
    );
  }
  return (
    <ChartShell title={title} subtitle={subtitle} action={action}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey={valueKey} nameKey={nameKey} innerRadius={48} outerRadius={80} paddingAngle={2}>
            {data.map((_, idx) => (
              <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

export { PALETTE };
