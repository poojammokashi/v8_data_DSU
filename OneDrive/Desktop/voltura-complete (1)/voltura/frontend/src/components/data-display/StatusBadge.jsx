import Badge from '@components/ui/Badge';

const STATUS_MAP = {
  active: { variant: 'success', label: 'Active' },
  inactive: { variant: 'neutral', label: 'Inactive' },
  pending: { variant: 'warning', label: 'Pending' },
  suspended: { variant: 'danger', label: 'Suspended' },
  settled: { variant: 'success', label: 'Settled' },
  overdue: { variant: 'danger', label: 'Overdue' },
  draft: { variant: 'neutral', label: 'Draft' },
  approved: { variant: 'success', label: 'Approved' },
  rejected: { variant: 'danger', label: 'Rejected' },
  processing: { variant: 'info', label: 'Processing' },
};

export default function StatusBadge({ status, className }) {
  const config = STATUS_MAP[status?.toLowerCase()] || { variant: 'neutral', label: status || 'Unknown' };
  return (
    <Badge variant={config.variant} dot className={className}>
      {config.label}
    </Badge>
  );
}
