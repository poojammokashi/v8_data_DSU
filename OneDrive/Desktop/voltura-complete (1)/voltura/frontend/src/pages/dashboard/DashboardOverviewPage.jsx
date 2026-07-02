import { useMemo, useState } from 'react';
import {
  HiOutlineBolt,
  HiOutlineSquare3Stack3D,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowsRightLeft,
  HiOutlineBanknotes,
  HiOutlineBellAlert,
} from 'react-icons/hi2';
import KpiCard from '@components/data-display/KpiCard';
import ChartContainer from '@components/charts/ChartContainer';
import LineChartWidget from '@components/charts/LineChartWidget';
import DonutChartWidget from '@components/charts/DonutChartWidget';
import Badge from '@components/ui/Badge';
import Tabs from '@components/ui/Tabs';
import ErrorState from '@components/feedback/ErrorState';
import Skeleton from '@components/ui/Skeleton';
import { useDashboardSummary } from '@features/dashboard/hooks/useDashboardSummary';
import { useNotifications } from '@features/alerts/hooks/useNotifications';
import { formatCurrency, formatEnergy, formatPower, formatNumber, formatRelativeTime } from '@utils/formatters';

const KPI_ICONS = {
  power_purchase_mu: HiOutlineBolt,
  generation_mwh: HiOutlineSquare3Stack3D,
  peak_demand_mw: HiOutlineArrowTrendingUp,
  open_access_mu: HiOutlineArrowsRightLeft,
  outstanding_billing: HiOutlineBanknotes,
  active_alerts: HiOutlineBellAlert,
};

const KPI_ACCENTS = {
  power_purchase_mu: 'amber',
  generation_mwh: 'teal',
  peak_demand_mw: 'danger',
  open_access_mu: 'info',
  outstanding_billing: 'success',
  active_alerts: 'amber',
};

const SEVERITY_DOT = { critical: 'bg-danger-500', warning: 'bg-warning-500', info: 'bg-info-500' };

const RANGE_DAYS = { '7d': 7, '30d': 30, '90d': 90 };

function formatKpiValue(key, kpi) {
  if (!kpi) return '—';
  if (key === 'power_purchase_mu' || key === 'open_access_mu') return `${formatNumber(kpi.value, 1)} MU`;
  if (key === 'generation_mwh') return formatEnergy(kpi.value * 1000); // MWh -> auto-scaled
  if (key === 'peak_demand_mw') return formatPower(kpi.value);
  if (key === 'outstanding_billing') return formatCurrency(kpi.value);
  if (key === 'active_alerts') return formatNumber(kpi.value);
  return formatNumber(kpi.value);
}

export default function DashboardOverviewPage() {
  const [trendRange, setTrendRange] = useState('7d');

  const { dateFrom, dateTo } = useMemo(() => {
    const to = new Date();
    const from = new Date(to.getTime() - RANGE_DAYS[trendRange] * 86400000);
    return { dateFrom: from.toISOString().slice(0, 10), dateTo: to.toISOString().slice(0, 10) };
  }, [trendRange]);

  const {
    summary,
    isSummaryLoading,
    summaryError,
    trend,
    isTrendLoading,
    trendError,
    sourceMix,
    isSourceMixLoading,
    sourceMixError,
    refetchAll,
  } = useDashboardSummary({ dateFrom, dateTo });

  const { notifications, isLoading: alertsLoading } = useNotifications({ acknowledged: false, pageSize: 4 });

  const kpiEntries = summary ? Object.entries(summary) : [];
  const sourceMixTotal = sourceMix?.reduce((sum, s) => sum + s.quantity_mwh, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink tracking-tight">Grid Overview</h1>
          <p className="text-sm text-ink-muted mt-1">
            Live snapshot of power purchase, generation and open access activity.
          </p>
        </div>
        <Badge variant="success" dot>
          Data synced {formatRelativeTime(new Date(Date.now() - 1000 * 60 * 4))}
        </Badge>
      </div>

      {/* KPI grid */}
      {summaryError ? (
        <ErrorState
          title="Couldn't load dashboard metrics"
          description={summaryError.message}
          onRetry={refetchAll}
          className="rounded-2xl border border-border-subtle bg-surface-raised"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {isSummaryLoading
            ? Array.from({ length: 6 }).map((_, i) => <KpiCard key={i} isLoading />)
            : kpiEntries.map(([key, kpi]) => (
                <KpiCard
                  key={key}
                  label={kpi.label}
                  value={formatKpiValue(key, kpi)}
                  change={kpi.change_percent}
                  icon={KPI_ICONS[key]}
                  accent={KPI_ACCENTS[key]}
                />
              ))}
        </div>
      )}

      {/* Trend + Source mix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ChartContainer
          className="lg:col-span-2"
          title="Purchase, Generation & Consumption"
          description="Daily volumes across the selected period"
          isLoading={isTrendLoading}
          isEmpty={!isTrendLoading && !trendError && !trend?.length}
          actions={
            <Tabs
              tabs={[
                { value: '7d', label: '7D' },
                { value: '30d', label: '30D' },
                { value: '90d', label: '90D' },
              ]}
              activeTab={trendRange}
              onChange={setTrendRange}
            />
          }
        >
          {trendError ? (
            <ErrorState title="Couldn't load trend data" description={trendError.message} onRetry={refetchAll} />
          ) : (
            <LineChartWidget
              data={trend}
              xKey="date"
              series={[
                { key: 'purchase', label: 'Power Purchase', color: '#F0A227' },
                { key: 'generation', label: 'Generation', color: '#22D3C4' },
                { key: 'consumption', label: 'Consumption', color: '#3B82F6' },
              ]}
            />
          )}
        </ChartContainer>

        <ChartContainer
          title="Generation Source Mix"
          description="Share by energy source, this period"
          isLoading={isSourceMixLoading}
          isEmpty={!isSourceMixLoading && !sourceMixError && !sourceMix?.length}
        >
          {sourceMixError ? (
            <ErrorState title="Couldn't load source mix" description={sourceMixError.message} onRetry={refetchAll} />
          ) : (
            <DonutChartWidget
              data={(sourceMix || []).map((s) => ({ name: s.source_name, value: s.quantity_mwh }))}
              centerLabel="Total MWh"
              centerValue={formatNumber(sourceMixTotal)}
            />
          )}
        </ChartContainer>
      </div>

      {/* Active Alerts */}
      <div className="rounded-2xl border border-border-subtle bg-surface-raised p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-ink">Active Alerts</h3>
          <a href="/notifications" className="text-xs font-medium text-amber-500 hover:text-amber-600">
            View all
          </a>
        </div>
        {alertsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-ink-muted py-4 text-center">No active alerts — all clear.</p>
        ) : (
          <div className="space-y-3">
            {notifications.slice(0, 4).map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 pb-3 border-b border-border-subtle last:border-0 last:pb-0"
              >
                <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${SEVERITY_DOT[alert.rule?.severity] || 'bg-info-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink leading-snug">{alert.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xs text-ink-faint">{alert.rule?.name}</span>
                    <span className="text-ink-faint">·</span>
                    <span className="text-2xs text-ink-faint">{formatRelativeTime(alert.triggered_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
