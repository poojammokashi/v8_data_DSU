import * as XLSX from 'xlsx';
import { parseSheetSections } from '../utils/parseSheet.js';

const WORKBOOK_URL = `${import.meta.env.BASE_URL}data/v8_Master_Data.xlsx`;

/**
 * Fetches the workbook and parses every sheet into structured sections.
 * Returns: { [sheetName]: { sheetTitle, sections: [{ title, headers, records }] } }
 */
export async function loadWorkbook() {
  const res = await fetch(WORKBOOK_URL);
  if (!res.ok) {
    throw new Error(`Could not load workbook (${res.status} ${res.statusText})`);
  }
  const buffer = await res.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });

  const bySheet = {};
  for (const sheetName of workbook.SheetNames) {
    const ws = workbook.Sheets[sheetName];
    const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: true });
    bySheet[sheetName] = parseSheetSections(aoa);
  }
  return { sheetNames: workbook.SheetNames, bySheet };
}
