import { useState } from 'react';
import { Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useNotification } from '../../hooks/useNotification';
import { authService } from '../../services/auth.service';
import { getErrorMessage } from '../../services/api';
import { Boxes } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
});

type FormValues = z.infer<typeof schema>;

export function ForgotPassword() {
  const notify = useNotification();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await authService.forgotPassword(values);
      setSent(true);
      notify.success('Reset link sent to your email');
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Forgot Password</h1>
        </div>

        <div className="card p-8 animate-slide-up">
          {sent ? (
            <div className="text-center py-6">
              <div className="p-3 rounded-full bg-success-100 dark:bg-success-900/30 text-success-600 w-fit mx-auto mb-4">
                <Mail className="h-8 w-8" />
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Check your inbox for the password reset link.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Enter your email and we'll send you a reset link.
              </p>
              <Input
                label="Email"
                type="email"
                placeholder="you@company.com"
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register('email')}
              />
              <Button type="submit" className="w-full" loading={submitting}>
                Send reset link
              </Button>
            </form>
          )}
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
