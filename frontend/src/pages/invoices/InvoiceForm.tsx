import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { FormWrapper, FieldError } from '../../components/forms/FormWrapper';
import { FormProvider } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { useNotification } from '../../hooks/useNotification';
import { getErrorMessage } from '../../services/api';
import { invoiceService } from '../../services/invoice.service';
import type { Invoice, Customer, InvoiceItem } from '../../types/invoice.types';

const itemSchema = z.object({
  description: z.string().min(1, 'Description required'),
  quantity: z.coerce.number().min(1, 'Qty >= 1'),
  unitPrice: z.coerce.number().min(0),
});

const schema = z.object({
  customerId: z.string().min(1, 'Select customer'),
  issueDate: z.string().min(1, 'Issue date required'),
  dueDate: z.string().min(1, 'Due date required'),
  tax: z.coerce.number().min(0),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, 'Add at least one item'),
});

type FormValues = z.infer<typeof schema>;

interface InvoiceFormProps {
  isOpen: boolean;
  invoice: Invoice | null;
  customers: Customer[];
  onClose: () => void;
  onSaved: () => void;
}

export function InvoiceForm({ isOpen, invoice, customers, onClose, onSaved }: InvoiceFormProps) {
  const notify = useNotification();
  const isEdit = Boolean(invoice);

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { customerId: '', issueDate: new Date().toISOString().split('T')[0], dueDate: '', tax: 0, notes: '', items: [{ description: '', quantity: 1, unitPrice: 0 }] },
  });

  const { control, register, watch, formState: { errors, isSubmitting } } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    if (isOpen) {
      if (invoice) {
        methods.reset({
          customerId: invoice.customerId,
          issueDate: invoice.issueDate.split('T')[0],
          dueDate: invoice.dueDate.split('T')[0],
          tax: invoice.tax,
          notes: invoice.notes ?? '',
          items: invoice.items.map((i) => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice })),
        });
      } else {
        methods.reset({ customerId: '', issueDate: new Date().toISOString().split('T')[0], dueDate: '', tax: 0, notes: '', items: [{ description: '', quantity: 1, unitPrice: 0 }] });
      }
    }
  }, [isOpen, invoice, methods]);

  const items = watch('items');
  const subtotal = items.reduce((s, it) => s + (Number(it.quantity) * Number(it.unitPrice) || 0), 0);
  const taxAmt = subtotal * (Number(watch('tax')) || 0) / 100;
  const total = subtotal + taxAmt;

  const onSubmit = async (values: FormValues) => {
    try {
      const invItems: InvoiceItem[] = values.items.map((it) => ({
        id: crypto.randomUUID(),
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        total: it.quantity * it.unitPrice,
      }));
      const payload = { customerId: values.customerId, issueDate: values.issueDate, dueDate: values.dueDate, items: invItems, tax: values.tax, notes: values.notes };
      if (isEdit && invoice) {
        await invoiceService.update(invoice.id, payload);
        notify.success('Invoice updated');
      } else {
        await invoiceService.create(payload);
        notify.success('Invoice created');
      }
      onSaved();
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  const customerOptions = [{ label: 'Select customer', value: '' }, ...customers.map((c) => ({ label: c.name, value: c.id }))];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Invoice' : 'New Invoice'} size="xl"
      footer={<>
        <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
        <Button type="submit" form="invoice-form" loading={isSubmitting}>{isEdit ? 'Save Changes' : 'Create Invoice'}</Button>
      </>}>
      <FormProvider {...methods}>
        <FormWrapper id="invoice-form" onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Select label="Customer" error={errors.customerId?.message} options={customerOptions} {...register('customerId')} />
              <FieldError name="customerId" />
            </div>
            <div><Input label="Issue Date" type="date" error={errors.issueDate?.message} {...register('issueDate')} /></div>
            <div><Input label="Due Date" type="date" error={errors.dueDate?.message} {...register('dueDate')} /></div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="label-base mb-0">Items</p>
              <Button type="button" size="sm" variant="outline" leftIcon={<Plus className="h-4 w-4" />} onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}>Add Item</Button>
            </div>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-6"><Input placeholder="Description" {...register(`items.${index}.description`)} /></div>
                  <div className="col-span-2"><Input type="number" placeholder="Qty" {...register(`items.${index}.quantity`)} /></div>
                  <div className="col-span-3"><Input type="number" step="0.01" placeholder="Price" {...register(`items.${index}.unitPrice`)} /></div>
                  <div className="col-span-1"><button type="button" onClick={() => remove(index)} className="p-2 rounded-lg text-danger-500 hover:bg-danger-50"><Trash2 className="h-4 w-4" /></button></div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Input label="Tax (%)" type="number" step="0.01" {...register('tax')} /></div>
            <div><Input label="Notes" {...register('notes')} /></div>
          </div>

          <div className="flex justify-end p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
            <div className="text-right text-sm space-y-1">
              <p className="text-slate-500">Subtotal: {subtotal.toFixed(2)}</p>
              <p className="text-slate-500">Tax: {taxAmt.toFixed(2)}</p>
              <p className="text-lg font-bold">Total: {total.toFixed(2)}</p>
            </div>
          </div>
        </FormWrapper>
      </FormProvider>
    </Modal>
  );
}
