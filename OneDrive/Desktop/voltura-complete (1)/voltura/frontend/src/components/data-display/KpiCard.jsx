import { motion } from 'framer-motion';
import { HiArrowUp, HiArrowDown } from 'react-icons/hi2';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { cn } from '@utils/cn';
import { SkeletonCard } from '@components/ui/Skeleton';

const ACCENTS = {
  amber: { ring: 'bg-amber-500/10 text-amber-500', stroke: '#F0A227', fill: '#F0A227' },
  teal: { ring: 'bg-teal-500/10 text-teal-500', stroke: '#22D3C4', fill: '#22D3C4' },
  success: { ring: 'bg-success-500/10 text-success-500', stroke: '#16B566', fill: '#16B566' },
  danger: { ring: 'bg-danger-500/10 text-danger-500', stroke: '#EF4444', fill: '#EF4444' },
  info: { ring: 'bg-info-500/10 text-info-500', stroke: '#3B82F6', fill: '#3B82F6' },
};

/**
 * KpiCard — primary metric display unit used across Dashboard & Analytics.
 *
 * @param {string} label - metric name, e.g. "Peak Demand"
 * @param {string} value - formatted value, e.g. "482.6 MW"
 * @param {number} change - percent change vs previous period
 * @param {'up'|'down'} trend - direction (defaults from sign of change)
 * @param {Array} sparkline - optional [{value: number}] for the mini trend chart
 * @param {Function} icon - react-icon component
 * @param {'amber'|'teal'|'success'|'danger'|'info'} accent
 * @param {boolean} isLoading
 */
export default function KpiCard({
  label,
  value,
  change,
  trend,
  sparkline,
  icon: Icon,
  accent = 'amber',
  isLoading = false,
  className,
}) {
  if (isLoading) return <SkeletonCard className={className} />;

  const resolvedTrend = trend || (change >= 0 ? 'up' : 'down');
  const isPositive = resolvedTrend === 'up';
  const colors = ACCENTS[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border-subtle bg-surface-raised p-5 shadow-card',
        'hover:shadow-raised hover:-translate-y-0.5 transition-all duration-200 ease-snappy',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-ink-muted">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-ink tabular tracking-tight">{value}</p>
        </div>
        {Icon && (
          <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', colors.ring)}>
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        {change !== undefined && change !== null && (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-medium tabular',
              isPositive ? 'text-success-500' : 'text-danger-500'
            )}
          >
            {isPositive ? <HiArrowUp className="h-3 w-3" /> : <HiArrowDown className="h-3 w-3" />}
            {Math.abs(change).toFixed(1)}%
            <span className="text-ink-faint font-normal ml-0.5">vs last period</span>
          </span>
        )}

        {sparkline && sparkline.length > 1 && (
          <div className="h-8 w-20 -mb-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkline}>
                <defs>
                  <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors.fill} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={colors.fill} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={colors.stroke}
                  strokeWidth={1.75}
                  fill={`url(#spark-${label})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
}
