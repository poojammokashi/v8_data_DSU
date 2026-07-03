function countNonEmpty(row = []) {
  return row.filter((c) => c !== '' && c !== null && c !== undefined).length;
}

function cleanCell(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') return v;
  const s = String(v).trim();
  if (s === '') return '';
  // numeric-looking strings become numbers so charts/KPIs work
  const asNum = Number(s.replace(/,/g, ''));
  if (!Number.isNaN(asNum) && /^-?[\d,.]+%?$/.test(s) && s !== '') {
    return s.endsWith('%') ? asNum : asNum;
  }
  return s;
}

/**
 * Splits a raw sheet (array of arrays) into logical sub-tables.
 * Pattern observed across the workbook:
 *   Row 0: sheet title (single cell)
 *   Row 1: instructions line ("Cells highlighted YELLOW...")
 *   Then repeating blocks of: [optional 1-cell section title] [header row] [data rows...]
 */
export function parseSheetSections(aoa) {
  const rows = (aoa || []).filter((r) => countNonEmpty(r) > 0);
  let i = 0;
  let sheetTitle = '';

  if (rows.length && countNonEmpty(rows[0]) === 1) {
    sheetTitle = String(rows[0][0]);
    i = 1;
  }
  if (rows[i] && String(rows[i][0] || '').toLowerCase().includes('cells highlighted')) {
    i += 1;
  }

  const sections = [];

  while (i < rows.length) {
    let row = rows[i];
    let title = null;

    if (countNonEmpty(row) === 1 && rows[i + 1] && countNonEmpty(rows[i + 1]) > 1) {
      title = String(row[0]);
      i += 1;
      row = rows[i];
    }
    if (!row) break;

    const headers = row.map((h, idx) => (h !== '' && h !== null && h !== undefined ? String(h).trim() : `Column ${idx + 1}`));
    i += 1;

    const dataRows = [];
    while (i < rows.length && countNonEmpty(rows[i]) > 1) {
      dataRows.push(rows[i]);
      i += 1;
    }
    // absorb a trailing single-cell note row (e.g. "Add additional fiscal years...")
    if (i < rows.length && countNonEmpty(rows[i]) === 1 && (!rows[i + 1] || countNonEmpty(rows[i + 1]) <= 1)) {
      i += 1;
    }

    if (dataRows.length === 0) continue;

    const records = dataRows.map((r) => {
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = cleanCell(r[idx]);
      });
      return obj;
    });

    sections.push({
      title: title || sheetTitle || `Table ${sections.length + 1}`,
      headers,
      records
    });
  }

  return { sheetTitle, sections };
}

export function getColumnTypes(headers, records) {
  const types = {};
  headers.forEach((h) => {
    const values = records.map((r) => r[h]).filter((v) => v !== '' && v !== null && v !== undefined);
    if (values.length === 0) {
      types[h] = 'empty';
      return;
    }
    const numericCount = values.filter((v) => typeof v === 'number').length;
    types[h] = numericCount / values.length > 0.7 ? 'numeric' : 'text';
  });
  return types;
}

export function isLikelyIdColumn(header) {
  return /id$/i.test(header.trim()) || /^#$/.test(header.trim());
}
