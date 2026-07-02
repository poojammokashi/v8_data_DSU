import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { HiOutlinePlus, HiOutlineMagnifyingGlass, HiOutlineTrash } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Select from '@components/ui/Select';
import Modal from '@components/ui/Modal';
import Badge from '@components/ui/Badge';
import Avatar from '@components/ui/Avatar';
import DataTable from '@components/data-display/DataTable';
import StatusBadge from '@components/data-display/StatusBadge';
import ConfirmDialog from '@components/feedback/ConfirmDialog';
import { useDebounce } from '@hooks/useDebounce';
import { useUsers, useUserMutations } from '@features/users/hooks/useUsers';
import { formatRelativeTime } from '@utils/formatters';
import { applyServerErrors } from '@utils/applyServerErrors';
import { ROLE_LABELS, ROLES } from '@config/constants';

const ROLE_BADGE_VARIANT = {
  [ROLES.SUPER_ADMIN]: 'amber',
  [ROLES.ADMIN]: 'info',
  [ROLES.ANALYST]: 'teal',
  [ROLES.VIEWER]: 'neutral',
};

const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }));

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState(null);
  const pageSize = 8;

  const { users, meta, isLoading, refetch } = useUsers({ search: debouncedSearch, page, pageSize });
  const { inviteUser, deactivateUser, isSubmitting } = useUserMutations({ onChange: refetch });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({ defaultValues: { name: '', email: '', role: ROLES.VIEWER } });

  async function onSubmit(values) {
    try {
      await inviteUser(values);
      setIsModalOpen(false);
      reset();
      toast.success('Invitation sent to ' + values.email);
    } catch (err) {
      const { unmatched } = applyServerErrors(err, setError, ['name', 'email', 'role', 'phone']);
      if (unmatched.length > 0 || !err.details) {
        toast.error(err.message || 'Failed to invite user');
      }
    }
  }

  async function handleConfirmDeactivate() {
    try {
      await deactivateUser(userToDeactivate.id);
      toast.success(`${userToDeactivate.name} has been suspended`);
    } catch (err) {
      toast.error(err.message || 'Failed to suspend user');
    } finally {
      setUserToDeactivate(null);
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'User',
      render: (row) => (
        <span className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" />
          <span>
            <span className="block text-sm font-medium text-ink">{row.name}</span>
            <span className="block text-xs text-ink-muted">{row.email}</span>
          </span>
        </span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) => (
        <Badge variant={ROLE_BADGE_VARIANT[row.role?.name]}>{ROLE_LABELS[row.role?.name] || row.role?.name}</Badge>
      ),
    },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'last_active_at',
      header: 'Last Active',
      sortable: true,
      render: (row) => (row.last_active_at ? formatRelativeTime(row.last_active_at) : 'Never'),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (row) => (
        <span className="flex items-center justify-end gap-1">
          <button
            onClick={() => setUserToDeactivate(row)}
            disabled={row.status === 'suspended'}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-ink-faint hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            aria-label="Suspend user"
          >
            <HiOutlineTrash className="h-4 w-4" />
          </button>
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink tracking-tight">Users</h1>
          <p className="text-sm text-ink-muted mt-1">Manage team access and role-based permissions.</p>
        </div>
        <Button leftIcon={HiOutlinePlus} onClick={() => setIsModalOpen(true)}>
          Invite User
        </Button>
      </div>

      <Input
        placeholder="Search by name or email…"
        leftIcon={HiOutlineMagnifyingGlass}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        containerClassName="max-w-sm"
      />

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        rowKey={(row) => row.id}
        emptyTitle="No users found"
        emptyDescription="Try a different search term, or invite a new user."
        pagination={{ page, pageSize, total: meta.total, onPageChange: setPage }}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          reset();
        }}
        size="md"
      >
        <Modal.Header onClose={() => setIsModalOpen(false)}>Invite User</Modal.Header>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Modal.Body className="space-y-4">
            <Input
              label="Full name"
              required
              error={errors.name?.message}
              {...register('name', { required: 'Name is required' })}
            />
            <Input
              label="Email address"
              type="email"
              required
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
              })}
            />
            <Select label="Role" required options={ROLE_OPTIONS} {...register('role', { required: true })} />
          </Modal.Body>
          <Modal.Footer>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Send Invite
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!userToDeactivate}
        onClose={() => setUserToDeactivate(null)}
        onConfirm={handleConfirmDeactivate}
        title={`Suspend ${userToDeactivate?.name}?`}
        description="They will immediately lose access to the dashboard. You can reinstate them later."
        confirmLabel="Suspend user"
        isLoading={isSubmitting}
      />
    </div>
  );
}
