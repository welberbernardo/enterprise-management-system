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
import { supplierService } from '../../services/supplier.service';
import { getErrorMessage } from '../../services/api';
import type { Supplier } from '../../types/supplier.types';

const schema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  taxId: z.string().optional(),
  contactName: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']),
  paymentTerms: z.coerce.number().min(0).optional(),
});

type FormValues = z.infer<typeof schema>;

interface SupplierFormProps {
  isOpen: boolean;
  supplier: Supplier | null;
  onClose: () => void;
  onSaved: () => void;
}

export function SupplierForm({ isOpen, supplier, onClose, onSaved }: SupplierFormProps) {
  const notify = useNotification();
  const isEdit = Boolean(supplier);

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: '', name: '', email: '', phone: '', address: '', city: '', country: '', taxId: '', contactName: '', status: 'ACTIVE', paymentTerms: 30 },
  });

  useEffect(() => {
    if (isOpen) {
      if (supplier) {
        methods.reset({ code: supplier.code, name: supplier.name, email: supplier.email ?? '', phone: supplier.phone ?? '', address: supplier.address ?? '', city: supplier.city ?? '', country: supplier.country ?? '', taxId: supplier.taxId ?? '', contactName: supplier.contactName ?? '', status: supplier.status, paymentTerms: supplier.paymentTerms ?? 30 });
      } else {
        methods.reset({ code: '', name: '', email: '', phone: '', address: '', city: '', country: '', taxId: '', contactName: '', status: 'ACTIVE', paymentTerms: 30 });
      }
    }
  }, [isOpen, supplier, methods]);

  const { register, formState: { errors, isSubmitting } } = methods;

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && supplier) {
        await supplierService.update(supplier.id, values);
        notify.success('Supplier updated');
      } else {
        await supplierService.create(values);
        notify.success('Supplier created');
      }
      onSaved();
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Supplier' : 'Add Supplier'} size="lg"
      footer={<>
        <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
        <Button type="submit" form="supplier-form" loading={isSubmitting}>{isEdit ? 'Save Changes' : 'Create Supplier'}</Button>
      </>}>
      <FormProvider {...methods}>
        <FormWrapper id="supplier-form" onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Input label="Code" error={errors.code?.message} {...register('code')} /><FieldError name="code" /></div>
            <div><Input label="Name" error={errors.name?.message} {...register('name')} /><FieldError name="name" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Input label="Email" type="email" error={errors.email?.message} {...register('email')} /><FieldError name="email" /></div>
            <div><Input label="Phone" {...register('phone')} /></div>
          </div>
          <div><Input label="Address" {...register('address')} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><Input label="City" {...register('city')} /></div>
            <div><Input label="Country" {...register('country')} /></div>
            <div><Input label="Tax ID" {...register('taxId')} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Input label="Contact Person" {...register('contactName')} /></div>
            <div><Input label="Payment Terms (days)" type="number" error={errors.paymentTerms?.message} {...register('paymentTerms')} /></div>
          </div>
          <div>
            <Select label="Status"
              options={[{ label: 'Active', value: 'ACTIVE' }, { label: 'Inactive', value: 'INACTIVE' }, { label: 'Blocked', value: 'BLOCKED' }]}
              {...register('status')} />
          </div>
        </FormWrapper>
      </FormProvider>
    </Modal>
  );
}
