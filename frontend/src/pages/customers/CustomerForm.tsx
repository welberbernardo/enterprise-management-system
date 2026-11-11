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
import { customerService } from '../../services/customer.service';
import { getErrorMessage } from '../../services/api';
import { isValidEmail, isValidPhone } from '../../utils/validators';
import type { Customer } from '../../types/customer.types';

const schema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().refine((v) => !v || isValidEmail(v), 'Invalid email'),
  phone: z.string().refine((v) => !v || isValidPhone(v), 'Invalid phone'),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  taxId: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'LEAD', 'BLOCKED']),
  creditLimit: z.coerce.number().min(0).optional(),
});

type FormValues = z.infer<typeof schema>;

interface CustomerFormProps {
  isOpen: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSaved: () => void;
}

export function CustomerForm({ isOpen, customer, onClose, onSaved }: CustomerFormProps) {
  const notify = useNotification();
  const isEdit = Boolean(customer);

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: '', name: '', email: '', phone: '', address: '', city: '', country: '', taxId: '', status: 'ACTIVE', creditLimit: 0 },
  });

  useEffect(() => {
    if (isOpen) {
      if (customer) {
        methods.reset({
          code: customer.code, name: customer.name, email: customer.email ?? '', phone: customer.phone ?? '',
          address: customer.address ?? '', city: customer.city ?? '', country: customer.country ?? '',
          taxId: customer.taxId ?? '', status: customer.status, creditLimit: customer.creditLimit ?? 0,
        });
      } else {
        methods.reset({ code: '', name: '', email: '', phone: '', address: '', city: '', country: '', taxId: '', status: 'ACTIVE', creditLimit: 0 });
      }
    }
  }, [isOpen, customer, methods]);

  const { register, formState: { errors, isSubmitting } } = methods;

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && customer) {
        await customerService.update(customer.id, values);
        notify.success('Customer updated');
      } else {
        await customerService.create(values);
        notify.success('Customer created');
      }
      onSaved();
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Customer' : 'Add Customer'} size="lg"
      footer={<>
        <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
        <Button type="submit" form="customer-form" loading={isSubmitting}>{isEdit ? 'Save Changes' : 'Create Customer'}</Button>
      </>}>
      <FormProvider {...methods}>
        <FormWrapper id="customer-form" onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Input label="Code" error={errors.code?.message} {...register('code')} /><FieldError name="code" /></div>
            <div><Input label="Name" error={errors.name?.message} {...register('name')} /><FieldError name="name" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Input label="Email" type="email" error={errors.email?.message} {...register('email')} /><FieldError name="email" /></div>
            <div><Input label="Phone" error={errors.phone?.message} {...register('phone')} /><FieldError name="phone" /></div>
          </div>
          <div><Input label="Address" {...register('address')} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><Input label="City" {...register('city')} /></div>
            <div><Input label="Country" {...register('country')} /></div>
            <div><Input label="Tax ID" {...register('taxId')} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Select label="Status" error={errors.status?.message}
                options={[{ label: 'Active', value: 'ACTIVE' }, { label: 'Inactive', value: 'INACTIVE' }, { label: 'Lead', value: 'LEAD' }, { label: 'Blocked', value: 'BLOCKED' }]}
                {...register('status')} />
              <FieldError name="status" />
            </div>
            <div><Input label="Credit Limit" type="number" step="0.01" error={errors.creditLimit?.message} {...register('creditLimit')} /><FieldError name="creditLimit" /></div>
          </div>
        </FormWrapper>
      </FormProvider>
    </Modal>
  );
}
