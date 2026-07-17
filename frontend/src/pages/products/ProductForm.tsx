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
import { Tabs, TabPanel } from '../../components/ui/Tabs';
import { useQuery } from '@tanstack/react-query';
import { Upload } from 'lucide-react';
import { useNotification } from '../../hooks/useNotification';
import { categoryService } from '../../services/category.service';
import { productService } from '../../services/product.service';
import { uploadService } from '../../services/upload.service';
import { getErrorMessage } from '../../services/api';
import type { Product } from '../../types/product.types';

const schema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Select a category'),
  costPrice: z.coerce.number().min(0, 'Must be >= 0'),
  salePrice: z.coerce.number().min(0, 'Must be >= 0'),
  stock: z.coerce.number().min(0, 'Must be >= 0'),
  minStock: z.coerce.number().min(0, 'Must be >= 0'),
  barcode: z.string().optional(),
  unit: z.string().min(1, 'Unit is required'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED']),
});

type FormValues = z.infer<typeof schema>;

interface ProductFormProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ProductForm({ isOpen, product, onClose, onSaved }: ProductFormProps) {
  const notify = useNotification();
  const isEdit = Boolean(product);
  const [tab, setTab] = useState('general');
  const [image, setImage] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const { data: categories } = useQuery({ queryKey: ['categories-form'], queryFn: () => categoryService.getAll({ limit: 100 }) });

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: '', name: '', description: '', categoryId: '', costPrice: 0, salePrice: 0, stock: 0, minStock: 0, barcode: '', unit: 'pcs', status: 'ACTIVE' },
  });

  useEffect(() => {
    if (isOpen) {
      setTab('general');
      if (product) {
        setImage(product.image ?? '');
        methods.reset({
          code: product.code, name: product.name, description: product.description ?? '', categoryId: product.categoryId,
          costPrice: product.costPrice, salePrice: product.salePrice, stock: product.stock, minStock: product.minStock,
          barcode: product.barcode ?? '', unit: product.unit, status: product.status,
        });
      } else {
        setImage('');
        methods.reset({ code: '', name: '', description: '', categoryId: '', costPrice: 0, salePrice: 0, stock: 0, minStock: 0, barcode: '', unit: 'pcs', status: 'ACTIVE' });
      }
    }
  }, [isOpen, product, methods]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = methods;

  const onFile = async (file: File) => {
    setUploading(true);
    try {
      const res = await uploadService.uploadImage(file);
      setImage(res.url);
      notify.success('Image uploaded');
    } catch (e) {
      notify.error(getErrorMessage(e));
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = { ...values, image: image || undefined };
      if (isEdit && product) {
        await productService.update(product.id, payload);
        notify.success('Product updated');
      } else {
        await productService.create(payload);
        notify.success('Product created');
      }
      onSaved();
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Product' : 'Add Product'} size="lg"
      footer={<>
        <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
        <Button type="submit" form="product-form" loading={isSubmitting}>{isEdit ? 'Save Changes' : 'Create Product'}</Button>
      </>}>
      <Tabs activeTab={tab} onChange={setTab} tabs={[{ id: 'general', label: 'General' }, { id: 'pricing', label: 'Pricing & Stock' }, { id: 'media', label: 'Image' }]} />
      <FormProvider {...methods}>
        <FormWrapper id="product-form" onSubmit={onSubmit} className="space-y-4 mt-2">
          <TabPanel active={tab === 'general'}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Input label="Code" error={errors.code?.message} {...register('code')} /><FieldError name="code" /></div>
                <div><Input label="Name" error={errors.name?.message} {...register('name')} /><FieldError name="name" /></div>
              </div>
              <div><Input label="Description" {...register('description')} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Select label="Category" error={errors.categoryId?.message}
                    options={[{ label: 'Select category', value: '' }, ...(categories?.data.map((c) => ({ label: c.name, value: c.id })) ?? [])]}
                    {...register('categoryId')} />
                  <FieldError name="categoryId" />
                </div>
                <div>
                  <Select label="Status"
                    options={[{ label: 'Active', value: 'ACTIVE' }, { label: 'Inactive', value: 'INACTIVE' }, { label: 'Discontinued', value: 'DISCONTINUED' }]}
                    {...register('status')} />
                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel active={tab === 'pricing'}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Input label="Cost Price" type="number" step="0.01" error={errors.costPrice?.message} {...register('costPrice')} /></div>
                <div><Input label="Sale Price" type="number" step="0.01" error={errors.salePrice?.message} {...register('salePrice')} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><Input label="Stock" type="number" error={errors.stock?.message} {...register('stock')} /></div>
                <div><Input label="Min Stock" type="number" error={errors.minStock?.message} {...register('minStock')} /></div>
                <div><Input label="Unit" error={errors.unit?.message} {...register('unit')} /></div>
              </div>
              <div><Input label="Barcode" {...register('barcode')} /></div>
            </div>
          </TabPanel>
          <TabPanel active={tab === 'media'}>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                {image ? (
                  <img src={image} alt="preview" className="h-24 w-24 rounded-lg object-cover border" />
                ) : (
                  <div className="h-24 w-24 rounded-lg border border-dashed flex items-center justify-center text-slate-400">
                    <Upload className="h-6 w-6" />
                  </div>
                )}
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">
                    <Upload className="h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload Image'}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} disabled={uploading} />
                </label>
              </div>
            </div>
          </TabPanel>
        </FormWrapper>
      </FormProvider>
    </Modal>
  );
}
