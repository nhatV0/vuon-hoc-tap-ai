import React from "react";
import { cn } from "@/shared/lib/utils";

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  error,
  hint,
  required = false,
  className,
  children,
}) => {
  return (
    <div className={cn("space-y-1.5 text-left", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-xs font-semibold text-stone-700 tracking-wide select-none"
      >
        {label}
        {required && <span className="ml-1 text-rose-500 font-bold" aria-hidden="true">*</span>}
      </label>
      <div>{children}</div>
      {error ? (
        <p className="text-[11px] font-medium text-rose-600 animate-in fade-in-50" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11px] text-stone-500">{hint}</p>
      ) : null}
    </div>
  );
};
