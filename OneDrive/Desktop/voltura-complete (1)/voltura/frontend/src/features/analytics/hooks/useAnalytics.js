import { useFetch } from '@hooks/useFetch';
import { analyticsApi } from '../api/analyticsApi';

export function useAnalytics({ period, dateFrom, dateTo }) {
  const trend = useFetch(
    () => analyticsApi.getTrend({ period, dateFrom, dateTo }).then((r) => r.data),
    [period, dateFrom, dateTo]
  );

  const billing = useFetch(
    () => analyticsApi.getMonthlyBillingSummary({ dateFrom, dateTo }).then((r) => r.data),
    [period, dateFrom, dateTo]
  );

  const sourceMix = useFetch(
    () => analyticsApi.getSourceMix({ dateFrom, dateTo }).then((r) => r.data),
    [period, dateFrom, dateTo]
  );

  return {
    trend: trend.data,
    isTrendLoading: trend.isLoading,
    trendError: trend.error,

    billing: billing.data,
    isBillingLoading: billing.isLoading,
    billingError: billing.error,

    sourceMix: sourceMix.data,
    isSourceMixLoading: sourceMix.isLoading,
    sourceMixError: sourceMix.error,
  };
}
