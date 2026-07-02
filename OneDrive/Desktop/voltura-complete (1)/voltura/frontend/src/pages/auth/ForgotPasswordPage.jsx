import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { HiOutlineEnvelope, HiOutlineArrowLeft, HiOutlineCheckCircle } from 'react-icons/hi2';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import { ROUTE_PATHS } from '@routes/routePaths';

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({ defaultValues: { email: '' } });

  async function onSubmit() {
    setIsSubmitting(true);
    // TODO: replace with POST /api/v1/auth/forgot-password
    await new Promise((resolve) => setTimeout(resolve, 700));
    setIsSubmitting(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="h-12 w-12 rounded-2xl bg-success-50 dark:bg-success-500/10 flex items-center justify-center mx-auto mb-4">
          <HiOutlineCheckCircle className="h-6 w-6 text-success-500" />
        </div>
        <h2 className="text-xl font-semibold text-ink">Check your inbox</h2>
        <p className="mt-2 text-sm text-ink-muted">
          We sent password reset instructions to <span className="text-ink font-medium">{getValues('email')}</span>.
        </p>
        <Link
          to={ROUTE_PATHS.LOGIN}
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-amber-500 hover:text-amber-600"
        >
          <HiOutlineArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link to={ROUTE_PATHS.LOGIN} className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink mb-6">
        <HiOutlineArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>

      <h2 className="text-2xl font-semibold text-ink tracking-tight">Reset your password</h2>
      <p className="mt-1.5 text-sm text-ink-muted">
        Enter your email and we'll send you instructions to reset your password.
      </p>

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
        <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
          Send reset instructions
        </Button>
      </form>
    </div>
  );
}
