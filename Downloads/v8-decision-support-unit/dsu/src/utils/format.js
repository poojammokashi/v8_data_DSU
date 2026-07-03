export function formatNumber(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return value ?? '—';
  if (Math.abs(value) >= 1000) return value.toLocaleString('en-IN', { maximumFractionDigits: 1 });
  if (!Number.isInteger(value)) return value.toFixed(2);
  return value.toString();
}

export function titleCase(str = '') {
  return str
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1));
}

const STATUS_MAP = {
  critical: 'critical',
  overloaded: 'critical',
  high: 'critical',
  action: 'critical',
  p1: 'critical',
  'p1 critical': 'critical',
  open: 'warning',
  warning: 'warning',
  watch: 'warning',
  anomaly: 'warning',
  monitor: 'warning',
  medium: 'warning',
  review: 'warning',
  due: 'warning',
  p2: 'warning',
  'p2 warning': 'warning',
  'in progress': 'info',
  scheduled: 'info',
  active: 'info',
  planned: 'info',
  normal: 'normal',
  ok: 'normal',
  closed: 'normal',
  resolved: 'normal',
  low: 'normal',
  'p3 resolved': 'normal'
};

export function statusTone(rawStatus) {
  if (rawStatus === null || rawStatus === undefined) return 'neutral';
  const key = String(rawStatus).trim().toLowerCase();
  return STATUS_MAP[key] || 'neutral';
}

export function isNumericColumn(header, records) {
  const values = records.map((r) => r[header]).filter((v) => v !== '' && v !== null && v !== undefined);
  if (!values.length) return false;
  return values.filter((v) => typeof v === 'number').length / values.length > 0.7;
}

export function isStatusColumn(header) {
  return /status|risk|severity|health|priority|flag/i.test(header);
}

export function isDateColumn(header) {
  return /date/i.test(header);
}
