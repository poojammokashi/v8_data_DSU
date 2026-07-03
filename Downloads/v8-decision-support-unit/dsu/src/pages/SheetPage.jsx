import { useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs/Breadcrumbs.jsx';
import { KPICard } from '../components/KPICard/KPICard.jsx';
import { BarChartCard, PieChartCard } from '../components/Charts/ChartCard.jsx';
import { DataTable } from '../components/DataTable/DataTable.jsx';
import { EmptyState } from '../components/EmptyState/EmptyState.jsx';
import { Spinner } from '../components/Spinner/Spinner.jsx';
import { useSheet } from '../context/DataContext.jsx';
import { getSheetByRoute } from '../config/sheetsConfig.js';
import { usePageLoading } from '../hooks/usePageLoading.js';
import { isNumericColumn, isStatusColumn, formatNumber } from '../utils/format.js';

function isIdLike(header, records) {
  if (/id$/i.test(header.trim()) || header.trim() === '#') return true;
  const values = records.map((r) => r[header]).filter((v) => v !== '' && v != null);
  const unique = new Set(values.map(String));
  return values.length > 0 && unique.size === values.length && unique.size > 6;
}

function buildKpis(headers, records) {
  const numericCols = headers.filter((h) => isNumericColumn(h, records) && !isIdLike(h, records));
  return numericCols.slice(0, 4).map((h) => {
    const values = records.map((r) => r[h]).filter((v) => typeof v === 'number');
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = values.length ? sum / values.length : 0;
    const isRatioLike = /%|ratio|rate|score|pf$|pu$/i.test(h) && !/cost|amount|mu\b/i.test(h);
    const value = isRatioLike ? avg : sum;
    return {
      label: h,
      value: formatNumber(Math.round(value * 100) / 100),
      sub: isRatioLike ? `avg across ${values.length}` : `total across ${values.length}`,
      icon: 'Gauge',
      tone: 'neutral'
    };
  });
}

function buildCategoryChart(headers, records) {
  const numericCol = headers.find((h) => isNumericColumn(h, records) && !isIdLike(h, records));
  if (!numericCol) return null;
  const catCol = headers.find((h) => {
    if (h === numericCol) return false;
    if (isIdLike(h, records)) return false;
    if (isNumericColumn(h, records)) return false;
    const unique = new Set(records.map((r) => r[h]));
    return unique.size >= 2 && unique.size <= 15;
  });
  if (!catCol) return null;

  const grouped = {};
  records.forEach((r) => {
    const key = String(r[catCol] ?? 'Unknown');
    grouped[key] = (grouped[key] || 0) + (typeof r[numericCol] === 'number' ? r[numericCol] : 0);
  });
  const data = Object.entries(grouped).map(([name, value]) => ({ [catCol]: name, [numericCol]: Math.round(value * 100) / 100 }));
  return { data, catCol, numericCol };
}

function buildStatusChart(headers, records) {
  const statusCol = headers.find((h) => isStatusColumn(h));
  if (!statusCol) return null;
  const counts = {};
  records.forEach((r) => {
    const val = r[statusCol];
    if (val === '' || val === null || val === undefined) return;
    counts[val] = (counts[val] || 0) + 1;
  });
  const data = Object.entries(counts).map(([name, value]) => ({ name, value }));
  if (data.length < 2) return null;
  return { data, statusCol };
}

function SectionBlock({ section, exportPrefix }) {
  const { headers, records, title } = section;
  const kpis = useMemo(() => buildKpis(headers, records), [headers, records]);
  const catChart = useMemo(() => buildCategoryChart(headers, records), [headers, records]);
  const statusChart = useMemo(() => buildStatusChart(headers, records), [headers, records]);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm font-bold uppercase tracking-wide text-muted-light dark:text-muted-dark">{title}</h2>

      {kpis.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <KPICard key={kpi.label} {...kpi} />
          ))}
        </div>
      )}

      {(catChart || statusChart) && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {catChart && (
            <BarChartCard
              title={`${catChart.numericCol} by ${catChart.catCol}`}
              subtitle={title}
              data={catChart.data}
              xKey={catChart.catCol}
              yKey={catChart.numericCol}
            />
          )}
          {statusChart && (
            <PieChartCard
              title={`Distribution by ${statusChart.statusCol}`}
              subtitle={title}
              data={statusChart.data}
              nameKey="name"
              valueKey="value"
            />
          )}
        </div>
      )}

      <DataTable
        title={`${title} — Records`}
        headers={headers}
        records={records}
        exportName={`${exportPrefix}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
      />
    </section>
  );
}

export function SheetPage() {
  const { route } = useParams();
  const config = getSheetByRoute(route);
  usePageLoading(config ? `Loading ${config.title}` : 'Loading module');

  if (!config) return <Navigate to="/404" replace />;

  const { sheet, status } = useSheet(config.key);
  const Icon = Icons[config.icon] || Icons.Circle;

  if (status === 'loading' || !sheet) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size={28} />
      </div>
    );
  }

  const hasData = sheet.sections.some((s) => s.records.length > 0);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <Breadcrumbs items={[{ label: config.title }]} />

      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600/10 text-brand-600 dark:text-brand-400">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink-light dark:text-ink-dark">{config.title}</h1>
          <p className="text-sm text-muted-light dark:text-muted-dark">{config.description}</p>
        </div>
      </div>

      {!hasData ? (
        <EmptyState variant="empty" title="No data found in this sheet" description="Check that the workbook sheet contains a populated table." />
      ) : (
        sheet.sections
          .filter((s) => s.records.length > 0)
          .map((section, idx) => <SectionBlock key={`${section.title}-${idx}`} section={section} exportPrefix={config.route} />)
      )}
    </div>
  );
}
