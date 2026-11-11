import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { FormWrapper, FieldError } from '../../components/forms/FormWrapper';
import { FormProvider } from 'react-hook-form';
import { useNotification } from '../../hooks/useNotification';
import { userService } from '../../services/user.service';
import { getErrorMessage } from '../../services/api';
import type { User, Role } from '../../types/user.types';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  roleId: z.string().min(1, 'Select a role'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']),
  password: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface UserFormProps {
  isOpen: boolean;
  user: User | null;
  roles: Role[];
  onClose: () => void;
  onSaved: () => void;
}

export function UserForm({ isOpen, user, roles, onClose, onSaved }: UserFormProps) {
  const notify = useNotification();
  const isEdit = Boolean(user);

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      roleId: '',
      status: 'ACTIVE',
      password: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (user) {
        methods.reset({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone ?? '',
          roleId: user.roleId,
          status: user.status,
          password: '',
        });
      } else {
        methods.reset({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          roleId: '',
          status: 'ACTIVE',
          password: '',
        });
      }
    }
  }, [isOpen, user, methods]);

  const {
    register,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && user) {
        await userService.update(user.id, {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          roleId: values.roleId,
          status: values.status,
        });
        notify.success('User updated successfully');
      } else {
        await userService.create({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          roleId: values.roleId,
          status: values.status,
          password: values.password ?? 'Temp@1234',
        });
        notify.success('User created successfully');
      }
      onSaved();
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  const roleOptions = roles.map((r) => ({ label: r.name, value: r.id }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit User' : 'Add User'}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" form="user-form" loading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create User'}
          </Button>
        </>
      }
    >
      <FormProvider {...methods}>
        <FormWrapper id="user-form" onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input label="First Name" error={errors.firstName?.message} {...register('firstName')} />
              <FieldError name="firstName" />
            </div>
            <div>
              <Input label="Last Name" error={errors.lastName?.message} {...register('lastName')} />
              <FieldError name="lastName" />
            </div>
          </div>
          <div>
            <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
            <FieldError name="email" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
              <FieldError name="phone" />
            </div>
            <div>
              <Select label="Role" options={roleOptions} error={errors.roleId?.message} {...register('roleId')} />
              <FieldError name="roleId" />
            </div>
          </div>
          <div>
            <Select
              label="Status"
              options={[
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Inactive', value: 'INACTIVE' },
                { label: 'Suspended', value: 'SUSPENDED' },
                { label: 'Pending', value: 'PENDING' },
              ]}
              error={errors.status?.message}
              {...register('status')}
            />
            <FieldError name="status" />
          </div>
          {!isEdit && (
            <div>
              <Input
                label="Password"
                type="password"
                hint="Default password used if empty"
                {...register('password')}
              />
            </div>
          )}
        </FormWrapper>
      </FormProvider>
    </Modal>
  );
}
