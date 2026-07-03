import { Download } from 'lucide-react';
import { exportToCsv } from '../../utils/exportUtils.js';

export function ExportButton({ filename, headers, records, disabled }) {
  return (
    <button
      type="button"
      className="btn-secondary text-xs py-1.5"
      disabled={disabled || !records?.length}
      onClick={() => exportToCsv(filename, headers, records)}
    >
      <Download className="h-3.5 w-3.5" />
      Export CSV
    </button>
  );
}
