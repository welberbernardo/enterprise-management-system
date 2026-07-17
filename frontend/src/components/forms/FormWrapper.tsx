import { type ReactNode } from 'react';
import { useFormContext, type FieldValues, type Path } from 'react-hook-form';

interface FormWrapperProps<T extends FieldValues> {
  onSubmit: (data: T) => void;
  children: ReactNode;
  className?: string;
  id?: string;
}

export function FormWrapper<T extends FieldValues>({
  onSubmit,
  children,
  className,
  id,
}: FormWrapperProps<T>) {
  const methods = useFormContext<T>();
  return (
    <form id={id} onSubmit={methods.handleSubmit(onSubmit)} className={className}>
      {children}
    </form>
  );
}

interface FormFieldProps {
  name: string;
  label?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, error, required, children, className }: FormFieldProps) {
  return (
    <div className={className}>
      {label && (
        <label className="label-base">
          {label}
          {required && <span className="text-danger-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
    </div>
  );
}

export function FieldError<T extends FieldValues>({ name }: { name: Path<T> }) {
  const {
    formState: { errors },
  } = useFormContext<T>();
  const error = errors[name];
  if (!error) return null;
  return <p className="mt-1 text-xs text-danger-600">{String(error.message)}</p>;
}
