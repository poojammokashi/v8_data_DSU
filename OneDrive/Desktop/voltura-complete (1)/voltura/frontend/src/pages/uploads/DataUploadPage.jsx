import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineArrowPath,
  HiOutlineDocumentArrowUp,
} from 'react-icons/hi2';
import Select from '@components/ui/Select';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import Card from '@components/ui/Card';
import FileDropzone from '@components/forms/FileDropzone';
import DataTable from '@components/data-display/DataTable';
import StatusBadge from '@components/data-display/StatusBadge';
import { useFileUpload, useUploadHistory } from '@features/uploads/hooks/useFileUpload';
import { formatDateTime } from '@utils/formatters';

const DATA_TYPE_OPTIONS = [
  { value: 'power_purchase', label: 'Power Purchase' },
  { value: 'open_access', label: 'Open Access' },
  { value: 'generation', label: 'Generation' },
  { value: 'consumption', label: 'Consumption' },
  { value: 'peak_demand', label: 'Peak Demand' },
];

const HISTORY_COLUMNS = [
  { key: 'filename', header: 'File' },
  { key: 'data_type', header: 'Data Type', render: (row) => row.data_type.replace('_', ' ') },
  { key: 'total_rows', header: 'Rows', align: 'right' },
  {
    key: 'error_rows',
    header: 'Errors',
    align: 'right',
    render: (row) => (row.error_rows > 0 ? <span className="text-danger-500">{row.error_rows}</span> : '0'),
  },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  { key: 'created_at', header: 'Uploaded', sortable: true, render: (row) => formatDateTime(row.created_at) },
];

export default function DataUploadPage() {
  const [dataType, setDataType] = useState('generation');
  const [selectedFile, setSelectedFile] = useState(null);
  const { validate, commit, reset, progress, isValidating, isCommitting, validationResult, canCommit } =
    useFileUpload();
  const { history, isLoading: historyLoading, refetch: refetchHistory } = useUploadHistory();

  async function handleValidate() {
    if (!selectedFile) {
      toast.error('Choose a file first');
      return;
    }
    try {
      const result = await validate(selectedFile, dataType);
      if (result.error_rows > 0) {
        toast(`${result.valid_rows} rows valid, ${result.error_rows} rows have errors`, { icon: '⚠️' });
      } else {
        toast.success(`${result.valid_rows} rows validated successfully`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to process file');
    }
  }

  async function handleCommit() {
    try {
      const result = await commit();
      toast.success(`${result.rows_committed} rows committed successfully`);
      reset();
      setSelectedFile(null);
      refetchHistory();
    } catch (err) {
      toast.error(err.message || 'Failed to commit data');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink tracking-tight">Data Upload</h1>
        <p className="text-sm text-ink-muted mt-1">
          Bulk import Power Purchase, Open Access, Generation, Consumption, or Peak Demand data from
          Excel, CSV, or JSON.
        </p>
      </div>

      <Card>
        <Card.Header>
          <div>
            <Card.Title>Upload a file</Card.Title>
            <Card.Description>
              Files are validated row-by-row before anything is saved — review the report, then commit.
            </Card.Description>
          </div>
        </Card.Header>
        <Card.Body className="space-y-4">
          <Select
            label="Data type"
            options={DATA_TYPE_OPTIONS}
            value={dataType}
            onChange={(e) => {
              setDataType(e.target.value);
              reset();
              setSelectedFile(null);
            }}
            containerClassName="max-w-xs"
          />

          <FileDropzone onFileSelect={setSelectedFile} accept={['.csv', '.xlsx', '.xls', '.json']} maxSizeMb={10} />

          {isValidating && (
            <div className="space-y-1.5">
              <div className="h-1.5 w-full rounded-full bg-surface-subtle overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-200 ease-snappy"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-2xs text-ink-muted">Validating… {progress}%</p>
            </div>
          )}

          <Button
            onClick={handleValidate}
            isLoading={isValidating}
            disabled={!selectedFile || isValidating}
            leftIcon={HiOutlineDocumentArrowUp}
          >
            Validate File
          </Button>
        </Card.Body>
      </Card>

      {validationResult && (
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2.5">
              {validationResult.error_rows === 0 ? (
                <HiOutlineCheckCircle className="h-5 w-5 text-success-500" />
              ) : (
                <HiOutlineExclamationTriangle className="h-5 w-5 text-warning-500" />
              )}
              <div>
                <Card.Title>Validation Report</Card.Title>
                <Card.Description>{validationResult.filename}</Card.Description>
              </div>
            </div>
          </Card.Header>
          <Card.Body className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="neutral">{validationResult.total_rows} total rows</Badge>
              <Badge variant="success">{validationResult.valid_rows} valid</Badge>
              {validationResult.error_rows > 0 && (
                <Badge variant="danger">{validationResult.error_rows} errors</Badge>
              )}
            </div>

            {validationResult.errors?.length > 0 && (
              <div className="rounded-xl border border-border-subtle overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-surface-subtle">
                    <tr>
                      <th className="px-3 py-2 text-left text-2xs font-semibold uppercase text-ink-muted">Row</th>
                      <th className="px-3 py-2 text-left text-2xs font-semibold uppercase text-ink-muted">
                        Error
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {validationResult.errors.slice(0, 10).map((err, i) => (
                      <tr key={i} className="border-t border-border-subtle">
                        <td className="px-3 py-2 text-ink-muted tabular">{err.row_number}</td>
                        <td className="px-3 py-2 text-danger-500">{err.error_message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {validationResult.preview?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-ink-muted mb-2">Preview (first {validationResult.preview.length} valid rows)</p>
                <div className="rounded-xl border border-border-subtle overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-subtle">
                      <tr>
                        {Object.keys(validationResult.preview[0]).map((key) => (
                          <th key={key} className="px-3 py-2 text-left text-2xs font-semibold uppercase text-ink-muted whitespace-nowrap">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {validationResult.preview.map((row, i) => (
                        <tr key={i} className="border-t border-border-subtle">
                          {Object.values(row).map((value, j) => (
                            <td key={j} className="px-3 py-2 text-ink whitespace-nowrap tabular">
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card.Body>
          <Card.Footer className="justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                reset();
                setSelectedFile(null);
              }}
            >
              Discard
            </Button>
            <Button onClick={handleCommit} isLoading={isCommitting} disabled={!canCommit}>
              Commit {validationResult.valid_rows} rows
            </Button>
          </Card.Footer>
        </Card>
      )}

      <div className="rounded-2xl border border-border-subtle bg-surface-raised p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-ink">Upload History</h3>
          <button
            onClick={refetchHistory}
            className="flex items-center gap-1.5 text-xs font-medium text-amber-500 hover:text-amber-600"
          >
            <HiOutlineArrowPath className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
        <DataTable columns={HISTORY_COLUMNS} data={history} isLoading={historyLoading} rowKey={(row) => row.id} />
      </div>
    </div>
  );
}
