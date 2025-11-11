"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { OrganizationType } from "@/components/features/organizations/types";
import {
  type ProjectFormInput,
  ProjectFormSchema,
} from "@/components/features/projects/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { orpc } from "@/lib/orpc/orpc";
import { formatDate } from "@/lib/utils";

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !Number.isNaN(date.getTime());
}

interface DatePickerWithInputProps {
  id: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
}

function DatePickerWithInput({
  id,
  value,
  onChange,
  placeholder = "DD.MM.YYYY",
}: DatePickerWithInputProps) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date | undefined>(value);
  const [inputValue, setInputValue] = useState(formatDate(value));

  return (
    <div className="relative flex gap-2">
      <Input
        id={id}
        value={inputValue}
        placeholder={placeholder}
        className="bg-background pr-10"
        onChange={(e) => {
          const date = new Date(e.target.value);
          setInputValue(e.target.value);
          if (isValidDate(date)) {
            onChange(date);
            setMonth(date);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="-translate-y-1/2 absolute top-1/2 right-1 size-7.5"
          >
            <CalendarIcon className="size-3.5" />
            <span className="sr-only">Select date</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden p-0"
          align="end"
          alignOffset={-8}
          sideOffset={10}
        >
          <Calendar
            mode="single"
            selected={value}
            captionLayout="dropdown"
            month={month}
            onMonthChange={setMonth}
            onSelect={(date) => {
              onChange(date);
              setInputValue(formatDate(date));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface CreateProjectFormProps {
  userOrganizations: Omit<OrganizationType, "metadata">[];
}

function CreateProjectForm({ userOrganizations }: CreateProjectFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormInput>({
    resolver: zodResolver(ProjectFormSchema),
    defaultValues: {
      name: "",
      startDate: undefined,
      endDate: undefined,
      location: null,
      country: "",
      welcomeMessage: null,
      organizationId: "",
    },
  });

  async function onSubmit(values: ProjectFormInput) {
    console.debug("Submitting project:", values);
    try {
      const result = await orpc.project.create(values);

      if (result.success) {
        toast.success("Project created successfully");
      } else {
        toast.error("Failed to create project");
      }
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || "An error occurred");
    }
  }

  return (
    <div>
      <Toaster />

      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="name">Project Name</FieldLabel>
            <Input id="name" {...register("name")} />
            <FieldError errors={[errors.name]} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={!!errors.startDate}>
              <FieldLabel htmlFor="startDate">Start Date</FieldLabel>
              <Controller
                control={control}
                name="startDate"
                render={({ field }) => (
                  <DatePickerWithInput
                    id="startDate"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <FieldError errors={[errors.startDate]} />
            </Field>

            <Field data-invalid={!!errors.endDate}>
              <FieldLabel htmlFor="endDate">End Date</FieldLabel>
              <Controller
                control={control}
                name="endDate"
                render={({ field }) => (
                  <DatePickerWithInput
                    id="endDate"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <FieldError errors={[errors.endDate]} />
            </Field>
          </div>

          <Field data-invalid={!!errors.country}>
            <FieldLabel htmlFor="country">Country</FieldLabel>
            <Input id="country" {...register("country")} />
            <FieldError errors={[errors.country]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="location">Location (optional)</FieldLabel>
            <Input id="location" {...register("location")} />
          </Field>

          <Field>
            <FieldLabel htmlFor="welcomeMessage">
              Welcome Message (optional)
            </FieldLabel>
            <Textarea id="welcomeMessage" {...register("welcomeMessage")} />
          </Field>

          <Field data-invalid={!!errors.organizationId}>
            <FieldLabel htmlFor="organizationId">Organization</FieldLabel>
            <Controller
              control={control}
              name="organizationId"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="organizationId">
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {userOrganizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.organizationId]} />
          </Field>

          <Button type="submit" disabled={isSubmitting} className="w-fit">
            {isSubmitting ? "Creating..." : "Create Project"}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}

export default CreateProjectForm;
