import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { FormWrapper, FieldError } from '../../components/forms/FormWrapper';
import { FormProvider } from 'react-hook-form';
import { Checkbox } from '../../components/ui/Checkbox';
import { useNotification } from '../../hooks/useNotification';
import { roleService } from '../../services/role.service';
import { getErrorMessage } from '../../services/api';
import { PERMISSION_GROUPS } from '../../utils/permissions';
import type { Role, Permission } from '../../types/role.types';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  permissions: z.array(z.string()),
});

type FormValues = z.infer<typeof schema>;

interface RoleFormProps {
  isOpen: boolean;
  role: Role | null;
  permissions: Permission[];
  onClose: () => void;
  onSaved: () => void;
}

export function RoleForm({ isOpen, role, permissions, onClose, onSaved }: RoleFormProps) {
  const notify = useNotification();
  const isEdit = Boolean(role);

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', permissions: [] },
  });

  useEffect(() => {
    if (isOpen) {
      if (role) {
        methods.reset({ name: role.name, description: role.description ?? '', permissions: role.permissions });
      } else {
        methods.reset({ name: '', description: '', permissions: [] });
      }
    }
  }, [isOpen, role, methods]);

  const {
    register,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = methods;

  const selected = watch('permissions');
  const [expanded, setExpanded] = useState<string | null>(PERMISSION_GROUPS[0]?.group ?? null);

  const togglePermission = (key: string) => {
    const set = new Set(selected);
    if (set.has(key)) set.delete(key);
    else set.add(key);
    setValue('permissions', Array.from(set));
  };

  const grouped = PERMISSION_GROUPS.map((g) => ({
    ...g,
    permissions: permissions.filter((p) => p.group === g.group),
  })).filter((g) => g.permissions.length > 0);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && role) {
        await roleService.update(role.id, values);
        notify.success('Role updated');
      } else {
        await roleService.create(values);
        notify.success('Role created');
      }
      onSaved();
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Role' : 'Add Role'}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
          <Button type="submit" form="role-form" loading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create Role'}
          </Button>
        </>
      }
    >
      <FormProvider {...methods}>
        <FormWrapper id="role-form" onSubmit={onSubmit} className="space-y-4">
          <div>
            <Input label="Name" error={errors.name?.message} {...register('name')} />
            <FieldError name="name" />
          </div>
          <div>
            <Input label="Description" {...register('description')} />
          </div>

          <div>
            <p className="label-base">Permissions</p>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {grouped.map((group) => (
                <div key={group.group} className="rounded-lg border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setExpanded((e) => (e === group.group ? null : group.group))}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    {group.label}
                    <span className="text-xs text-slate-400">{expanded === group.group ? 'âˆ’' : '+'}</span>
                  </button>
                  {expanded === group.group && (
                    <div className="px-3 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-slide-down">
                      {group.permissions.map((perm) => (
                        <label key={perm.id} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <Checkbox checked={selected.includes(perm.key)} onChange={() => togglePermission(perm.key)} />
                          <span>{perm.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </FormWrapper>
      </FormProvider>
    </Modal>
  );
}
