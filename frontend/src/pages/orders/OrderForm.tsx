import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { FormWrapper, FieldError } from '../../components/forms/FormWrapper';
import { FormProvider } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../services/order.service';
import { productService } from '../../services/product.service';
import { useNotification } from '../../hooks/useNotification';
import { getErrorMessage } from '../../services/api';
import type { Order, Customer, CreateOrderItemRequest } from '../../types/order.types';

const itemSchema = z.object({
  productId: z.string().min(1, 'Select product'),
  quantity: z.coerce.number().min(1, 'Qty >= 1'),
  unitPrice: z.coerce.number().min(0),
  discount: z.coerce.number().min(0),
});

const schema = z.object({
  customerId: z.string().min(1, 'Select customer'),
  date: z.string().min(1, 'Date required'),
  discount: z.coerce.number().min(0),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, 'Add at least one item'),
});

type FormValues = z.infer<typeof schema>;

interface OrderFormProps {
  isOpen: boolean;
  order: Order | null;
  customers: Customer[];
  onClose: () => void;
  onSaved: () => void;
}

export function OrderForm({ isOpen, order, customers, onClose, onSaved }: OrderFormProps) {
  const notify = useNotification();
  const isEdit = Boolean(order);

  const { data: products } = useQuery({ queryKey: ['products-order-form'], queryFn: () => productService.getAll({ limit: 500 }) });

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { customerId: '', date: new Date().toISOString().split('T')[0], discount: 0, notes: '', items: [{ productId: '', quantity: 1, unitPrice: 0, discount: 0 }] },
  });

  const { control, register, watch, setValue, formState: { errors, isSubmitting } } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    if (isOpen) {
      if (order) {
        methods.reset({
          customerId: order.customerId,
          date: order.date.split('T')[0],
          discount: order.discount,
          notes: order.notes ?? '',
          items: order.items.map((i) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice, discount: i.discount })),
        });
      } else {
        methods.reset({ customerId: '', date: new Date().toISOString().split('T')[0], discount: 0, notes: '', items: [{ productId: '', quantity: 1, unitPrice: 0, discount: 0 }] });
      }
    }
  }, [isOpen, order, methods]);

  const items = watch('items');

  const calcItemTotal = (productId: string, quantity: number, unitPrice: number, discount: number) => {
    const price = products?.data.find((p) => p.id === productId)?.salePrice ?? unitPrice;
    return quantity * price - discount;
  };

  const onProductChange = (index: number, productId: string) => {
    const product = products?.data.find((p) => p.id === productId);
    setValue(`items.${index}.unitPrice`, product?.salePrice ?? 0);
  };

  const subtotal = items.reduce((sum, it) => sum + (calcItemTotal(it.productId, it.quantity, it.unitPrice, it.discount) || 0), 0);
  const grandTotal = subtotal - (Number(watch('discount')) || 0);

  const onSubmit = async (values: FormValues) => {
    try {
      const orderItems: CreateOrderItemRequest[] = values.items.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
        unitPrice: products?.data.find((p) => p.id === it.productId)?.salePrice ?? it.unitPrice,
        discount: it.discount,
      }));
      if (isEdit && order) {
        await orderService.update(order.id, { customerId: values.customerId, date: values.date, items: orderItems, discount: values.discount, notes: values.notes });
        notify.success('Order updated');
      } else {
        await orderService.create({ customerId: values.customerId, date: values.date, items: orderItems, discount: values.discount, notes: values.notes });
        notify.success('Order created');
      }
      onSaved();
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  const productOptions = [{ label: 'Select product', value: '' }, ...(products?.data?.map((p) => ({ label: `${p.name} (${p.code})`, value: p.id })) ?? [])];
  const customerOptions = [{ label: 'Select customer', value: '' }, ...customers.map((c) => ({ label: c.name, value: c.id }))];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Order' : 'New Order'} size="xl"
      footer={<>
        <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
        <Button type="submit" form="order-form" loading={isSubmitting}>{isEdit ? 'Save Changes' : 'Create Order'}</Button>
      </>}>
      <FormProvider {...methods}>
        <FormWrapper id="order-form" onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Select label="Customer" error={errors.customerId?.message} options={customerOptions} {...register('customerId')} />
              <FieldError name="customerId" />
            </div>
            <div><Input label="Date" type="date" error={errors.date?.message} {...register('date')} /><FieldError name="date" /></div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="label-base mb-0">Items</p>
              <Button type="button" size="sm" variant="outline" leftIcon={<Plus className="h-4 w-4" />} onClick={() => append({ productId: '', quantity: 1, unitPrice: 0, discount: 0 })}>Add Item</Button>
            </div>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <Select options={productOptions} {...register(`items.${index}.productId`)} onChange={(e) => onProductChange(index, e.target.value)} />
                  </div>
                  <div className="col-span-2"><Input type="number" placeholder="Qty" {...register(`items.${index}.quantity`)} /></div>
                  <div className="col-span-2"><Input type="number" step="0.01" placeholder="Price" {...register(`items.${index}.unitPrice`)} /></div>
                  <div className="col-span-2"><Input type="number" step="0.01" placeholder="Disc" {...register(`items.${index}.discount`)} /></div>
                  <div className="col-span-1">
                    <button type="button" onClick={() => remove(index)} className="p-2 rounded-lg text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {errors.items && <p className="mt-1 text-xs text-danger-600">{errors.items.message || 'Items required'}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Input label="Global Discount" type="number" step="0.01" {...register('discount')} /></div>
            <div><Input label="Notes" {...register('notes')} /></div>
          </div>

          <div className="flex justify-end gap-6 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
            <div className="text-right text-sm">
              <p className="text-slate-500">Subtotal: <span className="font-medium">{subtotal.toFixed(2)}</span></p>
              <p className="text-slate-900 dark:text-white font-bold">Total: {grandTotal.toFixed(2)}</p>
            </div>
          </div>
        </FormWrapper>
      </FormProvider>
    </Modal>
  );
}
