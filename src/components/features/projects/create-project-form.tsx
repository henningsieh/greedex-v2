"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { DatePickerWithInput } from "@/components/date-picker-with-input";
import type { Organization } from "@/components/features/organizations/types";
import {
  ProjectFormSchema,
  type ProjectFormSchemaType,
} from "@/components/features/projects/types";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getProjectDetailPath } from "@/lib/config/app";
import { useRouter } from "@/lib/i18n/navigation";
import { orpc, orpcQuery } from "@/lib/orpc/orpc";

interface CreateProjectFormProps {
  userOrganizations: Omit<Organization, "metadata">[];
}

function CreateProjectForm({ userOrganizations }: CreateProjectFormProps) {
  const t = useTranslations("organization.projects.form.new");
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
      router.push(getProjectDetailPath(result.project.id));
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldSet className="mx-auto max-w-3xl p-2 sm:p-6">
        <FieldContent>
          <FieldLegend>{t("legend")}</FieldLegend>
          {/* <FieldDescription>{t("description")}</FieldDescription> */}
        </FieldContent>
        <FieldGroup>
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="name">{t("name")}</FieldLabel>
            <Input id="name" {...register("name")} />
            <FieldDescription>{t("name-description")}</FieldDescription>
            <FieldError errors={[errors.name]} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={!!errors.startDate}>
              <FieldLabel htmlFor="startDate">{t("start-date")}</FieldLabel>
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
              <FieldDescription>{t("start-date-description")}</FieldDescription>
              <FieldError errors={[errors.startDate]} />
            </Field>

            <Field data-invalid={!!errors.endDate}>
              <FieldLabel htmlFor="endDate">{t("end-date")}</FieldLabel>
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
              <FieldDescription>{t("end-date-description")}</FieldDescription>
              <FieldError errors={[errors.endDate]} />
            </Field>
          </div>

          <Field data-invalid={!!errors.country}>
            <FieldLabel htmlFor="country">{t("country")}</FieldLabel>
            <Input id="country" {...register("country")} />
            <FieldDescription>{t("country-description")}</FieldDescription>
            <FieldError errors={[errors.country]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="location">{t("location")}</FieldLabel>
            <Input id="location" {...register("location")} />
            <FieldDescription>{t("location-description")}</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="welcomeMessage">
              {t("welcome-message")}
            </FieldLabel>
            <Textarea id="welcomeMessage" {...register("welcomeMessage")} />
            <FieldDescription>
              {t("welcome-message-description")}
            </FieldDescription>
          </Field>

          <Field data-invalid={!!errors.organizationId}>
            <FieldLabel htmlFor="organizationId">{t("organization")}</FieldLabel>
            <Controller
              control={control}
              name="organizationId"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="organizationId">
                    <SelectValue placeholder={t("select-organization")} />
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
            <FieldDescription>{t("organization-description")}</FieldDescription>
            <FieldError errors={[errors.organizationId]} />
          </Field>

          <Button
            type="submit"
            variant="secondary"
            disabled={isPending}
            className="w-fit"
          >
            {isPending ? t("creating") : t("create-project")}
          </Button>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}

export default CreateProjectForm;
