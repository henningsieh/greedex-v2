"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
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
import {
  ACTIVITY_VALUES,
  DISTANCE_KM_STEP,
  MIN_DISTANCE_KM,
} from "@/config/activities";
import {
  DEFAULT_PROJECT_DURATION_DAYS,
  MILLISECONDS_PER_DAY,
} from "@/config/projects";
import {
  ActivityFormItemSchema,
  type CreateProjectWithActivities,
  CreateProjectWithActivitiesSchema,
} from "@/features/projects";
import { getProjectDetailPath } from "@/features/projects/utils";
import { useRouter } from "@/lib/i18n/routing";
import { orpc, orpcQuery } from "@/lib/orpc/orpc";

interface CreateProjectFormProps {
  activeOrganizationId: string;
}

/**
 * Render a two-step form for creating a project and optional activities.
 *
 * Step 1 collects project details (name, dates, country, location, welcome message).
 * Step 2 collects zero or more activities (type, distance, description, date).
 * Submitting creates the project and any provided activities, shows success or error toasts, navigates to the created project's detail page on success, and invalidates the projects list cache.
 *
 * @param activeOrganizationId - ID of the active organization used as the project's organizationId default
 * @returns The CreateProjectForm React element
 */
export function CreateProjectForm({
  activeOrganizationId,
}: CreateProjectFormProps) {
  const tActivities = useTranslations("project.activities");
  const t = useTranslations("organization.projects.form.new");
  const [currentStep, setCurrentStep] = useState<number>(
    PROJECT_FORM_STEPS.PROJECT_DETAILS,
  );
  const totalSteps = PROJECT_FORM_TOTAL_STEPS;

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
      startDate: new Date(),
      endDate: new Date(
        Date.now() + DEFAULT_PROJECT_DURATION_DAYS * MILLISECONDS_PER_DAY,
      ),
      country: undefined,
      location: undefined,
      welcomeMessage: undefined,
      organizationId: activeOrganizationId,
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

  /**
   * Validate required project fields for step 1 and advance the form to step 2 when validation succeeds.
   *
   * Triggers validation for "name", "startDate", "endDate", and "country". If all validations pass, updates the form state to move to step 2.
   */
  async function handleNextStep() {
    // Validate step 1 fields before proceeding
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
      activityType: "train",
      distanceKm: MIN_DISTANCE_KM,
      description: undefined,
      activityDate: undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldSet className="mx-auto max-w-3xl p-2 sm:p-6">
        <FieldContent>
          <FieldLegend>{t("legend")}</FieldLegend>
          <p className="text-right text-muted-foreground text-sm">
            Step {currentStep} of {totalSteps}
          </p>
        </FieldContent>

        {/* Step 1: Project Details */}
        {currentStep === PROJECT_FORM_STEPS.PROJECT_DETAILS && (
          <FieldGroup>
            <FormField
              control={control}
              description={t("name-description")}
              label={t("name")}
              name="name"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.startDate}>
                <FieldLabel htmlFor="startDate">{t("start-date")}</FieldLabel>
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
                <FieldDescription>
                  {t("start-date-description")}
                </FieldDescription>
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
                      onChange={field.onChange}
                      value={field.value}
                    />
                  )}
                />
                <FieldDescription>{t("end-date-description")}</FieldDescription>
                <FieldError errors={[errors.endDate]} />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.country}>
                <FieldLabel htmlFor="country">{t("country")}</FieldLabel>
                <Controller
                  control={control}
                  name="country"
                  render={({ field }) => (
                    <CountrySelect
                      euOnly={true}
                      onValueChange={field.onChange}
                      placeholder={t("country-placeholder")}
                      value={field.value}
                    />
                  )}
                />
                <FieldDescription>{t("country-description")}</FieldDescription>
                <FieldError errors={[errors.country]} />
              </Field>

              <FormField
                control={control}
                description={t("location-description")}
                label={t("location")}
                name="location"
              />
            </div>

            <Field>
              <FieldLabel htmlFor="welcomeMessage">
                {t("welcome-message")}
              </FieldLabel>
              <Textarea id="welcomeMessage" {...register("welcomeMessage")} />
              <FieldDescription>
                {t("welcome-message-description")}
              </FieldDescription>
            </Field>

            <Button
              className="w-fit"
              onClick={handleNextStep}
              type="button"
              variant="secondary"
            >
              {tActivities("title")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </FieldGroup>
        )}

        {/* Step 2: Activities (Optional) */}
        {currentStep === PROJECT_FORM_STEPS.PROJECT_ACTIVITIES && (
          <FieldGroup>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {tActivities("title")}
                </CardTitle>
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
                      className="relative rounded-lg border p-4"
                      key={field.id}
                    >
                      <Button
                        className="absolute top-2 right-2"
                        onClick={() => remove(index)}
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
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  if (raw === "") {
                                    field.onChange(undefined);
                                  } else {
                                    const num = Number.parseFloat(raw);
                                    if (Number.isFinite(num)) {
                                      field.onChange(num);
                                    } else {
                                      field.onChange(undefined);
                                    }
                                  }
                                }}
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
                  ))
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
                onClick={() =>
                  setCurrentStep(PROJECT_FORM_STEPS.PROJECT_DETAILS)
                }
                type="button"
                variant="outline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("back")}
              </Button>

              <Button
                className="w-fit"
                disabled={isCreatingProject}
                type="submit"
                variant="secondary"
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
