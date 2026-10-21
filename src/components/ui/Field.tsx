import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

const control =
  "w-full rounded-input border bg-card px-4 text-body text-charcoal placeholder:text-muted " +
  "transition focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/25 " +
  "disabled:cursor-not-allowed disabled:bg-soft/60 disabled:text-muted";

function controlClasses(error?: string, extra?: string) {
  return cn(control, error ? "border-danger focus:border-danger focus:ring-danger/25" : "border-line", extra);
}

type BaseProps = { label: string; error?: string; hint?: ReactNode; className?: string };

/** Label + control + error wrapper. The control id is passed to children via render prop. */
export function Field({
  label,
  error,
  hint,
  className,
  children,
}: BaseProps & { children: (props: { id: string; "aria-invalid": boolean; "aria-describedby"?: string }) => ReactNode }) {
  const id = useId();
  const errId = `${id}-err`;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-body font-bold text-charcoal">
        {label}
      </label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": error ? errId : undefined })}
      {hint && !error && <p className="text-body-sm text-muted">{hint}</p>}
      {error && (
        <p id={errId} role="alert" className="text-body-sm font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export const TextInput = forwardRef<HTMLInputElement, BaseProps & InputHTMLAttributes<HTMLInputElement>>(function TextInput(
  { label, error, hint, className, ...props },
  ref,
) {
  return (
    <Field label={label} error={error} hint={hint} className={className}>
      {(a11y) => <input ref={ref} {...a11y} {...props} className={controlClasses(error, "h-14")} />}
    </Field>
  );
});

export const SelectInput = forwardRef<HTMLSelectElement, BaseProps & SelectHTMLAttributes<HTMLSelectElement>>(function SelectInput(
  { label, error, hint, className, children, ...props },
  ref,
) {
  return (
    <Field label={label} error={error} hint={hint} className={className}>
      {(a11y) => (
        <div className="relative">
          <select ref={ref} {...a11y} {...props} className={controlClasses(error, "h-14 appearance-none pr-12")}>
            {children}
          </select>
          <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-charcoal" />
        </div>
      )}
    </Field>
  );
});

export const TextArea = forwardRef<HTMLTextAreaElement, BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>>(function TextArea(
  { label, error, hint, className, ...props },
  ref,
) {
  return (
    <Field label={label} error={error} hint={hint} className={className}>
      {(a11y) => <textarea ref={ref} rows={4} {...a11y} {...props} className={controlClasses(error, "min-h-28 resize-y py-4")} />}
    </Field>
  );
});

export const Checkbox = forwardRef<
  HTMLInputElement,
  { label: ReactNode; error?: string; className?: string } & Omit<InputHTMLAttributes<HTMLInputElement>, "type">
>(function Checkbox({ label, error, className, ...props }, ref) {
  const id = useId();
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          aria-invalid={Boolean(error)}
          {...props}
          className="mt-0.5 size-5 shrink-0 cursor-pointer rounded border-line accent-navy"
        />
        <label htmlFor={id} className="cursor-pointer text-body text-muted">
          {label}
        </label>
      </div>
      {error && (
        <p role="alert" className="pl-8 text-body-sm font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
});
