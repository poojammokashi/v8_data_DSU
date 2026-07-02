import { ROLES, STATUS } from '@config/constants';

/**
 * Dummy seed data for local development without a live backend.
 * Field names and shapes mirror the FastAPI Pydantic schemas exactly
 * (see backend/app/schemas/*.py) so toggling VITE_USE_MOCK_API=false
 * requires no changes to any consuming component.
 */

function daysAgo(n) {
  return new Date(Date.now() - n * 86400000).toISOString();
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

// --- Roles ---
export const SEED_ROLES = [
  { id: 'role_super_admin', name: ROLES.SUPER_ADMIN, description: 'Super Admin role' },
  { id: 'role_admin', name: ROLES.ADMIN, description: 'Admin role' },
  { id: 'role_analyst', name: ROLES.ANALYST, description: 'Analyst role' },
  { id: 'role_viewer', name: ROLES.VIEWER, description: 'Viewer role' },
];

function roleByName(name) {
  return SEED_ROLES.find((r) => r.name === name);
}

// --- Users ---
export const SEED_USERS = [
  {
    id: 'usr_1',
    name: 'Ananya Rao',
    email: 'ananya.rao@voltura.com',
    phone: '+91 98450 11223',
    avatar_url: null,
    status: STATUS.ACTIVE,
    is_email_verified: true,
    last_active_at: daysAgo(0),
    created_at: daysAgo(210),
    role: roleByName(ROLES.ADMIN),
  },
  {
    id: 'usr_2',
    name: 'Vikram Sehgal',
    email: 'vikram.sehgal@voltura.com',
    phone: '+91 98450 11224',
    avatar_url: null,
    status: STATUS.ACTIVE,
    is_email_verified: true,
    last_active_at: daysAgo(1),
    created_at: daysAgo(180),
    role: roleByName(ROLES.SUPER_ADMIN),
  },
  {
    id: 'usr_3',
    name: 'Priya Nair',
    email: 'priya.nair@voltura.com',
    phone: null,
    avatar_url: null,
    status: STATUS.ACTIVE,
    is_email_verified: true,
    last_active_at: daysAgo(2),
    created_at: daysAgo(150),
    role: roleByName(ROLES.ANALYST),
  },
  {
    id: 'usr_4',
    name: 'Arjun Mehta',
    email: 'arjun.mehta@voltura.com',
    phone: null,
    avatar_url: null,
    status: STATUS.INACTIVE,
    is_email_verified: true,
    last_active_at: daysAgo(40),
    created_at: daysAgo(300),
    role: roleByName(ROLES.VIEWER),
  },
  {
    id: 'usr_5',
    name: 'Kavya Iyer',
    email: 'kavya.iyer@voltura.com',
    phone: '+91 98450 11227',
    avatar_url: null,
    status: STATUS.PENDING,
    is_email_verified: false,
    last_active_at: null,
    created_at: daysAgo(2),
    role: roleByName(ROLES.ANALYST),
  },
  {
    id: 'usr_6',
    name: 'Rohan Kapoor',
    email: 'rohan.kapoor@voltura.com',
    phone: null,
    avatar_url: null,
    status: STATUS.SUSPENDED,
    is_email_verified: true,
    last_active_at: daysAgo(75),
    created_at: daysAgo(320),
    role: roleByName(ROLES.VIEWER),
  },
];

// Plain-text dev password for every seed user — mock auth only.
export const SEED_PASSWORD = 'Password123!';

// --- Master data (power sources / plants / feeders) ---
export const SEED_POWER_SOURCES = [
  { id: 'src_thermal', name: 'NTPC Thermal Station', type: 'thermal' },
  { id: 'src_solar', name: 'Pavagada Solar Park', type: 'solar' },
  { id: 'src_wind', name: 'Jaisalmer Wind Farm', type: 'wind' },
  { id: 'src_hydro', name: 'Koyna Hydro Plant', type: 'hydro' },
];

export const SEED_FEEDERS = [
  { id: 'feeder_1', name: 'Whitefield Feeder', region: 'East Bengaluru' },
  { id: 'feeder_2', name: 'Electronic City Feeder', region: 'South Bengaluru' },
  { id: 'feeder_3', name: 'Peenya Industrial Feeder', region: 'North Bengaluru' },
];

// --- Power Purchase ---
export const SEED_POWER_PURCHASE = Array.from({ length: 30 }, (_, i) => {
  const source = SEED_POWER_SOURCES[i % SEED_POWER_SOURCES.length];
  const quantity = Math.round((150 + Math.random() * 80) * 100) / 100;
  const rate = Math.round((3.2 + Math.random() * 1.5) * 100) / 100;
  return {
    id: `pp_${1000 + i}`,
    source_id: source.id,
    source_name: source.name,
    date: isoDate(new Date(Date.now() - i * 86400000)),
    quantity_mu: quantity,
    rate_per_unit: rate,
    amount: Math.round(quantity * rate * 100000) / 100,
    status: ['draft', 'approved', 'settled', 'settled', 'approved'][i % 5],
    remarks: null,
    created_at: daysAgo(i),
  };
});

// --- Open Access ---
export const SEED_OPEN_ACCESS = Array.from({ length: 24 }, (_, i) => {
  const quantity = Math.round((40 + Math.random() * 60) * 100) / 100;
  const wheeling = Math.round((20000 + Math.random() * 15000) * 100) / 100;
  const transmission = Math.round((12000 + Math.random() * 9000) * 100) / 100;
  return {
    id: `oa_${2000 + i}`,
    date: isoDate(new Date(Date.now() - i * 86400000)),
    consumer_name: ['Tata Steel Ltd', 'Infosys Campus', 'Bosch Manufacturing', 'Wipro SEZ'][i % 4],
    generator_id: SEED_POWER_SOURCES[i % SEED_POWER_SOURCES.length].id,
    quantity_mu: quantity,
    wheeling_charges: wheeling,
    transmission_charges: transmission,
    total_charges: wheeling + transmission,
    status: ['pending', 'approved', 'settled', 'rejected'][i % 4],
    created_at: daysAgo(i),
  };
});

// --- Generation / Consumption / Peak demand daily trend (last 30 days) ---
function buildDailyTrend() {
  return Array.from({ length: 30 }, (_, i) => {
    const date = isoDate(new Date(Date.now() - (29 - i) * 86400000));
    return {
      date,
      purchase: Math.round(150 + Math.random() * 60),
      generation: Math.round(120 + Math.random() * 60),
      consumption: Math.round(140 + Math.random() * 50),
    };
  });
}

export const SEED_DAILY_TREND = buildDailyTrend();

export const SEED_SOURCE_MIX = [
  { source_type: 'thermal', source_name: 'Thermal', quantity_mwh: 4820 },
  { source_type: 'solar', source_name: 'Solar', quantity_mwh: 2960 },
  { source_type: 'wind', source_name: 'Wind', quantity_mwh: 2140 },
  { source_type: 'hydro', source_name: 'Hydro', quantity_mwh: 1380 },
];

export const SEED_PEAK_DEMAND_TREND = Array.from({ length: 30 }, (_, i) => ({
  date: isoDate(new Date(Date.now() - (29 - i) * 86400000)),
  demand_mw: Math.round((420 + Math.random() * 90) * 10) / 10,
}));

// --- Billing & Settlement ---
export const SEED_BILLING = Array.from({ length: 18 }, (_, i) => {
  const units = Math.round((200 + Math.random() * 150) * 100) / 100;
  const rate = Math.round((4.0 + Math.random() * 1.2) * 100) / 100;
  const periodStart = new Date(Date.now() - (i + 1) * 30 * 86400000);
  const periodEnd = new Date(periodStart.getTime() + 29 * 86400000);
  const dueDate = new Date(periodEnd.getTime() + 15 * 86400000);
  return {
    id: `bill_${3000 + i}`,
    period_start: isoDate(periodStart),
    period_end: isoDate(periodEnd),
    feeder_id: SEED_FEEDERS[i % SEED_FEEDERS.length].id,
    units_consumed_mu: units,
    rate_per_unit: rate,
    amount: Math.round(units * rate * 100000) / 100,
    due_date: isoDate(dueDate),
    status: ['settled', 'settled', 'pending', 'overdue', 'draft'][i % 5],
    created_at: daysAgo(i * 5),
  };
});

export const SEED_MONTHLY_BILLING = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m) => ({
  month: m,
  billed: Math.round(380 + Math.random() * 120),
  settled: Math.round(320 + Math.random() * 120),
}));

// --- Alerts ---
export const SEED_ALERT_RULES = [
  {
    id: 'rule_1',
    name: 'Peak demand threshold',
    metric: 'peak_demand',
    condition: 'gt',
    threshold: 480,
    severity: 'critical',
    is_active: true,
  },
  {
    id: 'rule_2',
    name: 'Low generation warning',
    metric: 'generation',
    condition: 'lt',
    threshold: 100,
    severity: 'warning',
    is_active: true,
  },
  {
    id: 'rule_3',
    name: 'Outstanding billing alert',
    metric: 'outstanding_billing',
    condition: 'gt',
    threshold: 5000000,
    severity: 'warning',
    is_active: true,
  },
];

export const SEED_NOTIFICATIONS = [
  {
    id: 'notif_1',
    rule_id: 'rule_1',
    title: 'Peak Demand gt 480 — current value 482.60',
    triggered_value: 482.6,
    triggered_at: daysAgo(0),
    acknowledged: false,
    acknowledged_at: null,
    rule: SEED_ALERT_RULES[0],
  },
  {
    id: 'notif_2',
    rule_id: 'rule_3',
    title: 'Open Access transaction #OA-2291 pending approval for 3 days',
    triggered_value: 5820000,
    triggered_at: daysAgo(1),
    acknowledged: false,
    acknowledged_at: null,
    rule: SEED_ALERT_RULES[2],
  },
  {
    id: 'notif_3',
    rule_id: 'rule_2',
    title: 'Monthly settlement report generated',
    triggered_value: 95,
    triggered_at: daysAgo(2),
    acknowledged: true,
    acknowledged_at: daysAgo(1),
    rule: SEED_ALERT_RULES[1],
  },
  {
    id: 'notif_4',
    rule_id: 'rule_1',
    title: 'Generation data upload completed with 3 row errors',
    triggered_value: 478.2,
    triggered_at: daysAgo(3),
    acknowledged: true,
    acknowledged_at: daysAgo(2),
    rule: SEED_ALERT_RULES[0],
  },
];

// --- Reports ---
export const SEED_REPORTS = [
  {
    id: 'rpt_1',
    name: 'Monthly Financial Summary — May 2026',
    report_type: 'financial',
    status: 'approved',
    generated_at: daysAgo(2),
    file_path: '/files/reports/financial-may-2026.pdf',
  },
  {
    id: 'rpt_2',
    name: 'Power Purchase Settlement — Q1 FY26',
    report_type: 'settlement',
    status: 'approved',
    generated_at: daysAgo(6),
    file_path: '/files/reports/settlement-q1-fy26.pdf',
  },
  {
    id: 'rpt_3',
    name: 'Open Access Transaction Log — May 2026',
    report_type: 'open_access',
    status: 'draft',
    generated_at: daysAgo(9),
    file_path: null,
  },
  {
    id: 'rpt_4',
    name: 'Peak Demand Analysis — FY25-26',
    report_type: 'analytics',
    status: 'approved',
    generated_at: daysAgo(14),
    file_path: '/files/reports/peak-demand-fy25-26.pdf',
  },
  {
    id: 'rpt_5',
    name: 'Annual Generation Report — FY25',
    report_type: 'generation',
    status: 'approved',
    generated_at: daysAgo(60),
    file_path: '/files/reports/generation-fy25.pdf',
  },
];

// --- File upload history ---
export const SEED_UPLOAD_HISTORY = [
  {
    id: 'upl_1',
    filename: 'generation_june_2026.xlsx',
    file_type: 'excel',
    data_type: 'generation',
    status: 'committed',
    total_rows: 240,
    valid_rows: 240,
    error_rows: 0,
    created_at: daysAgo(1),
  },
  {
    id: 'upl_2',
    filename: 'consumption_may_2026.csv',
    file_type: 'csv',
    data_type: 'consumption',
    status: 'committed',
    total_rows: 310,
    valid_rows: 304,
    error_rows: 6,
    created_at: daysAgo(5),
  },
  {
    id: 'upl_3',
    filename: 'peak_demand_q2.json',
    file_type: 'json',
    data_type: 'peak_demand',
    status: 'validated',
    total_rows: 90,
    valid_rows: 90,
    error_rows: 0,
    created_at: daysAgo(0),
  },
];
