import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../_internal/cn';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'prefix'> {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  label?: string;
  prefix?: ReactNode;
  type?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { value, onChange, placeholder, error, label, prefix, type = 'text', className, id, ...rest },
  ref,
) {
  const inputId = id || (label ? `msp-input-${label}` : undefined);
  return (
    <div className="flex w-full flex-col gap-1">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      ) : null}
      <div
        className={cn(
          'flex h-9 items-center rounded-md border bg-white px-3 transition-colors',
          'focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200',
          error ? 'border-rose-400 focus-within:border-rose-500 focus-within:ring-rose-200' : 'border-slate-300',
          className,
        )}
      >
        {prefix ? <span className="mr-2 inline-flex items-center text-slate-500">{prefix}</span> : null}
        <input
          ref={ref}
          id={inputId}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          className="h-full w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          {...rest}
        />
      </div>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
});
