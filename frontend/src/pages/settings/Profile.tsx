import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { User, Lock } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { getErrorMessage } from '../../services/api';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Tabs, TabPanel } from '../../components/ui/Tabs';
import { FormWrapper, FieldError } from '../../components/forms/FormWrapper';
import { FormProvider } from 'react-hook-form';
import { Avatar } from '../../components/ui/Avatar';

const profileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword: z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export function Profile() {
  const { user, updateUser } = useAuth();
  const notify = useNotification();
  const [tab, setTab] = useState('info');

  const profileMethods = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', email: user?.email ?? '', phone: user?.phone ?? '' },
  });
  const passwordMethods = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  const onProfile = async (values: ProfileValues) => {
    try {
      const updated = await authService.updateProfile(values);
      updateUser(updated);
      notify.success('Profile updated');
    } catch (e) {
      notify.error(getErrorMessage(e));
    }
  };

  const onPassword = async (values: PasswordValues) => {
    try {
      await authService.changePassword(values);
      notify.success('Password changed');
      passwordMethods.reset();
    } catch (e) {
      notify.error(getErrorMessage(e));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle="Manage your personal account" />

      <div className="flex items-center gap-4 mb-2">
        <Avatar name={user?.fullName ?? 'User'} size="xl" />
        <div>
          <h2 className="text-xl font-semibold">{user?.fullName}</h2>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>
      </div>

      <Card>
        <Tabs activeTab={tab} onChange={setTab} tabs={[{ id: 'info', label: 'Information', icon: <User className="h-4 w-4" /> }, { id: 'password', label: 'Change Password', icon: <Lock className="h-4 w-4" /> }]} />
        <TabPanel active={tab === 'info'}>
          <FormProvider {...profileMethods}>
            <FormWrapper id="profile-form" onSubmit={onProfile} className="space-y-4 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Input label="First Name" error={profileMethods.formState.errors.firstName?.message} {...profileMethods.register('firstName')} /><FieldError name="firstName" /></div>
                <div><Input label="Last Name" error={profileMethods.formState.errors.lastName?.message} {...profileMethods.register('lastName')} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Input label="Email" type="email" error={profileMethods.formState.errors.email?.message} {...profileMethods.register('email')} /></div>
                <div><Input label="Phone" {...profileMethods.register('phone')} /></div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" form="profile-form" loading={profileMethods.formState.isSubmitting}>Save Profile</Button>
              </div>
            </FormWrapper>
          </FormProvider>
        </TabPanel>
        <TabPanel active={tab === 'password'}>
          <FormProvider {...passwordMethods}>
            <FormWrapper id="password-form" onSubmit={onPassword} className="space-y-4 mt-2 max-w-md">
              <div><Input label="Current Password" type="password" error={passwordMethods.formState.errors.currentPassword?.message} {...passwordMethods.register('currentPassword')} /></div>
              <div><Input label="New Password" type="password" error={passwordMethods.formState.errors.newPassword?.message} {...passwordMethods.register('newPassword')} /></div>
              <div><Input label="Confirm Password" type="password" error={passwordMethods.formState.errors.confirmPassword?.message} {...passwordMethods.register('confirmPassword')} /></div>
              <div className="flex justify-end">
                <Button type="submit" form="password-form" loading={passwordMethods.formState.isSubmitting}>Change Password</Button>
              </div>
            </FormWrapper>
          </FormProvider>
        </TabPanel>
      </Card>
    </div>
  );
}
