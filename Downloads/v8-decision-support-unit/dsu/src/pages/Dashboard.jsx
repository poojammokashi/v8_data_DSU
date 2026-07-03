import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { KPICard } from '../components/KPICard/KPICard.jsx';
import { BarChartCard, PieChartCard } from '../components/Charts/ChartCard.jsx';
import { DataTable } from '../components/DataTable/DataTable.jsx';
import { Spinner } from '../components/Spinner/Spinner.jsx';
import { useData } from '../context/DataContext.jsx';
import { SHEETS, NAV_GROUPS, getSheetsByGroup } from '../config/sheetsConfig.js';
import { usePageLoading } from '../hooks/usePageLoading.js';
import { formatNumber } from '../utils/format.js';

function firstSection(workbook, key) {
  return workbook?.bySheet?.[key]?.sections?.[0] || { headers: [], records: [] };
}

function findSection(workbook, key, titleMatch) {
  const sections = workbook?.bySheet?.[key]?.sections || [];
  return sections.find((s) => titleMatch.test(s.title)) || { headers: [], records: [] };
}

const REFERENCE_ROW = /CEA|target|peer|best|ideal/i;

export function Dashboard() {
  usePageLoading('Loading dashboard');
  const { workbook, status } = useData();

  const insights = useMemo(() => {
    if (!workbook) return null;

    const transformers = firstSection(workbook, '01_Transformers').records;
    const lines = firstSection(workbook, '02_Lines_DLR').records;
    const incidents = firstSection(workbook, '16_Incidents').records;
    const purchase = firstSection(workbook, '06_PowerPurchase').records;
    const reliability = firstSection(workbook, '10_ESCOM_Reliability').records.filter(
      (r) => !REFERENCE_ROW.test(String(r.ESCOM || ''))
    );
    const fuelMix = findSection(workbook, '15_Carbon_Credits', /Fuel Mix/i).records;

    const critTransformers = transformers.filter((r) => /critical/i.test(r['Health Status'])).length;
    const overloadedLines = lines.filter((r) => /overloaded/i.test(r['Current Load %'])).length;
    const openP1 = incidents.filter((r) => /P1/i.test(r.Severity) && !/closed/i.test(r.Status)).length;
    const openTotal = incidents.filter((r) => /open|progress/i.test(r.Status)).length;
    const totalCostRow = purchase.find((r) => /total/i.test(String(r.Source || '')));
    const avgSaidi = reliability.length
      ? reliability.reduce((a, r) => a + (Number(r['SAIDI (hrs/yr)']) || 0), 0) / reliability.length
      : 0;

    const purchaseChart = purchase
      .filter((r) => !/total/i.test(String(r.Source || '')))
      .map((r) => ({ name: r.Source, value: r['Cost (₹ Cr)'] }));

    const fuelChart = fuelMix.map((r) => ({ name: r.Source, value: r['Share (%)'] }));

    const saidiChart = reliability.map((r) => ({ ESCOM: r.ESCOM, SAIDI: r['SAIDI (hrs/yr)'] }));

    return {
      transformerCount: transformers.length,
      critTransformers,
      lineCount: lines.length,
      overloadedLines,
      openP1,
      openTotal,
      totalCost: totalCostRow?.['Cost (₹ Cr)'],
      avgSaidi,
      purchaseChart,
      fuelChart,
      saidiChart,
      recentIncidents: incidents
    };
  }, [workbook]);

  if (status === 'loading' || !insights) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size={28} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-ink-light dark:text-ink-dark">Grid Overview</h1>
        <p className="text-sm text-muted-light dark:text-muted-dark">
          Live snapshot assembled from the KPTCL DSU master workbook across {SHEETS.length} data modules.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KPICard label="Transformers" value={insights.transformerCount} icon="Zap" tone="neutral" sub="assets tracked" />
        <KPICard
          label="Critical Transformers"
          value={insights.critTransformers}
          icon="AlertOctagon"
          tone={insights.critTransformers > 0 ? 'critical' : 'normal'}
          sub="health = critical"
        />
        <KPICard label="Transmission Lines" value={insights.lineCount} icon="Cable" tone="neutral" sub="lines tracked" />
        <KPICard
          label="Overloaded Lines"
          value={insights.overloadedLines}
          icon="TrendingUp"
          tone={insights.overloadedLines > 0 ? 'warning' : 'normal'}
          sub="above static rating"
        />
        <KPICard
          label="Open P1 Incidents"
          value={insights.openP1}
          icon="AlertTriangle"
          tone={insights.openP1 > 0 ? 'critical' : 'normal'}
          sub={`${insights.openTotal} open in total`}
        />
        <KPICard label="Avg SAIDI" value={formatNumber(Math.round(insights.avgSaidi * 10) / 10)} unit="hrs/yr" icon="ShieldCheck" tone="info" sub="across ESCOMs" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <PieChartCard
          title="Power Purchase Cost Mix"
          subtitle={`Total FY25 cost ${insights.totalCost ? `₹${formatNumber(insights.totalCost)} Cr` : '—'}`}
          data={insights.purchaseChart}
          nameKey="name"
          valueKey="value"
        />
        <BarChartCard title="SAIDI by ESCOM" subtitle="Hours/year vs CEA target of 12" data={insights.saidiChart} xKey="ESCOM" yKey="SAIDI" color="#d97706" />
        <PieChartCard title="Generation Fuel Mix" subtitle="Share of FY25 generation (%)" data={insights.fuelChart} nameKey="name" valueKey="value" />
      </div>

      <DataTable
        title="Recent Incidents"
        headers={['Incident ID', 'Asset', 'Description', 'Severity', 'Assigned To', 'Status']}
        records={insights.recentIncidents}
        exportName="recent-incidents"
      />

      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-light dark:text-muted-dark mb-3">All Modules</h2>
        <div className="flex flex-col gap-5">
          {NAV_GROUPS.filter((g) => g.id !== 'overview').map((group) => {
            const sheets = getSheetsByGroup(group.id);
            if (!sheets.length) return null;
            return (
              <div key={group.id}>
                <p className="text-xs font-semibold text-muted-light dark:text-muted-dark mb-2">{group.label}</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {sheets.map((sheet) => {
                    const Icon = Icons[sheet.icon] || Icons.Circle;
                    return (
                      <Link
                        key={sheet.key}
                        to={`/module/${sheet.route}`}
                        className="card flex items-start gap-3 p-4 hover:border-brand-400 dark:hover:border-brand-500 transition-colors"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600/10 text-brand-600 dark:text-brand-400">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink-light dark:text-ink-dark">{sheet.title}</p>
                          <p className="text-xs text-muted-light dark:text-muted-dark line-clamp-2">{sheet.description}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
