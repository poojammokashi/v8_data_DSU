/**
 * Shared Recharts styling tokens. Reads CSS variables at call time so charts
 * stay correct across light/dark theme switches without re-mounting.
 */
export function getChartColors() {
  const styles = getComputedStyle(document.documentElement);
  const read = (name, fallback) => {
    const value = styles.getPropertyValue(name).trim();
    return value ? `rgb(${value})` : fallback;
  };

  return {
    grid: read('--border-subtle', '#e2e6ec'),
    axis: read('--ink-faint', '#949dae'),
    tooltipBg: read('--surface-overlay', '#ffffff'),
    tooltipBorder: read('--border', '#e2e6ec'),
    text: read('--ink-muted', '#646e80'),
    amber: '#F0A227',
    teal: '#22D3C4',
    success: '#16B566',
    danger: '#EF4444',
    info: '#3B82F6',
  };
}

export const CHART_SERIES_COLORS = ['#F0A227', '#22D3C4', '#3B82F6', '#16B566', '#EF4444'];

export const tooltipContentStyle = (colors) => ({
  backgroundColor: colors.tooltipBg,
  border: `1px solid ${colors.tooltipBorder}`,
  borderRadius: '12px',
  fontSize: '12.5px',
  fontFamily: '"Lexend", sans-serif',
  boxShadow: '0 4px 12px -2px rgb(15 23 42 / 0.10)',
  padding: '8px 12px',
});
