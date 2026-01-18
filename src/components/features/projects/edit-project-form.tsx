"use client";

import { CountrySelect } from "@/components/country-select";
import { DatePickerWithInput } from "@/components/date-picker-with-input";
import {
  PROJECT_FORM_STEPS,
  PROJECT_FORM_TOTAL_STEPS,
} from "@/components/features/projects/form-constants";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  ACTIVITY_VALUES,
  DISTANCE_KM_STEP,
  MIN_DISTANCE_KM,
} from "@/config/activities";
import { EditActivityFormItemSchema } from "@/features/project-activities/validation-schemas";
import type { ProjectType } from "@/features/projects/types";
import { EditProjectWithActivitiesSchema } from "@/features/projects/validation-schemas";
import { orpc, orpcQuery } from "@/lib/orpc/orpc";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

interface EditProjectFormProps {
  project: ProjectType;
  onSuccess?: () => void;
}

/**
 * Render a two-step form that edits a project's details and manages its activities, then persists changes.
 *
 * @param project - Project used to populate initial form values.
 * @param onSuccess - Optional callback invoked after a successful project update and activity processing.
 * @returns The rendered edit project form UI.
 */
export function EditProjectForm({ project, onSuccess }: EditProjectFormProps) {
  const tActivities = useTranslations("project.activities");
  const t = useTranslations("organization.projects.form");
  const [currentStep, setCurrentStep] = useState<number>(
    PROJECT_FORM_STEPS.PROJECT_DETAILS,
  );
  const totalSteps = PROJECT_FORM_TOTAL_STEPS;

  // Fetch existing activities
  const { data: existingActivities } = useSuspenseQuery(
    orpcQuery.projectActivities.list.queryOptions({
      input: { projectId: project.id },
    }),
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    trigger,
    setValue,
    getValues,
  } = useForm<z.infer<typeof EditProjectWithActivitiesSchema>>({
    resolver: zodResolver(EditProjectWithActivitiesSchema),
    mode: "onChange",
    defaultValues: {
      name: project.name,
      startDate: project.startDate,
      endDate: project.endDate,
      location: project.location,
      country: project.country,
      welcomeMessage: project.welcomeMessage,
      organizationId: project.organizationId,
      activities: [],
    },
  });

  // Load existing activities into the form when they're fetched
  useEffect(() => {
    if (existingActivities && existingActivities.length > 0) {
      const formattedActivities: z.infer<typeof EditActivityFormItemSchema>[] =
        existingActivities.map((activity) => ({
          id: activity.id,
          projectId: activity.projectId,
          activityType: activity.activityType,
          distanceKm: Number.parseFloat(activity.distanceKm),
          description: activity.description,
          activityDate: activity.activityDate
            ? new Date(activity.activityDate)
            : null,
          isNew: false,
          isDeleted: false,
        }));
      setValue("activities", formattedActivities);
    }
  }, [existingActivities, setValue]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "activities",
  });

  const queryClient = useQueryClient();

  const { mutateAsync: updateProjectMutation, isPending: isUpdating } =
    useMutation({
      mutationFn: (data: z.infer<typeof EditProjectWithActivitiesSchema>) =>
        orpc.projects.update({
          id: project.id,
          data: {
            name: data.name,
            startDate: data.startDate,
            endDate: data.endDate,
            location: data.location,
            country: data.country,
            welcomeMessage: data.welcomeMessage,
            organizationId: data.organizationId,
          },
        }),
      onError: (err: unknown) => {
        console.error(err);
        const message = err instanceof Error ? err.message : String(err);
        toast.error(message || "An error occurred");
      },
    });

  const { mutateAsync: createActivityMutation } = useMutation({
    mutationFn: (params: {
      projectId: string;
      activity: z.infer<typeof EditActivityFormItemSchema>;
    }) => {
      const validActivity = EditActivityFormItemSchema.parse(params.activity);

      if (!validActivity.activityType) {
        throw new Error("Activity type is required");
      }

      return orpc.projectActivities.create({
        projectId: params.projectId,
        activityType: validActivity.activityType,
        distanceKm: validActivity.distanceKm,
        description: validActivity.description,
        activityDate: validActivity.activityDate,
      });
    },
  });

  const { mutateAsync: updateActivityMutation } = useMutation({
    mutationFn: (params: {
      activityId: string;
      activity: z.infer<typeof EditActivityFormItemSchema>;
    }) => {
      const validActivity = EditActivityFormItemSchema.parse(params.activity);

      if (!validActivity.activityType) {
        throw new Error("Activity type is required");
      }

      return orpc.projectActivities.update({
        id: params.activityId,
        data: {
          activityType: validActivity.activityType,
          distanceKm: validActivity.distanceKm,
          description: validActivity.description,
          activityDate: validActivity.activityDate,
        },
      });
    },
  });

  const { mutateAsync: deleteActivityMutation } = useMutation({
    mutationFn: (activityId: string) =>
      orpc.projectActivities.delete({ id: activityId }),
  });

  async function handleNextStep() {
    const isStepValid = await trigger([
      "name",
      "startDate",
      "endDate",
      "country",
    ]);
    if (isStepValid) {
      setCurrentStep(PROJECT_FORM_STEPS.PROJECT_ACTIVITIES);
    }
  }

  /**
   * Submits the edited project and its activities to the server, notifies the user of the outcome, and refreshes related queries.
   *
   * Processes the main project update first, then creates, updates, or deletes activities from the provided `values.activities` array. Shows success or error toasts based on results, invalidates cached project queries for the given project, and invokes the optional `onSuccess` callback when complete.
   *
   * @param values - Form values validated against `EditProjectWithActivitiesSchema`, including project fields and an `activities` array describing new, updated, or deleted activities
   */
  async function onSubmit(
    values: z.infer<typeof EditProjectWithActivitiesSchema>,
  ) {
    try {
      // Update the project
      const result = await updateProjectMutation(values);

      if (!result.success) {
        toast.error(t("edit.toast.error"));
        return;
      }

      // Process activities in a helper to keep this function simple
      if (values.activities && values.activities.length > 0) {
        const failedActivities = await processActivities(values.activities);

        if (failedActivities.length > 0) {
          toast.error(
            t("edit.toast.failed-activities", {
              count: failedActivities.length,
              activities: failedActivities.join(", "),
            }),
          );
        }
      }

      toast.success(t("edit.toast.success") || "Project updated successfully");
      invalidateProjectQueries(project.id);
      onSuccess?.();
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  }

  /**
   * Processes a list of activity form items, performing the appropriate create/update/delete action for each.
   *
   * @param activities - Array of activity form items to process; each item may represent a new, existing, or deleted activity.
   * @returns An array of activity type identifiers for activities that failed to process (uses `"unknown"` when the activity type is not available).
   */
  async function processActivities(
    activities: z.infer<typeof EditActivityFormItemSchema>[],
  ) {
    const failedActivities: string[] = [];

    for (const activity of activities) {
      try {
        await handleSingleActivity(activity);
      } catch (err) {
        console.error("Failed to process activity:", err);
        failedActivities.push(activity.activityType || "unknown");
      }
    }

    return failedActivities;
  }

  /**
   * Apply the appropriate create, update, or delete operation for a single activity based on its form flags.
   *
   * @param activity - An activity form item (matches `EditActivityFormItemSchema`). If `isDeleted` is true for an existing activity, it will be deleted; if `isNew` is true and not deleted, it will be created; if not new and not deleted, it will be updated. Other flag combinations are treated as no-ops.
   */
  async function handleSingleActivity(
    activity: z.infer<typeof EditActivityFormItemSchema>,
  ) {
    // Deleted existing activity
    if (activity.isDeleted === true && activity.isNew === false && activity.id) {
      await deleteActivityMutation(activity.id);
      return;
    }

    // New activity to create
    if (activity.isNew === true && activity.isDeleted !== true) {
      await createActivityMutation({ projectId: project.id, activity });
      return;
    }

    // Existing activity to update
    if (activity.isNew === false && activity.isDeleted !== true && activity.id) {
      await updateActivityMutation({ activityId: activity.id, activity });
      return;
    }

    // Nothing to do for other combinations (e.g., marked deleted while new)
  }

  /**
   * Invalidates cached queries related to a project so they will be refetched.
   *
   * @param projectId - The ID of the project whose list, details, and activities caches should be invalidated
   */
  function invalidateProjectQueries(projectId: string) {
    queryClient.invalidateQueries({
      queryKey: orpcQuery.projects.list.queryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: orpcQuery.projects.getById.queryOptions({
        input: { id: projectId },
      }).queryKey,
    });
    queryClient.invalidateQueries({
      queryKey: orpcQuery.projectActivities.list.queryKey({
        input: { projectId },
      }),
    });
  }

  const addActivity = () => {
    append({
      id: "",
      projectId: project.id,
      activityType: "car",
      distanceKm: MIN_DISTANCE_KM,
      description: null,
      activityDate: null,
      isNew: true,
      isDeleted: false,
    });
  };

  const markActivityDeleted = (index: number) => {
    const activities = getValues("activities") || [];
    const activity = activities[index]; // Now this is your actual activity data

    if (activity.isNew) {
      remove(index);
    } else {
      // Update the form values, not the fields metadata
      const updatedActivities = [...activities];
      updatedActivities[index] = { ...activity, isDeleted: true };
      setValue("activities", updatedActivities);
    }
  };

  // Filter out deleted activities for display
  const visibleActivities = fields.filter((field) => !field.isDeleted);

  return (
    <div>
      <Toaster />

      <form
        onSubmit={handleSubmit(onSubmit, (formErrors) => {
          console.error("Form validation errors:", formErrors);
          toast.error("Please fix the form errors before submitting");
        })}
      >
        {/* Step indicator */}
        <p className="mb-4 text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </p>

        {/* Step 1: Project Details */}
        {currentStep === PROJECT_FORM_STEPS.PROJECT_DETAILS && (
          <FieldGroup>
            <FormField control={control} label={t("new.name")} name="name" />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.startDate}>
                <FieldLabel htmlFor="startDate">{t("new.start-date")}</FieldLabel>
                <Controller
                  control={control}
                  name="startDate"
                  render={({ field }) => (
                    <DatePickerWithInput
                      id="startDate"
                      onChange={field.onChange}
                      value={field.value}
                    />
                  )}
                />
                <FieldError errors={[errors.startDate]} />
              </Field>

              <Field data-invalid={!!errors.endDate}>
                <FieldLabel htmlFor="endDate">{t("new.end-date")}</FieldLabel>
                <Controller
                  control={control}
                  name="endDate"
                  render={({ field }) => (
                    <DatePickerWithInput
                      id="endDate"
                      onChange={field.onChange}
                      value={field.value}
                    />
                  )}
                />
                <FieldError errors={[errors.endDate]} />
              </Field>
            </div>

            <Field data-invalid={!!errors.country}>
              <FieldLabel htmlFor="country">{t("new.country")}</FieldLabel>
              <Controller
                control={control}
                name="country"
                render={({ field }) => (
                  <CountrySelect
                    euOnly={true}
                    onValueChange={field.onChange}
                    placeholder={t("new.country-placeholder") || "Select country"}
                    value={field.value}
                  />
                )}
              />
              <FieldError errors={[errors.country]} />
            </Field>

            <FormField
              control={control}
              label={t("new.location")}
              name="location"
            />

            <Field>
              <FieldLabel htmlFor="welcomeMessage">
                {t("new.welcome-message")}
              </FieldLabel>
              <Textarea id="welcomeMessage" {...register("welcomeMessage")} />
            </Field>

            <div className="flex gap-2">
              <Button
                className="w-1/2"
                onClick={() => onSuccess?.()}
                type="button"
                variant="secondaryoutline"
              >
                Cancel
              </Button>
              <Button
                className="w-1/2"
                onClick={handleNextStep}
                type="button"
                variant="secondary"
              >
                {tActivities("title")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </FieldGroup>
        )}

        {/* Step 2: Activities */}
        {currentStep === PROJECT_FORM_STEPS.PROJECT_ACTIVITIES && (
          <FieldGroup>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{tActivities("title")}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {tActivities("description")}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {visibleActivities.length === 0 ? (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Plus className="size-9 text-muted-foreground" />
                      </EmptyMedia>
                      <EmptyTitle>{tActivities("empty.title")}</EmptyTitle>
                      <EmptyDescription>
                        {tActivities("empty.description")}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  fields.map((field, index) => {
                    if (field.isDeleted) {
                      return null;
                    }
                    return (
                      <div
                        className="relative rounded-lg border p-4"
                        key={field.id}
                      >
                        <Button
                          className="absolute top-2 right-2"
                          onClick={() => markActivityDeleted(index)}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>

                        <div className="grid gap-4 pr-8 sm:grid-cols-2">
                          <Field
                            data-invalid={
                              !!errors.activities?.[index]?.activityType
                            }
                          >
                            <FieldLabel htmlFor={`activities.${index}.type`}>
                              {tActivities("form.activity-type")}
                            </FieldLabel>
                            <Controller
                              control={control}
                              name={`activities.${index}.activityType`}
                              render={({ field: selectField }) => (
                                <Select
                                  onValueChange={selectField.onChange}
                                  value={selectField.value}
                                >
                                  <SelectTrigger id={`activities.${index}.type`}>
                                    <SelectValue
                                      placeholder={tActivities(
                                        "form.activity-type-placeholder",
                                      )}
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ACTIVITY_VALUES.map((type) => (
                                      <SelectItem key={type} value={type}>
                                        {tActivities(`types.${type}`)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </Field>

                          <Field
                            data-invalid={
                              !!errors.activities?.[index]?.distanceKm
                            }
                          >
                            <FieldLabel htmlFor={`activities.${index}.distance`}>
                              {tActivities("form.distance")}
                            </FieldLabel>
                            <Controller
                              control={control}
                              name={`activities.${index}.distanceKm`}
                              render={({ field }) => (
                                <Input
                                  id={`activities.${index}.distance`}
                                  min={MIN_DISTANCE_KM}
                                  onChange={(e) =>
                                    field.onChange(
                                      Number.parseFloat(e.target.value) ||
                                        MIN_DISTANCE_KM,
                                    )
                                  }
                                  placeholder={tActivities(
                                    "form.distance-placeholder",
                                  )}
                                  step={DISTANCE_KM_STEP}
                                  type="number"
                                  value={field.value ?? ""}
                                />
                              )}
                            />
                          </Field>
                        </div>

                        <Field className="mt-4">
                          <FieldLabel htmlFor={`activities.${index}.description`}>
                            {tActivities("form.description")}
                          </FieldLabel>
                          <Textarea
                            id={`activities.${index}.description`}
                            placeholder={tActivities(
                              "form.description-placeholder",
                            )}
                            {...register(`activities.${index}.description`)}
                          />
                        </Field>
                      </div>
                    );
                  })
                )}

                <Button
                  className="w-full"
                  onClick={addActivity}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {tActivities("form.title")}
                </Button>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button
                className="w-fit"
                onClick={() => setCurrentStep(PROJECT_FORM_STEPS.PROJECT_DETAILS)}
                type="button"
                variant="outline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("edit.back")}
              </Button>

              <Button className="w-fit" disabled={isUpdating} type="submit">
                {isUpdating ? (
                  tActivities("form.updating")
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    {t("edit.update") || "Update Project"}
                  </>
                )}
              </Button>
            </div>
          </FieldGroup>
        )}
      </form>
    </div>
  );
}

/**
 * Skeleton component for EditProjectForm loading state
 */
export function EditProjectFormSkeleton() {
  return (
    <div className="space-y-6">
      {/* Step indicator skeleton */}
      <Skeleton className="h-4 w-24" />

      {/* Form fields skeleton */}
      <div className="space-y-4">
        {/* Name field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Date fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Country field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Location field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Welcome message field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-20 w-full" />
        </div>

        {/* Button */}
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
