import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { HiOutlinePlus, HiOutlineArrowDownTray, HiOutlineDocumentChartBar } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import Button from '@components/ui/Button';
import Select from '@components/ui/Select';
import Modal from '@components/ui/Modal';
import Input from '@components/ui/Input';
import DataTable from '@components/data-display/DataTable';
import StatusBadge from '@components/data-display/StatusBadge';
import { usePermissions } from '@hooks/usePermissions';
import { useReports, useGenerateReport } from '@features/reports/hooks/useReports';
import { formatDate } from '@utils/formatters';
import { PERMISSIONS } from '@config/constants';

// Values match the backend's ReportGenerateRequest.report_type pattern
// exactly (see backend/app/schemas/report.py).
const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'financial', label: 'Financial' },
  { value: 'settlement', label: 'Settlement' },
  { value: 'open_access', label: 'Open Access' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'generation', label: 'Generation' },
];

const COLUMNS = [
  {
    key: 'name',
    header: 'Report',
    render: (row) => (
      <span className="flex items-center gap-2.5">
        <HiOutlineDocumentChartBar className="h-4 w-4 text-ink-faint shrink-0" />
        {row.name}
      </span>
    ),
  },
  { key: 'report_type', header: 'Type', render: (row) => TYPE_OPTIONS.find((t) => t.value === row.report_type)?.label || row.report_type },
  { key: 'generated_at', header: 'Generated', sortable: true, render: (row) => formatDate(row.generated_at) },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  {
    key: 'actions',
    header: '',
    align: 'right',
    render: (row) => (
      <Button
        variant="ghost"
        size="sm"
        leftIcon={HiOutlineArrowDownTray}
        disabled={!row.file_path}
        onClick={() => toast.success(row.file_path ? 'Download started' : 'Report is still processing')}
      >
        Download
      </Button>
    ),
  },
];

export default function ReportsPage() {
  const { can } = usePermissions();
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 8;

  const { reports, isLoading, refetch } = useReports({ type: typeFilter || undefined });
  const { generate, isGenerating } = useGenerateReport(() => {
    refetch();
    setIsModalOpen(false);
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { reportType: '', dateFrom: '', dateTo: '' } });

  const paged = reports.slice((page - 1) * pageSize, page * pageSize);

  async function onSubmit(values) {
    try {
      await generate({ reportType: values.reportType, dateFrom: values.dateFrom, dateTo: values.dateTo });
      toast.success('Report generation started — you will be notified when ready');
      reset();
    } catch (err) {
      toast.error(err.message || 'Failed to generate report');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink tracking-tight">Reports</h1>
          <p className="text-sm text-ink-muted mt-1">Financial, settlement and analytics reports.</p>
        </div>
        {can(PERMISSIONS.REPORTS_GENERATE) && (
          <Button leftIcon={HiOutlinePlus} onClick={() => setIsModalOpen(true)}>
            Generate Report
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Select
          options={TYPE_OPTIONS}
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          containerClassName="max-w-[220px]"
        />
      </div>

      <DataTable
        columns={COLUMNS}
        data={paged}
        isLoading={isLoading}
        rowKey={(row) => row.id}
        emptyTitle="No reports yet"
        emptyDescription="Generate your first report to see it listed here."
        pagination={{ page, pageSize, total: reports.length, onPageChange: setPage }}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          reset();
        }}
        size="md"
      >
        <Modal.Header onClose={() => setIsModalOpen(false)}>Generate Report</Modal.Header>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Modal.Body className="space-y-4">
            <Select
              label="Report type"
              required
              options={TYPE_OPTIONS.filter((o) => o.value)}
              placeholder="Select a report type"
              error={errors.reportType?.message}
              {...register('reportType', { required: 'Select a report type' })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="From date"
                type="date"
                required
                error={errors.dateFrom?.message}
                {...register('dateFrom', { required: 'Required' })}
              />
              <Input
                label="To date"
                type="date"
                required
                error={errors.dateTo?.message}
                {...register('dateTo', { required: 'Required' })}
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isGenerating}>
              Generate
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
}
