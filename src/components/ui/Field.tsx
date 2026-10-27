"use client";

import { forwardRef, useEffect, useId, useRef, useState, useCallback } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

type BaseProps = {
  label: string;
  error?: string;
  hint?: ReactNode;
  className?: string;
};

function getBorderClasses(error?: string) {
  return error
    ? "border-danger focus:border-danger focus:ring-2 focus:ring-danger/25"
    : "border-line focus:border-navy focus:ring-2 focus:ring-navy/25";
}

/**
 * Text input with floating label that smoothly animates onto the top border.
 */
export const TextInput = forwardRef<HTMLInputElement, BaseProps & InputHTMLAttributes<HTMLInputElement>>(
  function TextInput({ label, error, hint, className, placeholder, value, defaultValue, type, ...props }, ref) {
    const id = useId();
    const errId = `${id}-err`;
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [isFocused, setIsFocused] = useState(false);
    const [internalValue, setInternalValue] = useState<string>(() => {
      if (value !== undefined) return String(value);
      if (defaultValue !== undefined) return String(defaultValue);
      return "";
    });

    const isControlled = value !== undefined;
    const currentVal = isControlled ? String(value ?? "") : internalValue;


    useEffect(() => {
      const syncVal = () => {
        if (inputRef.current) {
          const domVal = inputRef.current.value || "";
          if (domVal !== internalValue) {
            setInternalValue(domVal);
          }
        }
      };
      syncVal();
      const node = inputRef.current;
      if (node) {
        node.addEventListener("animationstart", syncVal);
        return () => node.removeEventListener("animationstart", syncVal);
      }
    }, [internalValue]);

    const setMergedRef = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
        }
      },
      [ref],
    );

    const isAlwaysFloated = type === "date" || type === "time" || type === "datetime-local";
    const hasContent = Boolean(currentVal && currentVal.length > 0);
    const isFloated = isAlwaysFloated || isFocused || hasContent;

    // Filter out placeholder if it just repeats the label
    const effectivePlaceholder = placeholder && placeholder.trim() !== label.trim() ? placeholder : undefined;

    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        <div className="relative w-full">
          <input
            ref={setMergedRef}
            id={id}
            type={type}
            value={value}
            defaultValue={defaultValue}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errId : undefined}
            placeholder={effectivePlaceholder}
            onFocus={(e) => {
              setIsFocused(true);
              setInternalValue(e.target.value || "");
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              setInternalValue(e.target.value || "");
              props.onBlur?.(e);
            }}
            onChange={(e) => {
              setInternalValue(e.target.value);
              props.onChange?.(e);
            }}
            onInput={(e) => {
              setInternalValue((e.target as HTMLInputElement).value);
              props.onInput?.(e);
            }}
            className={cn(
              "peer h-14 w-full rounded-input border bg-card px-4 text-body text-charcoal outline-none transition-all duration-200",
              "disabled:cursor-not-allowed disabled:bg-soft/60 disabled:text-muted",
              !isFocused && "placeholder:text-transparent",
              isFocused && "placeholder:text-muted/60",
              getBorderClasses(error),
            )}
            {...props}
          />
          <label
            htmlFor={id}
            className={cn(
              "pointer-events-none absolute select-none whitespace-nowrap z-10 transition-all duration-200 ease-out",
              // Active state: float when focused or has content, else rest in placeholder position
              isFloated
                ? "top-0 -translate-y-1/2 left-3 px-2 text-xs font-bold leading-none bg-card"
                : "top-1/2 -translate-y-1/2 left-4 px-0 text-body font-normal bg-transparent",
              error
                ? "text-danger"
                : isFocused
                  ? "text-navy"
                  : "text-muted",
            )}
          >
            {label}
          </label>
        </div>
        {hint && !error && <p className="px-1 text-body-sm text-muted">{hint}</p>}
        {error && (
          <p id={errId} role="alert" className="px-1 text-body-sm font-semibold text-danger">
            {error}
          </p>
        )}
      </div>
    );
  },
);

/**
 * Select input with floating label that smoothly animates onto the top border.
 */
export const SelectInput = forwardRef<HTMLSelectElement, BaseProps & SelectHTMLAttributes<HTMLSelectElement>>(
  function SelectInput({ label, error, hint, className, children, value, defaultValue, ...props }, ref) {
    const id = useId();
    const errId = `${id}-err`;
    const selectRef = useRef<HTMLSelectElement | null>(null);

    const [isFocused, setIsFocused] = useState(false);
    const [internalValue, setInternalValue] = useState<string>(() => {
      if (value !== undefined) return String(value);
      if (defaultValue !== undefined) return String(defaultValue);
      return "";
    });

    const isControlled = value !== undefined;
    const currentVal = isControlled ? String(value ?? "") : internalValue;

    useEffect(() => {
      if (selectRef.current) {
        const domVal = selectRef.current.value;
        if (domVal !== internalValue) {
          setInternalValue(domVal);
        }
      }
    }, [internalValue]);

    const setMergedRef = useCallback(
      (node: HTMLSelectElement | null) => {
        selectRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLSelectElement | null>).current = node;
        }
      },
      [ref],
    );

    const hasContent = Boolean(currentVal && currentVal !== "");
    const isFloated = isFocused || hasContent;

    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        <div className="relative w-full">
          <select
            ref={setMergedRef}
            id={id}
            value={value}
            defaultValue={defaultValue}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errId : undefined}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              setInternalValue(e.target.value);
              props.onBlur?.(e);
            }}
            onChange={(e) => {
              setInternalValue(e.target.value);
              props.onChange?.(e);
            }}
            className={cn(
              "peer h-14 w-full cursor-pointer appearance-none rounded-input border bg-card px-4 pr-12 text-body outline-none transition-all duration-200",
              "disabled:cursor-not-allowed disabled:bg-soft/60 disabled:text-muted",
              isFloated ? "text-charcoal" : "text-transparent",
              getBorderClasses(error),
            )}
            {...props}
          >
            {children}
          </select>
          <label
            htmlFor={id}
            className={cn(
              "pointer-events-none absolute select-none whitespace-nowrap z-10 transition-all duration-200 ease-out",
              "peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:left-3 peer-focus:px-2 peer-focus:text-xs peer-focus:font-bold peer-focus:bg-card peer-focus:text-navy",
              isFloated
                ? "top-0 -translate-y-1/2 left-3 px-2 text-xs font-bold leading-none bg-card"
                : "top-1/2 -translate-y-1/2 left-4 px-0 text-body font-normal bg-transparent",
              error
                ? "text-danger peer-focus:text-danger"
                : isFocused
                  ? "text-navy"
                  : isFloated
                    ? "text-muted"
                    : "text-muted",
            )}
          >
            {label}
          </label>
          <ChevronDown
            aria-hidden
            className={cn(
              "pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 transition-colors",
              isFocused ? "text-navy" : "text-charcoal",
            )}
          />
        </div>
        {hint && !error && <p className="px-1 text-body-sm text-muted">{hint}</p>}
        {error && (
          <p id={errId} role="alert" className="px-1 text-body-sm font-semibold text-danger">
            {error}
          </p>
        )}
      </div>
    );
  },
);

/**
 * Multiline textarea with floating label that smoothly animates onto the top border.
 */
export const TextArea = forwardRef<HTMLTextAreaElement, BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function TextArea({ label, error, hint, className, placeholder, value, defaultValue, rows = 4, ...props }, ref) {
    const id = useId();
    const errId = `${id}-err`;
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const [isFocused, setIsFocused] = useState(false);
    const [internalValue, setInternalValue] = useState<string>(() => {
      if (value !== undefined) return String(value);
      if (defaultValue !== undefined) return String(defaultValue);
      return "";
    });

    const isControlled = value !== undefined;
    const currentVal = isControlled ? String(value ?? "") : internalValue;


    useEffect(() => {
      const syncVal = () => {
        if (textareaRef.current) {
          const domVal = textareaRef.current.value || "";
          if (domVal !== internalValue) {
            setInternalValue(domVal);
          }
        }
      };
      syncVal();
      const node = textareaRef.current;
      if (node) {
        node.addEventListener("animationstart", syncVal);
        return () => node.removeEventListener("animationstart", syncVal);
      }
    }, [internalValue]);

    const setMergedRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        }
      },
      [ref],
    );

    const hasContent = Boolean(currentVal && currentVal.length > 0);
    const isFloated = isFocused || hasContent;

    // Filter out placeholder if it just repeats the label
    const effectivePlaceholder = placeholder && placeholder.trim() !== label.trim() ? placeholder : undefined;

    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        <div className="relative w-full">
          <textarea
            ref={setMergedRef}
            id={id}
            rows={rows}
            value={value}
            defaultValue={defaultValue}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errId : undefined}
            placeholder={effectivePlaceholder}
            onFocus={(e) => {
              setIsFocused(true);
              setInternalValue(e.target.value || "");
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              setInternalValue(e.target.value || "");
              props.onBlur?.(e);
            }}
            onChange={(e) => {
              setInternalValue(e.target.value);
              props.onChange?.(e);
            }}
            onInput={(e) => {
              setInternalValue((e.target as HTMLTextAreaElement).value);
              props.onInput?.(e);
            }}
            className={cn(
              "peer min-h-28 w-full resize-y rounded-input border bg-card p-4 text-body text-charcoal outline-none transition-all duration-200",
              "disabled:cursor-not-allowed disabled:bg-soft/60 disabled:text-muted",
              !isFocused && "placeholder:text-transparent",
              isFocused && "placeholder:text-muted/60",
              getBorderClasses(error),
            )}
            {...props}
          />
          <label
            htmlFor={id}
            className={cn(
              "pointer-events-none absolute select-none whitespace-nowrap z-10 transition-all duration-200 ease-out",
              isFloated
                ? "top-0 -translate-y-1/2 left-3 px-2 text-xs font-bold leading-none bg-card"
                : "top-4 translate-y-0 left-4 px-0 text-body font-normal bg-transparent",
              error
                ? "text-danger"
                : isFocused
                  ? "text-navy"
                  : "text-muted",
            )}
          >
            {label}
          </label>
        </div>
        {hint && !error && <p className="px-1 text-body-sm text-muted">{hint}</p>}
        {error && (
          <p id={errId} role="alert" className="px-1 text-body-sm font-semibold text-danger">
            {error}
          </p>
        )}
      </div>
    );
  },
);

/**
 * Checkbox component with accessible label.
 */
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
        <label htmlFor={id} className="cursor-pointer text-body text-muted select-none">
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

/** Generic Field wrapper exported for backwards compatibility */
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
    <div className={cn("flex flex-col gap-1.5", className)}>
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
