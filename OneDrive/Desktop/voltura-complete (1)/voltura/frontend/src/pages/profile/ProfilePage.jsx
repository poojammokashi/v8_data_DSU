import { useForm } from 'react-hook-form';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineCamera } from 'react-icons/hi2';
import Card from '@components/ui/Card';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import Avatar from '@components/ui/Avatar';
import Badge from '@components/ui/Badge';
import { useAuthStore } from '@store/authStore';
import { ROLE_LABELS } from '@config/constants';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const profileForm = useForm({
    defaultValues: { name: user?.name || '', email: user?.email || '', phone: '' },
  });

  const passwordForm = useForm({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  async function onSaveProfile(values) {
    setIsSavingProfile(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    updateUser(values);
    setIsSavingProfile(false);
    toast.success('Profile updated');
  }

  async function onSavePassword(values, e) {
    e.preventDefault();
    if (values.newPassword !== values.confirmPassword) {
      passwordForm.setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }
    setIsSavingPassword(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setIsSavingPassword(false);
    passwordForm.reset();
    toast.success('Password updated');
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-ink tracking-tight">My Profile</h1>
        <p className="text-sm text-ink-muted mt-1">Manage your personal details and account security.</p>
      </div>

      <Card>
        <Card.Body className="flex items-center gap-5">
          <div className="relative">
            <Avatar name={user?.name} size="xl" />
            <button
              aria-label="Change avatar"
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-soft hover:bg-amber-400 transition-colors"
            >
              <HiOutlineCamera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">{user?.name}</h2>
            <p className="text-sm text-ink-muted">{user?.email}</p>
            <Badge variant="amber" className="mt-2">
              {ROLE_LABELS[user?.role] || 'Viewer'}
            </Badge>
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <div>
            <Card.Title>Personal details</Card.Title>
            <Card.Description>Update your name, email and contact number.</Card.Description>
          </div>
        </Card.Header>
        <form onSubmit={profileForm.handleSubmit(onSaveProfile)} noValidate>
          <Card.Body className="space-y-4">
            <Input
              label="Full name"
              required
              error={profileForm.formState.errors.name?.message}
              {...profileForm.register('name', { required: 'Name is required' })}
            />
            <Input
              label="Email address"
              type="email"
              required
              error={profileForm.formState.errors.email?.message}
              {...profileForm.register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
              })}
            />
            <Input label="Phone number" type="tel" placeholder="+91 98765 43210" {...profileForm.register('phone')} />
          </Card.Body>
          <Card.Footer className="justify-end">
            <Button type="submit" isLoading={isSavingProfile}>
              Save changes
            </Button>
          </Card.Footer>
        </form>
      </Card>

      <Card>
        <Card.Header>
          <div>
            <Card.Title>Change password</Card.Title>
            <Card.Description>Use a strong password you don't reuse elsewhere.</Card.Description>
          </div>
        </Card.Header>
        <form onSubmit={passwordForm.handleSubmit(onSavePassword)} noValidate>
          <Card.Body className="space-y-4">
            <Input
              label="Current password"
              type="password"
              required
              error={passwordForm.formState.errors.currentPassword?.message}
              {...passwordForm.register('currentPassword', { required: 'Required' })}
            />
            <Input
              label="New password"
              type="password"
              required
              error={passwordForm.formState.errors.newPassword?.message}
              {...passwordForm.register('newPassword', {
                required: 'Required',
                minLength: { value: 8, message: 'At least 8 characters' },
              })}
            />
            <Input
              label="Confirm new password"
              type="password"
              required
              error={passwordForm.formState.errors.confirmPassword?.message}
              {...passwordForm.register('confirmPassword', { required: 'Required' })}
            />
          </Card.Body>
          <Card.Footer className="justify-end">
            <Button type="submit" variant="secondary" isLoading={isSavingPassword}>
              Update password
            </Button>
          </Card.Footer>
        </form>
      </Card>
    </div>
  );
}
