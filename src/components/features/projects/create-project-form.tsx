"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { DatePickerWithInput } from "@/components/date-picker-with-input";
import type { Organization } from "@/components/features/organizations/types";
import {
  activityTypeValues,
  DISTANCE_KM_STEP,
  MIN_DISTANCE_KM,
} from "@/components/features/projects/types";
import {
  ActivityFormItemSchema,
  type CreateProjectWithActivities,
  CreateProjectWithActivitiesSchema,
} from "@/components/features/projects/validation-schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useRouter } from "@/lib/i18n/navigation";
import { orpc, orpcQuery } from "@/lib/orpc/orpc";
import { getProjectDetailPath } from "@/lib/utils/project-utils";

interface CreateProjectFormProps {
  userOrganizations: Omit<Organization, "metadata">[];
}

/**
 * Render a two-step form to create a project and optional activities.
 *
 * The first step collects project details (name, dates, country, location,
 * welcome message, and organization). The second step allows adding zero or
 * more activities (type, distance, description, date). Submitting the form
 * creates the project and any provided activities, shows success or error
 * toasts, navigates to the created project's detail page on success, and
 * invalidates the projects list cache.
 *
 * @param userOrganizations - Organizations available for the project's organization selector
 * @returns The CreateProjectForm React element
 */
export function CreateProjectForm({ userOrganizations }: CreateProjectFormProps) {
  const tActivities = useTranslations("project.activities");
  const t = useTranslations("organization.projects.form.new");
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<CreateProjectWithActivities>({
    resolver: zodResolver(CreateProjectWithActivitiesSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      startDate: undefined,
      endDate: undefined,
      location: null,
      country: "",
      welcomeMessage: null,
      organizationId: "",
      activities: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "activities",
  });

  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutateAsync: createProjectMutation, isPending: isCreatingProject } =
    useMutation({
      mutationFn: (values: CreateProjectWithActivities) =>
        orpc.projects.create({
          name: values.name,
          startDate: values.startDate,
          endDate: values.endDate,
          location: values.location,
          country: values.country,
          welcomeMessage: values.welcomeMessage,
          organizationId: values.organizationId,
        }),
      onError: (err: unknown) => {
        console.error(err);
        const message = err instanceof Error ? err.message : String(err);
        toast.error(message || t("toast.error-generic"));
      },
    });

  const { mutateAsync: createActivityMutation } = useMutation({
    mutationFn: (params: {
      projectId: string;
      activity: z.infer<typeof ActivityFormItemSchema>;
    }) => {
      const validActivity = ActivityFormItemSchema.parse(params.activity);

      return orpc.projectActivities.create({
        projectId: params.projectId,
        activityType: validActivity.activityType,
        distanceKm: validActivity.distanceKm,
        description: validActivity.description,
        activityDate: validActivity.activityDate,
      });
    },
  });

  async function handleNextStep() {
    // Validate step 1 fields before proceeding
    const isStepValid = await trigger([
      "name",
      "startDate",
      "endDate",
      "country",
      "organizationId",
    ]);
    if (isStepValid) {
      setCurrentStep(2);
    }
  }

  async function onSubmit(values: CreateProjectWithActivities) {
    try {
      // Create the project first
      const result = await createProjectMutation(values);

      if (!result.success) {
        toast.error(t("toast.error"));
        return;
      }

      // If there are activities, create them
      if (values.activities && values.activities.length > 0) {
        const failedActivities: string[] = [];
        for (const activity of values.activities) {
          try {
            await createActivityMutation({
              projectId: result.project.id,
              activity,
            });
          } catch (err) {
            console.error("Failed to create activity:", err);
            failedActivities.push(activity.activityType);
          }
        }
        if (failedActivities.length > 0) {
          toast.error(
            t("toast.failed-activities", {
              count: failedActivities.length,
              activities: failedActivities.join(", "),
            }),
          );
        }
      }

      toast.success(t("toast.success"));
      router.push(getProjectDetailPath(result.project.id));
      queryClient.invalidateQueries({
        queryKey: orpcQuery.projects.list.queryKey(),
      });
    } catch (err) {
      console.error(err);
      toast.error(t("toast.error-generic"));
    }
  }

  const addActivity = () => {
    append({
      activityType: "car",
      distanceKm: MIN_DISTANCE_KM,
      description: null,
      activityDate: null,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldSet className="mx-auto max-w-3xl p-2 sm:p-6">
        <FieldContent>
          <FieldLegend>{t("legend")}</FieldLegend>
          <p className="text-muted-foreground text-sm">
            Step {currentStep} of {totalSteps}
          </p>
        </FieldContent>

        {/* Step 1: Project Details */}
        {currentStep === 1 && (
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
              <FieldLabel htmlFor="organizationId">
                {t("organization")}
              </FieldLabel>
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

        {/* Step 2: Activities (Optional) */}
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
                {fields.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm">
                    {tActivities("empty.description")}
                  </p>
                ) : (
                  fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="relative rounded-lg border p-4"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => remove(index)}
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
                          data-invalid={!!errors.activities?.[index]?.distanceKm}
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
                                value={field.value || ""}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || MIN_DISTANCE_KM,
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
                  ))
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
                {t("back")}
              </Button>

              <Button
                type="submit"
                variant="secondary"
                disabled={isCreatingProject}
                className="w-fit"
              >
                {isCreatingProject ? (
                  t("creating")
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    {t("create-project")}
                  </>
                )}
              </Button>
            </div>
          </FieldGroup>
        )}
      </FieldSet>
    </form>
  );
}
