import { useState } from 'react';
import { HiOutlineArrowDownTray } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import Tabs from '@components/ui/Tabs';
import Button from '@components/ui/Button';
import ChartContainer from '@components/charts/ChartContainer';
import AreaChartWidget from '@components/charts/AreaChartWidget';
import BarChartWidget from '@components/charts/BarChartWidget';
import DonutChartWidget from '@components/charts/DonutChartWidget';
import DateRangePicker from '@components/forms/DateRangePicker';
import ErrorState from '@components/feedback/ErrorState';
import { useAnalytics } from '@features/analytics/hooks/useAnalytics';
import { formatNumber } from '@utils/formatters';

const PERIOD_TABS = [
  { value: 'daily', label: 'Daily' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

function defaultDateRange() {
  const to = new Date();
  const from = new Date(to.getTime() - 29 * 86400000);
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('daily');
  const [{ from: dateFrom, to: dateTo }, setRange] = useState(defaultDateRange);

  const {
    trend,
    isTrendLoading,
    trendError,
    billing,
    isBillingLoading,
    billingError,
    sourceMix,
    isSourceMixLoading,
    sourceMixError,
  } = useAnalytics({ period, dateFrom, dateTo });

  const sourceMixTotal = sourceMix?.reduce((sum, s) => sum + s.quantity_mwh, 0) || 0;

  function handleExport() {
    toast.success('Export will be available once report generation is configured');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink tracking-tight">Analytics</h1>
          <p className="text-sm text-ink-muted mt-1">
            Historical trends across generation, consumption and peak demand.
          </p>
        </div>
        <Button variant="secondary" leftIcon={HiOutlineArrowDownTray} onClick={handleExport}>
          Export
        </Button>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <Tabs tabs={PERIOD_TABS} activeTab={period} onChange={setPeriod} />
        <DateRangePicker
          from={dateFrom}
          to={dateTo}
          onFromChange={(value) => setRange((prev) => ({ ...prev, from: value }))}
          onToChange={(value) => setRange((prev) => ({ ...prev, to: value }))}
        />
      </div>

      <ChartContainer
        title="Consumption vs Generation"
        description="Stacked volume comparison across the selected period"
        isLoading={isTrendLoading}
        isEmpty={!isTrendLoading && !trendError && !trend?.length}
        height={360}
      >
        {trendError ? (
          <ErrorState title="Couldn't load trend data" description={trendError.message} />
        ) : (
          <AreaChartWidget
            data={trend}
            xKey="date"
            series={[
              { key: 'generation', label: 'Generation', color: '#22D3C4' },
              { key: 'consumption', label: 'Consumption', color: '#F0A227' },
            ]}
          />
        )}
      </ChartContainer>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ChartContainer
          className="lg:col-span-2"
          title="Billed vs Settled Amount"
          description="Monthly financial reconciliation"
          isLoading={isBillingLoading}
          isEmpty={!isBillingLoading && !billingError && !billing?.length}
        >
          {billingError ? (
            <ErrorState title="Couldn't load billing summary" description={billingError.message} />
          ) : (
            <BarChartWidget
              data={billing}
              xKey="month"
              series={[
                { key: 'billed', label: 'Billed (₹ Lakh)', color: '#F0A227' },
                { key: 'settled', label: 'Settled (₹ Lakh)', color: '#16B566' },
              ]}
            />
          )}
        </ChartContainer>

        <ChartContainer
          title="Source-wise Share"
          description="Current period mix"
          isLoading={isSourceMixLoading}
          isEmpty={!isSourceMixLoading && !sourceMixError && !sourceMix?.length}
        >
          {sourceMixError ? (
            <ErrorState title="Couldn't load source mix" description={sourceMixError.message} />
          ) : (
            <DonutChartWidget
              data={(sourceMix || []).map((s) => ({ name: s.source_name, value: s.quantity_mwh }))}
              centerLabel="Total MWh"
              centerValue={formatNumber(sourceMixTotal)}
            />
          )}
        </ChartContainer>
      </div>
    </div>
  );
}
