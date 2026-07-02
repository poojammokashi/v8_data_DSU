import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HiOutlineEnvelope, HiOutlineLockClosed } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import Checkbox from '@components/ui/Checkbox';
import { useAuth } from '@features/auth/hooks/useAuth';
import { ROUTE_PATHS } from '@routes/routePaths';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: '', password: '', remember: true } });

  async function onSubmit(values) {
    setIsSubmitting(true);
    try {
      await login(values.email, values.password);
      toast.success('Signed in successfully');
      navigate(location.state?.from?.pathname || ROUTE_PATHS.DASHBOARD, { replace: true });
    } catch (error) {
      toast.error(error.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-ink tracking-tight">Welcome back</h2>
      <p className="mt-1.5 text-sm text-ink-muted">Sign in to access your electricity dashboard.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
        <Input
          label="Email address"
          type="email"
          placeholder="you@company.com"
          leftIcon={HiOutlineEnvelope}
          required
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
          })}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          leftIcon={HiOutlineLockClosed}
          required
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'Must be at least 6 characters' },
          })}
        />

        <div className="flex items-center justify-between">
          <Checkbox label="Remember me" {...register('remember')} />
          <Link to={ROUTE_PATHS.FORGOT_PASSWORD} className="text-sm font-medium text-amber-500 hover:text-amber-600">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-ink-faint">
        Protected by enterprise-grade authentication. Contact your administrator for access.
      </p>
      {import.meta.env.VITE_USE_MOCK_API !== 'false' && (
        <p className="mt-3 text-center text-2xs text-ink-faint">
          Dev mode: try any seed email (e.g. ananya.rao@voltura.com) with password{' '}
          <span className="font-mono">Password123!</span>
        </p>
      )}
    </div>
  );
}
