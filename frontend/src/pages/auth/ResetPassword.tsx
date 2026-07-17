import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Lock, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useNotification } from '../../hooks/useNotification';
import { authService } from '../../services/auth.service';
import { getErrorMessage } from '../../services/api';
import { Boxes } from 'lucide-react';

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export function ResetPassword() {
  const notify = useNotification();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await authService.resetPassword({
        token: params.get('token') ?? '',
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      notify.success('Password reset successful');
      navigate('/login');
    } catch (error) {
      notify.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 rounded-2xl bg-primary-600 text-white shadow-lg mb-4">
            <Boxes className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reset Password</h1>
        </div>

        <div className="card p-8 animate-slide-up">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="New Password"
              type="password"
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            <Button type="submit" className="w-full" loading={submitting}>
              Reset password
            </Button>
          </form>
        </div>

        <Link
          to="/login"
          className="flex items-center justify-center gap-2 mt-6 text-sm text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
      </div>
    </div>
  );
}
