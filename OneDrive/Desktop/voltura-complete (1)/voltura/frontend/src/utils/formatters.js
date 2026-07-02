/**
 * Format a number with thousands separators and fixed decimals.
 */
export function formatNumber(value, decimals = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format currency in INR by default (electricity billing domain).
 */
export function formatCurrency(value, currency = 'INR') {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format energy units — auto-scales kWh -> MWh -> GWh for readability.
 */
export function formatEnergy(valueInKwh, decimals = 1) {
  if (valueInKwh === null || valueInKwh === undefined || Number.isNaN(valueInKwh)) return '—';
  const abs = Math.abs(valueInKwh);
  if (abs >= 1_000_000) return `${formatNumber(valueInKwh / 1_000_000, decimals)} GWh`;
  if (abs >= 1_000) return `${formatNumber(valueInKwh / 1_000, decimals)} MWh`;
  return `${formatNumber(valueInKwh, decimals)} kWh`;
}

/**
 * Format power demand in MW/kW.
 */
export function formatPower(valueInMw, decimals = 2) {
  if (valueInMw === null || valueInMw === undefined || Number.isNaN(valueInMw)) return '—';
  return `${formatNumber(valueInMw, decimals)} MW`;
}

/**
 * Format a percentage change with sign.
 */
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatNumber(value, decimals)}%`;
}

/**
 * Format a date for display (e.g. 12 Jun 2026).
 */
export function formatDate(date, options = {}) {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(d);
}

/**
 * Format a date + time (e.g. 12 Jun 2026, 14:32).
 */
export function formatDateTime(date) {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Relative time, e.g. "3 minutes ago".
 */
export function formatRelativeTime(date) {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(d);
}

/**
 * Get initials from a full name, for avatar fallbacks.
 */
export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
