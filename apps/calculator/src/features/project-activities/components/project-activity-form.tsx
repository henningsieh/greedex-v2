"use client";

import type z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import type { ProjectActivityType } from "@/features/project-activities/types";

import { DatePickerWithInput } from "@/components/date-picker-with-input";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ACTIVITY_VALUES,
  DISTANCE_KM_STEP,
  MIN_DISTANCE_KM,
} from "@/config/activities";
import {
  activityInputSchema,
  activityUpdateSchema,
} from "@/features/project-activities/validation-schemas";
import { orpc, orpcQuery } from "@/lib/orpc/orpc";

import { PROJECT_ACTIVITIES_ICONS } from "../activities-icons";

interface ProjectActivityFormProps {
  projectId: string;
  activity?: ProjectActivityType;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Render a form that creates a new project activity or edits an existing one.
 *
 * The form is prefilled when `activity` is provided, validates input against the activity schema,
 * and triggers create or update mutations with UI feedback and cache invalidation.
 *
 * @param projectId - ID of the project the activity belongs to
 * @param activity - Optional activity to prefill the form for editing; when present the form updates that activity
 * @param onSuccess - Optional callback invoked after a successful create or update
 * @param onCancel - Optional callback invoked when the cancel action is triggered
 * @returns The form element used to create or edit a project activity
 */
export function ProjectActivityForm({
  projectId,
  activity,
  onSuccess,
  onCancel,
}: ProjectActivityFormProps) {
  const t = useTranslations("project.activities");
  const queryClient = useQueryClient();
  const isEditing = !!activity;

  // Create schemas with i18n translations (works client-side and server-side)
  const CreateSchema = useMemo(() => activityInputSchema(t), [t]);
  const UpdateSchema = useMemo(() => activityUpdateSchema(t), [t]);

  // Use appropriate schema based on mode
  const ActivityInputSchema = isEditing ? UpdateSchema : CreateSchema;

  type CreateFormValues = z.infer<typeof CreateSchema>;
  type UpdateFormValues = z.infer<typeof UpdateSchema>;
  type FormValues = CreateFormValues | UpdateFormValues;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(ActivityInputSchema),
    mode: "onChange",
    defaultValues: isEditing
      ? {
          // Update mode: no projectId
          activityType: activity.activityType,
          distanceKm: activity.distanceKm,
          description: activity.description ?? null,
          activityDate: activity.activityDate ?? null,
        }
      : {
          // Create mode: includes projectId
          projectId,
          activityType: undefined,
          distanceKm: MIN_DISTANCE_KM,
          description: null,
          activityDate: null,
        },
  });

  const createMutation = useMutation({
    mutationFn: (values: CreateFormValues) =>
      orpc.projectActivities.create(values),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(t("toast.create-success"));
        reset();
        queryClient.invalidateQueries({
          queryKey: orpcQuery.projectActivities.list.queryKey({
            input: { projectId },
          }),
        });
        onSuccess?.();
      } else {
        toast.error(t("toast.create-error"));
      }
    },
    onError: (err: unknown) => {
      console.error(err);
      toast.error(t("toast.create-error"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: UpdateFormValues) => {
      if (!activity?.id) {
        throw new Error("Activity ID is required for update");
      }
      return orpc.projectActivities.update({
        id: activity.id,
        data: values,
      });
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(t("toast.update-success"));
        queryClient.invalidateQueries({
          queryKey: orpcQuery.projectActivities.list.queryKey({
            input: { projectId },
          }),
        });
        onSuccess?.();
      } else {
        toast.error(t("toast.update-error"));
      }
    },
    onError: (err: unknown) => {
      console.error(err);
      toast.error(t("toast.update-error"));
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  /**
   * Submit validated activity input to create a new project activity or update an existing one.
   *
   * @param values - Activity input validated against appropriate schema (create or update)
   */
  async function onSubmit(values: FormValues) {
    if (isEditing) {
      // values is already validated against UpdateSchema (no projectId)
      await updateMutation.mutateAsync(values as UpdateFormValues);
    } else {
      // values is validated against CreateSchema (includes projectId)
      await createMutation.mutateAsync(values as CreateFormValues);
    }
  }

  const buttonText = (() => {
    if (isPending) {
      return isEditing ? t("form.updating") : t("form.adding");
    }

    return isEditing ? t("form.update") : t("form.submit");
  })();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Hidden projectId field for create mode */}
      {!isEditing && <input type="hidden" {...register("projectId")} />}

      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={!!errors.activityType}>
            <FieldLabel htmlFor="activityType">
              {t("form.activity-type")}
            </FieldLabel>
            <Controller
              control={control}
              name="activityType"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="activityType">
                    <SelectValue
                      placeholder={t("form.activity-type-placeholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_VALUES.map((type) => {
                      const Icon = PROJECT_ACTIVITIES_ICONS[type];
                      return (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center gap-2">
                            <Icon className="size-4" />
                            {t(`types.${type}`)}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.activityType]} />
          </Field>

          <Field data-invalid={!!errors.distanceKm}>
            <FieldLabel htmlFor="distanceKm">{t("form.distance")}</FieldLabel>
            <Controller
              control={control}
              name="distanceKm"
              render={({ field }) => (
                <Input
                  id="distanceKm"
                  min={MIN_DISTANCE_KM}
                  onChange={(e) =>
                    field.onChange(
                      Number.parseFloat(e.target.value) || MIN_DISTANCE_KM,
                    )
                  }
                  placeholder={t("form.distance-placeholder")}
                  step={DISTANCE_KM_STEP}
                  type="number"
                  value={field.value ?? ""}
                />
              )}
            />
            <FieldError errors={[errors.distanceKm]} />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="description">{t("form.description")}</FieldLabel>
          <Textarea
            id="description"
            placeholder={t("form.description-placeholder")}
            {...register("description")}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="activityDate">
            {t("form.activity-date")}
          </FieldLabel>
          <Controller
            control={control}
            name="activityDate"
            render={({ field }) => (
              <DatePickerWithInput
                id="activityDate"
                onChange={field.onChange}
                value={field.value ?? undefined}
              />
            )}
          />
        </Field>

        <div className="flex gap-2">
          {onCancel && (
            <Button
              className="flex-1"
              disabled={isPending}
              onClick={onCancel}
              size="sm"
              type="button"
              variant="secondaryoutline"
            >
              {t("form.cancel")}
            </Button>
          )}
          <Button
            className="flex-1"
            disabled={isPending}
            size="sm"
            type="submit"
            variant="secondary"
          >
            {buttonText}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
