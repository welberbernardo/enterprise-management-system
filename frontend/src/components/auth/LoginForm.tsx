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
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
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
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    console.log('LoginForm onSubmit called', values);
    setSubmitting(true);
    try {
      console.log('Calling login...');
      await login({ username: values.username, password: values.password });
      console.log('Login success');
      notify.success('Welcome back!');
      onSuccess?.();
    } catch (error) {
      console.log('Login error', error);
      notify.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Username"
        type="text"
        placeholder="admin"
        leftIcon={<Mail className="h-4 w-4" />}
        error={errors.username?.message}
        {...register('username')}
      />
      <div>
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          {...register('password')}
        />
      </div>
      <div className="flex items-center justify-between">
        <Checkbox label="Remember me" />
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
