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
import { useQuery } from '@tanstack/react-query';
import { useNotification } from '../../hooks/useNotification';
import { categoryService } from '../../services/category.service';
import { getErrorMessage } from '../../services/api';
import type { Category } from '../../types/category.types';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface CategoryFormProps {
  isOpen: boolean;
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}

export function CategoryForm({ isOpen, category, onClose, onSaved }: CategoryFormProps) {
  const notify = useNotification();
  const isEdit = Boolean(category);

  const { data: categories } = useQuery({
    queryKey: ['categories-all'],
    queryFn: () => categoryService.getAll({ limit: 100 }),
  });

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', parentId: '' },
  });

  useEffect(() => {
    if (isOpen) {
      if (category) {
        methods.reset({ name: category.name, description: category.description ?? '', parentId: category.parentId ?? '' });
      } else {
        methods.reset({ name: '', description: '', parentId: '' });
      }
    }
  }, [isOpen, category, methods]);

  const { register, formState: { errors, isSubmitting } } = methods;

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = { ...values, parentId: values.parentId || undefined };
      if (isEdit && category) {
        await categoryService.update(category.id, payload);
        notify.success('Category updated');
      } else {
        await categoryService.create(payload);
        notify.success('Category created');
      }
      onSaved();
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  const parentOptions = [
    { label: 'No Parent', value: '' },
    ...(categories?.data.filter((c) => c.id !== category?.id).map((c) => ({ label: c.name, value: c.id })) ?? []),
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Category' : 'Add Category'} size="md"
      footer={<>
        <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
        <Button type="submit" form="category-form" loading={isSubmitting}>{isEdit ? 'Save Changes' : 'Create Category'}</Button>
      </>}>
      <FormProvider {...methods}>
        <FormWrapper id="category-form" onSubmit={onSubmit} className="space-y-4">
          <div><Input label="Name" error={errors.name?.message} {...register('name')} /><FieldError name="name" /></div>
          <div><Input label="Description" {...register('description')} /></div>
          <div>
            <Select label="Parent Category" options={parentOptions} {...register('parentId')} />
          </div>
        </FormWrapper>
      </FormProvider>
    </Modal>
  );
}
