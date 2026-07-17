import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useNotification } from '../../hooks/useNotification';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Checkbox } from '../ui/Checkbox';
import { useState } from 'react';
import { Mail, Lock } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof schema>;

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useAuth();
  const { theme } = useTheme();
  const notify = useNotification();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', rememberMe: true },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitting(true);
    try {
      await login({ email: values.email, password: values.password, rememberMe: values.rememberMe });
      notify.success('Welcome back!');
      onSuccess?.();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Email"
        type="email"
        placeholder="you@company.com"
        leftIcon={<Mail className="h-4 w-4" />}
        error={errors.email?.message}
        {...register('email')}
      />
      <div>
        <Input
          label="Password"
          type="password"
          placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          {...register('password')}
        />
      </div>
      <div className="flex items-center justify-between">
        <Checkbox label="Remember me" {...register('rememberMe')} />
        <a href="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-700">
          Forgot password?
        </a>
      </div>
      <Button type="submit" className="w-full" size="lg" loading={submitting}>
        Sign in
      </Button>
      <p className="text-center text-xs text-slate-400">
        Theme: <span className="capitalize">{theme}</span>
      </p>
    </form>
  );
}
