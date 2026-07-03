# Decision Support Unit

Enterprise dashboard for KPTCL's grid, commercial, reliability, EHS/carbon and
incident data — built with React (Vite), Tailwind CSS, React Router and
Recharts. It reads `public/data/v8_Master_Data.xlsx` entirely in the browser
(via SheetJS) — there is no backend, API, database or auth of any kind.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL (default `http://localhost:5173`). To build a
static production bundle:

```bash
npm run build
npm run preview
```

Because everything runs client-side, `npm run build` output in `dist/` can be
hosted on any static file host (S3, Netlify, GitHub Pages, etc.) as long as
`data/v8_Master_Data.xlsx` ships alongside it.

## Updating the data source

Replace `public/data/v8_Master_Data.xlsx` with a new workbook that keeps the
same sheet names (`01_Transformers`, `02_Lines_DLR`, … `18_Outage_Impact`).
The app re-parses the file on every load — no rebuild step is required for
data changes, only for code changes. Use the refresh icon in the header to
re-read the file without a full page reload.

## Architecture

```
src/
  components/   Reusable, presentational building blocks
    Sidebar/        Collapsible grouped navigation
    Header/         Title, global cross-module search, theme + refresh
    KPICard/         Metric tiles with tone accents
    Charts/          Bar / Line / Pie wrappers around Recharts
    DataTable/       Search + filter + sort + paginate + CSV export
    SearchBar/       Debounced text input
    FilterBar/       Dropdown filters for status-like columns
    Spinner/         Inline, overlay and full-screen loading states
    EmptyState/      Empty / no-results / error placeholders
    Breadcrumbs/
    ExportButton/
    ThemeToggle/
  layouts/
    MainLayout.jsx   Sidebar + Header + routed content + loading overlay
  pages/
    Dashboard.jsx    Curated home page (cross-sheet KPIs & charts)
    SheetPage.jsx    Generic page rendering any one of the 18 workbook sheets
    NotFound.jsx
  context/
    DataContext      Loads & caches the parsed workbook once per session
    ThemeContext      Light/dark mode (persisted to localStorage)
    LoadingContext    Drives the global spinner overlay
  hooks/
    useDebounce, usePageLoading, useTableControls
  services/
    excelService.js  fetch() + SheetJS parsing of the .xlsx file
  utils/
    parseSheet.js     Splits a raw worksheet into logical sub-tables
    format.js         Number/status formatting + column-type heuristics
    exportUtils.js     CSV export
  config/
    sheetsConfig.js   Route, nav-group, icon and description per sheet
```

### How a sheet becomes a page

`SheetPage.jsx` is a single generic route (`/module/:route`) reused for all 18
sheets. For each table found in a sheet it automatically:

1. Picks up to 4 numeric columns and turns them into KPI cards (sum or
   average, depending on the column name).
2. Looks for a categorical column + a numeric column to draw a bar chart, and
   a status/risk/severity-like column to draw a distribution pie chart.
3. Renders the full table with search, per-column filters, sorting,
   pagination and CSV export.

Several workbook sheets contain more than one table (e.g. sensor field
reference tables, STATCOM + substation tables). `parseSheet.js` splits those
into separate sections so each renders as its own KPI/chart/table block on
the page.

### Loading states

A spinner is shown:
- Full-screen, the first time the workbook is fetched and parsed.
- As a top overlay, whenever a sidebar link is clicked (`usePageLoading`) or
  the workbook is manually refreshed.
