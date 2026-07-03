import * as Icons from 'lucide-react';

const TONE_STYLES = {
  critical: 'text-status-critical bg-red-500/10',
  warning: 'text-status-warning bg-amber-500/10',
  normal: 'text-status-normal bg-emerald-500/10',
  info: 'text-status-info bg-blue-500/10',
  neutral: 'text-brand-600 dark:text-brand-400 bg-brand-500/10'
};

export function KPICard({ label, value, unit, icon = 'Gauge', tone = 'neutral', sub, trend }) {
  const Icon = Icons[icon] || Icons.Gauge;
  const toneClass = TONE_STYLES[tone] || TONE_STYLES.neutral;

  return (
    <div className="card p-4 flex flex-col gap-3 animate-fade-in">
      <div className="flex items-start justify-between">
        <span className="label-eyebrow">{label}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>
      <div className="flex items-end gap-1.5">
        <span className="text-2xl font-bold tracking-tight text-ink-light dark:text-ink-dark">{value}</span>
        {unit && <span className="pb-0.5 text-xs font-medium text-muted-light dark:text-muted-dark">{unit}</span>}
      </div>
      {(sub || trend) && (
        <div className="flex items-center gap-1.5 text-xs">
          {trend && (
            <span className={trend.direction === 'up' ? 'text-status-critical' : 'text-status-normal'}>
              {trend.direction === 'up' ? '▲' : '▼'} {trend.value}
            </span>
          )}
          {sub && <span className="text-muted-light dark:text-muted-dark">{sub}</span>}
        </div>
      )}
    </div>
  );
}
