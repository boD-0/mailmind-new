import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string | null;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', type, ...props }, ref) => {
    return (
      <label className="flex flex-col text-sm w-full">
        {label ? <span className="mb-2 text-[var(--color-text-secondary)]">{label}</span> : null}
        <input
          ref={ref}
          type={type}
          className={`h-10 px-3 rounded-[var(--radius-input)] border border-[var(--border-1)] bg-[var(--color-background)] focus:outline-none focus:shadow-[var(--focus-ring)] ${className}`}
          {...props}
        />
        {error ? (
          <div className="mt-2 bg-[#FCEBEB] border-l-4 border-[#E24B4A] px-3 py-2 text-[#A32D2D] text-sm rounded">
            {error}
          </div>
        ) : null}
      </label>
    );
  }
);

Input.displayName = "Input";