"use client";

import { type Control, Controller, type Path } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type FormFieldProps<TFieldValues extends Record<string, unknown>> = {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  id?: string;
  type?: string;
  placeholder?: string;
  description?: React.ReactNode;
  rightLabel?: React.ReactNode;
  inputProps?: React.ComponentProps<typeof Input>;
};

export function FormField<TFieldValues extends Record<string, unknown>>({
  name,
  control,
  label,
  id,
  type = "text",
  placeholder,
  description,
  rightLabel,
  inputProps,
}: FormFieldProps<TFieldValues>) {
  const inputId = id ?? name;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const inputValue = field.value as unknown as
          | string
          | number
          | readonly string[]
          | undefined;

        return (
          <Field data-invalid={fieldState.invalid}>
            <div className="flex items-center">
              <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
              {rightLabel && <div className="ml-auto">{rightLabel}</div>}
            </div>
            <Input
              {...field}
              value={inputValue}
              id={inputId}
              type={type}
              placeholder={placeholder}
              aria-invalid={fieldState.invalid}
              disabled={Boolean(inputProps?.disabled)}
              {...inputProps}
            />
            {description && <FieldDescription>{description}</FieldDescription>}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}

export default FormField;
