"use client";

import { type Control, Controller, type Path } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface FormFieldProps<TFieldValues extends Record<string, unknown>> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  id?: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  description?: React.ReactNode;
  rightLabel?: React.ReactNode;
  inputProps?: React.ComponentProps<typeof Input>;
}

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
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const inputValue = field.value as unknown as
          | string
          | number
          | readonly string[]
          | undefined;

        // Prevent inputProps from overriding critical attributes
        const {
          id: _id,
          placeholder: _placeholder,
          type: _type,
          value: _value,
          disabled: inputDisabled,
          onChange: _onChange,
          onBlur: _onBlur,
          name: _name,
          ref: _ref,
          ...safeInputProps
        } = inputProps || {};

        return (
          <Field data-invalid={fieldState.invalid}>
            <div className="flex items-center">
              <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
              {rightLabel && <div className="ml-auto">{rightLabel}</div>}
            </div>
            <Input
              {...field}
              aria-invalid={fieldState.invalid}
              disabled={inputDisabled}
              id={inputId}
              placeholder={placeholder}
              type={type}
              value={inputValue ?? ""}
              {...safeInputProps}
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
