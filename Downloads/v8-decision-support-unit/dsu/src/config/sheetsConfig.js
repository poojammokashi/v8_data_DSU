export const NAV_GROUPS = [
  { id: 'overview', label: 'Overview' },
  { id: 'grid', label: 'Grid Monitor' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'reliability', label: 'Reliability' },
  { id: 'ehs', label: 'EHS & Carbon' },
  { id: 'incidents', label: 'Incidents' }
];

export const SHEETS = [
  {
    key: '01_Transformers',
    route: 'transformers',
    title: 'Transformers',
    group: 'grid',
    icon: 'Zap',
    description: 'Power transformer master data and live sensor fields.'
  },
  {
    key: '02_Lines_DLR',
    route: 'lines-dlr',
    title: 'Lines & DLR',
    group: 'grid',
    icon: 'Cable',
    description: 'Transmission line master data and dynamic line rating.'
  },
  {
    key: '03_Towers_Drone',
    route: 'towers-drone',
    title: 'Towers & Drone',
    group: 'grid',
    icon: 'RadioTower',
    description: 'Transmission tower master data and drone inspection log.'
  },
  {
    key: '04_STATCOM_Substations',
    route: 'statcom-substations',
    title: 'STATCOM & Substations',
    group: 'grid',
    icon: 'Building2',
    description: 'STATCOM units and substation master data.'
  },
  {
    key: '05_SCADA_System',
    route: 'scada-system',
    title: 'SCADA System',
    group: 'grid',
    icon: 'ActivitySquare',
    description: 'Grid frequency, generation, load and reserves.'
  },
  {
    key: '17_Maintenance',
    route: 'maintenance',
    title: 'Maintenance',
    group: 'grid',
    icon: 'Wrench',
    description: 'Maintenance schedule and work orders.'
  },
  {
    key: '06_PowerPurchase',
    route: 'power-purchase',
    title: 'Power Purchase',
    group: 'commercial',
    icon: 'ShoppingCart',
    description: 'Source-wise power purchase mix and cost by fiscal year.'
  },
  {
    key: '07_SalesMix',
    route: 'sales-mix',
    title: 'Sales Mix',
    group: 'commercial',
    icon: 'PieChart',
    description: 'Consumer category sales, tariff and revenue.'
  },
  {
    key: '08_Subsidy',
    route: 'subsidy',
    title: 'Subsidy',
    group: 'commercial',
    icon: 'HandCoins',
    description: 'GoK / GoI subsidy schemes and burden.'
  },
  {
    key: '09_OpenAccess',
    route: 'open-access',
    title: 'Open Access',
    group: 'commercial',
    icon: 'DoorOpen',
    description: 'Open access volumes and revenue impact.'
  },
  {
    key: '10_ESCOM_Reliability',
    route: 'escom-reliability',
    title: 'ESCOM Reliability',
    group: 'reliability',
    icon: 'ShieldCheck',
    description: 'SAIDI / SAIFI / AT&C / DT failure by ESCOM.'
  },
  {
    key: '11_Network_Assets',
    route: 'network-assets',
    title: 'Network Assets',
    group: 'reliability',
    icon: 'Network',
    description: 'Substations, feeders, DTs and line km by ESCOM.'
  },
  {
    key: '12_GFA_Debt',
    route: 'gfa-debt',
    title: 'GFA & Debt',
    group: 'reliability',
    icon: 'Landmark',
    description: 'Gross fixed assets and debt by ESCOM / KPTCL.'
  },
  {
    key: '13_ThermalStations',
    route: 'thermal-stations',
    title: 'Thermal Stations',
    group: 'reliability',
    icon: 'Flame',
    description: 'Thermal generating station performance.'
  },
  {
    key: '14_EHS_Monitoring',
    route: 'ehs-monitoring',
    title: 'EHS Monitoring',
    group: 'ehs',
    icon: 'HardHat',
    description: 'EHS hazard register across substations, lines and towers.'
  },
  {
    key: '15_Carbon_Credits',
    route: 'carbon-credits',
    title: 'Carbon Credits',
    group: 'ehs',
    icon: 'Leaf',
    description: 'Carbon intensity and carbon credit potential.'
  },
  {
    key: '16_Incidents',
    route: 'incidents',
    title: 'Incidents',
    group: 'incidents',
    icon: 'AlertTriangle',
    description: 'Incident and fault log with MTTR tracking.'
  },
  {
    key: '18_Outage_Impact',
    route: 'outage-impact',
    title: 'Outage Impact',
    group: 'incidents',
    icon: 'ShieldAlert',
    description: 'N-1 contingency and outage cascade simulation reference.'
  }
];

export function getSheetByRoute(route) {
  return SHEETS.find((s) => s.route === route);
}

export function getSheetsByGroup(groupId) {
  return SHEETS.filter((s) => s.group === groupId);
}
