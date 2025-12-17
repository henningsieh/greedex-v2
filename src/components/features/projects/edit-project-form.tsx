"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { CountrySelect } from "@/components/country-select";
import { DatePickerWithInput } from "@/components/date-picker-with-input";
import {
  PROJECT_FORM_STEPS,
  PROJECT_FORM_TOTAL_STEPS,
} from "@/components/features/projects/form-constants";
import type { ProjectType } from "@/components/features/projects/types";
import {
  activityValues,
  DISTANCE_KM_STEP,
  MIN_DISTANCE_KM,
} from "@/components/features/projects/types";
import {
  EditActivityFormItemSchema,
  EditProjectWithActivitiesSchema,
} from "@/components/features/projects/validation-schemas";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { orpc, orpcQuery } from "@/lib/orpc/orpc";

interface EditProjectFormProps {
  project: ProjectType;
  onSuccess?: () => void;
}

/**
 * Render an editable two-step form for updating a project and its related activities.
 *
 * The form lets the user edit project details (step 1) and manage activity entries (step 2),
 * then persists changes to the server (update project; create, update, or delete activities).
 * On successful save, related queries are invalidated and `onSuccess` is invoked if provided.
 *
 * @param project - The project object to edit; used to populate initial form values.
 * @param onSuccess - Optional callback invoked after a successful update and activity processing.
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
  const { data: existingActivities, isLoading: activitiesLoading } = useQuery(
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
  React.useEffect(() => {
    if (existingActivities && existingActivities.length > 0) {
      const formattedActivities: z.infer<typeof EditActivityFormItemSchema>[] =
        existingActivities.map((activity) => ({
          id: activity.id,
          projectId: activity.projectId,
          activityType: activity.activityType,
          distanceKm: parseFloat(activity.distanceKm),
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

      // Handle activities
      if (values.activities) {
        const failedActivities: string[] = [];
        for (const activity of values.activities) {
          try {
            if (
              activity.isDeleted === true &&
              activity.isNew === false &&
              activity.id
            ) {
              await deleteActivityMutation(activity.id);
            } else if (activity.isNew === true && activity.isDeleted !== true) {
              await createActivityMutation({
                projectId: project.id,
                activity,
              });
            } else if (
              activity.isNew === false &&
              activity.isDeleted !== true &&
              activity.id
            ) {
              await updateActivityMutation({
                activityId: activity.id,
                activity,
              });
            }
          } catch (err) {
            console.error("Failed to process activity:", err);
            failedActivities.push(activity.activityType || "unknown");
          }
        }
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
      queryClient.invalidateQueries({
        queryKey: orpcQuery.projects.list.queryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: orpcQuery.projects.getById.queryOptions({
          input: { id: project.id },
        }).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: orpcQuery.projectActivities.list.queryKey({
          input: { projectId: project.id },
        }),
      });
      onSuccess?.();
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
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
        <p className="mb-4 text-muted-foreground text-sm">
          Step {currentStep} of {totalSteps}
        </p>

        {/* Step 1: Project Details */}
        {currentStep === PROJECT_FORM_STEPS.PROJECT_DETAILS && (
          <FieldGroup>
            <FormField control={control} name="name" label={t("new.name")} />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.startDate}>
                <FieldLabel htmlFor="startDate">{t("new.start-date")}</FieldLabel>
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
                <FieldLabel htmlFor="endDate">{t("new.end-date")}</FieldLabel>
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
              <FieldLabel htmlFor="country">{t("new.country")}</FieldLabel>
              <Controller
                control={control}
                name="country"
                render={({ field }) => (
                  <CountrySelect
                    value={field.value}
                    onValueChange={field.onChange}
                    euOnly={true}
                    placeholder={t("new.country-placeholder") || "Select country"}
                  />
                )}
              />
              <FieldError errors={[errors.country]} />
            </Field>

            <FormField
              control={control}
              name="location"
              label={t("new.location")}
            />

            <Field>
              <FieldLabel htmlFor="welcomeMessage">
                {t("new.welcome-message")}
              </FieldLabel>
              <Textarea id="welcomeMessage" {...register("welcomeMessage")} />
            </Field>

            <Button
              type="button"
              variant="secondary"
              onClick={handleNextStep}
              className="w-fit"
            >
              {tActivities("title")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </FieldGroup>
        )}

        {/* Step 2: Activities */}
        {currentStep === PROJECT_FORM_STEPS.PROJECT_ACTIVITIES && (
          <FieldGroup>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{tActivities("title")}</CardTitle>
                <p className="text-muted-foreground text-sm">
                  {tActivities("description")}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {activitiesLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : visibleActivities.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm">
                    {tActivities("empty.description")}
                  </p>
                ) : (
                  fields.map((field, index) => {
                    if (field.isDeleted) return null;
                    return (
                      <div
                        key={field.id}
                        className="relative rounded-lg border p-4"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => markActivityDeleted(index)}
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
                                    {activityValues.map((type) => (
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
                                  type="number"
                                  step={DISTANCE_KM_STEP}
                                  min={MIN_DISTANCE_KM}
                                  placeholder={tActivities(
                                    "form.distance-placeholder",
                                  )}
                                  value={field.value ?? ""}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) ||
                                        MIN_DISTANCE_KM,
                                    )
                                  }
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
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addActivity}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {tActivities("form.title")}
                </Button>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(PROJECT_FORM_STEPS.PROJECT_DETAILS)}
                className="w-fit"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("edit.back")}
              </Button>

              <Button type="submit" disabled={isUpdating} className="w-fit">
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
