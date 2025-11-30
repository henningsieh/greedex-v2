"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { DatePickerWithInput } from "@/components/date-picker-with-input";
import {
  activityTypeValues,
  ProjectFormSchema,
  type ProjectType,
} from "@/components/features/projects/types";
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

// Activity schema for the form
const ActivityFormItemSchema = z.object({
  id: z.string().optional(), // For existing activities
  activityType: z.enum(activityTypeValues),
  distanceKm: z.string().min(1, "Distance is required"),
  description: z.string().nullable().optional(),
  activityDate: z.date().nullable().optional(),
  isNew: z.boolean().optional(), // Track if activity is new
  isDeleted: z.boolean().optional(), // Track if activity should be deleted
});

// Combined form schema with activities
const EditProjectWithActivitiesSchema = ProjectFormSchema.extend({
  activities: z.array(ActivityFormItemSchema).optional(),
});

type EditProjectWithActivitiesType = z.infer<
  typeof EditProjectWithActivitiesSchema
>;

function EditProjectForm({ project, onSuccess }: EditProjectFormProps) {
  const t = useTranslations("organization.projects.form");
  const tActivities = useTranslations("project.activities");
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  // Fetch existing activities
  const { data: existingActivities, isLoading: activitiesLoading } = useQuery(
    orpcQuery.projectActivity.list.queryOptions({
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
  } = useForm<EditProjectWithActivitiesType>({
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
  useState(() => {
    if (existingActivities && existingActivities.length > 0) {
      const formattedActivities = existingActivities.map((activity) => ({
        id: activity.id,
        activityType: activity.activityType,
        distanceKm: activity.distanceKm,
        description: activity.description,
        activityDate: activity.activityDate
          ? new Date(activity.activityDate)
          : null,
        isNew: false,
        isDeleted: false,
      }));
      setValue("activities", formattedActivities);
    }
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "activities",
  });

  const queryClient = useQueryClient();

  const { mutateAsync: updateProjectMutation, isPending: isUpdating } =
    useMutation({
      mutationFn: (data: EditProjectWithActivitiesType) =>
        orpc.project.update({
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
      activity: z.infer<typeof ActivityFormItemSchema>;
    }) =>
      orpc.projectActivity.create({
        projectId: params.projectId,
        activityType: params.activity.activityType,
        distanceKm: params.activity.distanceKm,
        description: params.activity.description ?? null,
        activityDate: params.activity.activityDate ?? null,
      }),
  });

  const { mutateAsync: updateActivityMutation } = useMutation({
    mutationFn: (params: {
      activityId: string;
      activity: z.infer<typeof ActivityFormItemSchema>;
    }) =>
      orpc.projectActivity.update({
        id: params.activityId,
        data: {
          activityType: params.activity.activityType,
          distanceKm: params.activity.distanceKm,
          description: params.activity.description ?? null,
          activityDate: params.activity.activityDate ?? null,
        },
      }),
  });

  const { mutateAsync: deleteActivityMutation } = useMutation({
    mutationFn: (activityId: string) =>
      orpc.projectActivity.delete({ id: activityId }),
  });

  async function handleNextStep() {
    const isStepValid = await trigger([
      "name",
      "startDate",
      "endDate",
      "country",
    ]);
    if (isStepValid) {
      setCurrentStep(2);
    }
  }

  async function onSubmit(values: EditProjectWithActivitiesType) {
    try {
      // Update the project
      const result = await updateProjectMutation(values);

      if (!result.success) {
        toast.error(t("edit.toast.error"));
        return;
      }

      // Handle activities
      if (values.activities) {
        for (const activity of values.activities) {
          try {
            if (activity.isDeleted && activity.id) {
              // Delete removed activities
              await deleteActivityMutation(activity.id);
            } else if (activity.isNew) {
              // Create new activities
              await createActivityMutation({
                projectId: project.id,
                activity,
              });
            } else if (activity.id) {
              // Update existing activities
              await updateActivityMutation({
                activityId: activity.id,
                activity,
              });
            }
          } catch (err) {
            console.error("Failed to process activity:", err);
          }
        }
      }

      toast.success(t("edit.toast.success") || "Project updated successfully");
      queryClient.invalidateQueries({
        queryKey: orpcQuery.project.list.queryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: orpcQuery.project.getById.queryOptions({
          input: { id: project.id },
        }).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: orpcQuery.projectActivity.list.queryKey({
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
      activityType: "car",
      distanceKm: "",
      description: null,
      activityDate: null,
      isNew: true,
      isDeleted: false,
    });
  };

  const markActivityDeleted = (index: number) => {
    const activity = fields[index];
    if (activity.id) {
      // Mark existing activity as deleted
      update(index, { ...activity, isDeleted: true });
    } else {
      // Remove new activity from form
      remove(index);
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
        {currentStep === 1 && (
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">{t("new.name")}</FieldLabel>
              <Input id="name" {...register("name")} />
              <FieldError errors={[errors.name]} />
            </Field>

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
              <Input id="country" {...register("country")} />
              <FieldError errors={[errors.country]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="location">{t("new.location")}</FieldLabel>
              <Input id="location" {...register("location")} />
            </Field>

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
        {currentStep === 2 && (
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
                                    {activityTypeValues.map((type) => (
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
                            <Input
                              id={`activities.${index}.distance`}
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder={tActivities(
                                "form.distance-placeholder",
                              )}
                              {...register(`activities.${index}.distanceKm`)}
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
                onClick={() => setCurrentStep(1)}
                className="w-fit"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
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

export default EditProjectForm;
