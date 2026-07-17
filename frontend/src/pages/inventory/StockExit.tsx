import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { FormWrapper, FieldError } from '../../components/forms/FormWrapper';
import { FormProvider } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useNotification } from '../../hooks/useNotification';
import { productService } from '../../services/product.service';
import { inventoryService } from '../../services/inventory.service';
import { getErrorMessage } from '../../services/api';

const schema = z.object({
  productId: z.string().min(1, 'Select product'),
  quantity: z.coerce.number().min(1, 'Qty >= 1'),
  unitCost: z.coerce.number().min(0),
  reason: z.enum(['SALE', 'DAMAGE', 'MANUAL']),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface StockExitProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function StockExit({ isOpen, onClose, onSaved }: StockExitProps) {
  const notify = useNotification();
  const { data: products } = useQuery({ queryKey: ['products-stock-exit'], queryFn: () => productService.getAll({ limit: 500 }) });

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { productId: '', quantity: 1, unitCost: 0, reason: 'SALE', notes: '' },
  });

  useEffect(() => {
    if (isOpen) methods.reset({ productId: '', quantity: 1, unitCost: 0, reason: 'SALE', notes: '' });
  }, [isOpen, methods]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = methods;

  const onSubmit = async (values: FormValues) => {
    try {
      await inventoryService.createMovement({ ...values, type: 'EXIT' });
      notify.success('Stock exit recorded');
      onSaved();
    } catch (e) {
      notify.error(getErrorMessage(e));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Stock Exit" size="md"
      footer={<>
        <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
        <Button type="submit" form="stock-exit-form" variant="danger" loading={isSubmitting}>Save</Button>
      </>}>
      <FormProvider {...methods}>
        <FormWrapper id="stock-exit-form" onSubmit={onSubmit} className="space-y-4">
          <div>
            <Select label="Product" error={errors.productId?.message}
              options={[{ label: 'Select product', value: '' }, ...(products?.data.map((p) => ({ label: `${p.name} (${p.code})`, value: p.id })) ?? [])]}
              {...register('productId')} />
            <FieldError name="productId" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Input label="Quantity" type="number" error={errors.quantity?.message} {...register('quantity')} /><FieldError name="quantity" /></div>
            <div><Input label="Unit Cost" type="number" step="0.01" {...register('unitCost')} /></div>
          </div>
          <div>
            <Select label="Reason"
              options={[{ label: 'Sale', value: 'SALE' }, { label: 'Damage', value: 'DAMAGE' }, { label: 'Manual', value: 'MANUAL' }]}
              {...register('reason')} />
          </div>
          <div><Input label="Notes" {...register('notes')} /></div>
        </FormWrapper>
      </FormProvider>
    </Modal>
  );
}
