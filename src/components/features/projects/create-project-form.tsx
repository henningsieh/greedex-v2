"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { OrganizationType } from "@/components/features/organizations/types";
import {
  ProjectFormSchema,
  type ProjectFormSchemaType,
} from "@/components/features/projects/types";
import { Button } from "@/components/ui/button";
import { DatePickerWithInput } from "@/components/ui/date-picker-with-input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/lib/i18n/navigation";
import { orpc, orpcQuery } from "@/lib/orpc/orpc";

interface CreateProjectFormProps {
  userOrganizations: Omit<OrganizationType, "metadata">[];
}

function CreateProjectForm({ userOrganizations }: CreateProjectFormProps) {
  const t = useTranslations("project.create");
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormSchemaType>({
    resolver: zodResolver(ProjectFormSchema),
    mode: "onChange",
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

  const locale = useLocale();

  const queryClient = useQueryClient();

  const router = useRouter();

  const { mutateAsync: createProjectMutation, isPending } = useMutation({
    mutationFn: (values: ProjectFormSchemaType) => orpc.project.create(values),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(t("toast.success"));
      } else {
        toast.error(t("toast.error"));
      }
      router.push(`/${locale}/org/projects/${result.project.id}`);
      // Invalidate project list
      queryClient.invalidateQueries({
        queryKey: orpcQuery.project.list.queryKey(),
      });
    },

    onError: (err: unknown) => {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || t("toast.error-generic"));
    },
  });

  async function onSubmit(values: ProjectFormSchemaType) {
    console.debug("Submitting project:", values);
    await createProjectMutation(values);
  }

  return (
    <div>
      <Toaster />

      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="name">{t("form.name")}</FieldLabel>
            <Input id="name" {...register("name")} />
            <FieldError errors={[errors.name]} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={!!errors.startDate}>
              <FieldLabel htmlFor="startDate">
                {t("form.start-date")}
              </FieldLabel>
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
              <FieldLabel htmlFor="endDate">{t("form.end-date")}</FieldLabel>
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
            <FieldLabel htmlFor="country">{t("form.country")}</FieldLabel>
            <Input id="country" {...register("country")} />
            <FieldError errors={[errors.country]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="location">{t("form.location")}</FieldLabel>
            <Input id="location" {...register("location")} />
          </Field>

          <Field>
            <FieldLabel htmlFor="welcomeMessage">
              {t("form.welcome-message")}
            </FieldLabel>
            <Textarea id="welcomeMessage" {...register("welcomeMessage")} />
          </Field>

          <Field data-invalid={!!errors.organizationId}>
            <FieldLabel htmlFor="organizationId">
              {t("form.organization")}
            </FieldLabel>
            <Controller
              control={control}
              name="organizationId"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="organizationId">
                    <SelectValue placeholder={t("form.select-organization")} />
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

          <Button type="submit" disabled={isPending} className="w-fit">
            {isPending ? t("form.creating") : t("form.create-project")}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}

export default CreateProjectForm;
