"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Factory,
  TreePine,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { AnimatedGroup } from "@/components/animated-group";
import { CountrySelect } from "@/components/country-select";
import { ImpactModal } from "@/components/participate/impact-modal";
import {
  EMISSION_IMPACT_STEPS,
  QUESTIONNAIRE_STEPS,
  QUESTIONNAIRE_TOTAL_STEPS,
} from "@/components/participate/questionnaire-constants";
import {
  ACCOMMODATION_OPTIONS,
  CAR_TYPE_OPTIONS,
  calculateEmissions,
  ELECTRICITY_OPTIONS,
  FOOD_OPTIONS,
  GENDER_OPTIONS,
  type ParticipantAnswers,
  type Project,
  ROOM_OCCUPANCY_OPTIONS,
} from "@/components/participate/questionnaire-types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  areAllNonEmpty,
  isNonNegativeNumber,
  isNumberAtLeast,
  isPositiveNumber,
  isTruthy,
} from "@/lib/utils/form-validation-utils";
import { calculateProjectDuration } from "@/lib/utils/project-utils";

interface QuestionnaireFormProps {
  project: Project;
}

export function QuestionnaireForm({ project }: QuestionnaireFormProps) {
  const t = useTranslations("participation.questionnaire");

  const getDefaultAnswers = (
    project: Project,
  ): Partial<ParticipantAnswers> => ({
    firstName: "",
    country: "",
    email: "",
    days: calculateProjectDuration(project.startDate, project.endDate),
    flightKm: 0,
    boatKm: 0,
    trainKm: 0,
    busKm: 0,
    carKm: 0,
    carPassengers: 1,
    age: 0,
  });

  const [answers, setAnswers] = useState<Partial<ParticipantAnswers>>(() => {
    if (typeof window === "undefined") {
      // Server-side rendering, return default values
      return getDefaultAnswers(project);
    }

    const key = `questionnaire-${project.id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const savedAnswers = parsed.answers || {};
        // Only set default days if not already saved
        if (!savedAnswers.days) {
          savedAnswers.days = getDefaultAnswers(project).days;
        }
        return savedAnswers;
      } catch (error) {
        console.warn(
          `Invalid JSON in localStorage for key ${key}, falling back to defaults`,
          error,
        );
        localStorage.removeItem(key);
        const savedAnswers: Partial<ParticipantAnswers> = {};
        savedAnswers.days = getDefaultAnswers(project).days;
        return savedAnswers;
      }
    }
    return getDefaultAnswers(project);
  });

  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (typeof window === "undefined") {
      return 0;
    }

    const key = `questionnaire-${project.id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored).currentStep || 0;
      } catch (error) {
        console.warn(
          `Invalid JSON in localStorage for key ${key}, falling back to step 0`,
          error,
        );
        localStorage.removeItem(key);
        return 0;
      }
    }
    return 0;
  });

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const key = `questionnaire-${project.id}`;
    try {
      localStorage.setItem(key, JSON.stringify({ answers, currentStep }));
    } catch (error) {
      console.error(
        `Failed to save questionnaire data to localStorage for key ${key}:`,
        error,
      );
      // Optionally clear the key if it exists to free up space
      try {
        localStorage.removeItem(key);
      } catch (removeError) {
        console.error(`Failed to remove localStorage key ${key}:`, removeError);
      }
    }
  }, [answers, currentStep, project.id]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Impact modal state
  const [showImpactModal, setShowImpactModal] = useState(false);
  const [impactData, setImpactData] = useState<{
    previousCO2: number;
    newCO2: number;
    impact: number;
    stepKey: string;
    stepValue: string | number;
  } | null>(null);

  // Confirmed emissions for display, updated only after impact modals
  const [confirmedEmissions, setConfirmedEmissions] = useState<{
    totalCO2: number;
    treesNeeded: number;
  } | null>(null);

  const totalSteps = QUESTIONNAIRE_TOTAL_STEPS;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const updateAnswer = <K extends keyof ParticipantAnswers>(
    key: K,
    value: ParticipantAnswers[K],
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Get current step key based on step number
  const getStepKey = (step: number): string | null => {
    const keys = [
      null, // 0: welcome
      null, // 1: participant info (firstName, country, email)
      "days",
      "accommodationCategory",
      "roomOccupancy",
      "electricity",
      "food",
      "flightKm",
      "boatKm",
      "trainKm",
      "busKm",
      "carKm",
      "carType",
      "carPassengers",
      "age",
      "gender",
    ];
    return keys[step] || null;
  };

  const proceedToNextStep = () => {
    // Skip car questions if no car travel
    if (
      currentStep === QUESTIONNAIRE_STEPS.CAR_KM &&
      (!answers.carKm || answers.carKm === 0)
    ) {
      setCurrentStep(QUESTIONNAIRE_STEPS.AGE); // Skip to age
      return;
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const shouldShowImpact = (stepKey: string | null): boolean => {
    if (!stepKey) {
      return false;
    }

    // Skip impact for zero-value transport questions
    if (["flightKm", "boatKm", "trainKm", "busKm"].includes(stepKey)) {
      const value = answers[stepKey as keyof ParticipantAnswers];
      if (Number(value) === 0) {
        return false;
      }
    }

    // Skip carPassengers impact if no car travel
    if (
      stepKey === "carPassengers" &&
      (!answers.carKm || answers.carKm === 0)
    ) {
      return false;
    }

    // Type-safe check for emission impact steps
    return (EMISSION_IMPACT_STEPS as readonly string[]).includes(stepKey);
  };

  const handleNext = () => {
    const stepKey = getStepKey(currentStep);

    if (stepKey && shouldShowImpact(stepKey)) {
      // Calculate previous CO₂ WITHOUT the current answer(s)
      const answersWithoutCurrent = {
        ...answers,
      };
      if (stepKey === "electricity") {
        // For accommodation, calculate impact as total accommodation CO₂
        // by removing all accommodation-related answers
        answersWithoutCurrent.accommodationCategory = undefined;
        answersWithoutCurrent.roomOccupancy = undefined;
        answersWithoutCurrent.electricity = undefined;
      } else {
        delete answersWithoutCurrent[stepKey as keyof ParticipantAnswers];
      }
      const previousCO2 = calculateEmissions(
        answersWithoutCurrent,
        project.activities,
      ).totalCO2;

      // Calculate new CO₂ WITH the current answer
      const currentValue = answers[stepKey as keyof ParticipantAnswers];
      const newCO2 = calculateEmissions(answers, project.activities).totalCO2;
      const impact = newCO2 - previousCO2;

      setImpactData({
        previousCO2,
        newCO2,
        impact,
        stepKey,
        stepValue: currentValue as string | number,
      });
      setShowImpactModal(true);
    } else {
      proceedToNextStep();
    }
  };

  const handleImpactModalClose = () => {
    const fullEmissions = calculateEmissions(answers, project.activities);
    setConfirmedEmissions({
      totalCO2: fullEmissions.totalCO2,
      treesNeeded: fullEmissions.treesNeeded,
    });
    setShowImpactModal(false);
    proceedToNextStep();
  };

  const handleBack = () => {
    // Handle back navigation with conditional steps
    if (
      currentStep === QUESTIONNAIRE_STEPS.AGE &&
      (!answers.carKm || answers.carKm === 0)
    ) {
      // Jump back to carKm step if we skipped car questions
      setCurrentStep(QUESTIONNAIRE_STEPS.CAR_KM);
      return;
    }

    if (currentStep > QUESTIONNAIRE_STEPS.WELCOME) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const emissions = calculateEmissions(answers, project.activities);

    // Complete data structure as requested
    const completeData = {
      answers, // Discrete answers object
      emissions, // Calculated results (includes project activities in totals)
      summary: {
        totalCO2: emissions.totalCO2,
        treesNeeded: emissions.treesNeeded,
        breakdown: {
          transport: emissions.transportCO2,
          accommodation: emissions.accommodationCO2,
          food: emissions.foodCO2,
          projectActivities: emissions.projectActivitiesCO2,
        },
      },
    };

    console.log("=== Participant Questionnaire Complete ===");
    console.log("Discrete Answers:", answers);
    console.log("Emissions Calculation:", emissions);
    console.log("Complete Data:", completeData);
    console.log("==========================================");

    // Clear persisted data after submission
    localStorage.removeItem(`questionnaire-${project.id}`);
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case QUESTIONNAIRE_STEPS.WELCOME:
        return true;
      case QUESTIONNAIRE_STEPS.PARTICIPANT_INFO:
        return areAllNonEmpty(
          answers.firstName,
          answers.country,
          answers.email,
        );
      case QUESTIONNAIRE_STEPS.DAYS:
        return isPositiveNumber(answers.days);
      case QUESTIONNAIRE_STEPS.ACCOMMODATION_CATEGORY:
        return isTruthy(answers.accommodationCategory);
      case QUESTIONNAIRE_STEPS.ROOM_OCCUPANCY:
        return isTruthy(answers.roomOccupancy);
      case QUESTIONNAIRE_STEPS.ELECTRICITY:
        return isTruthy(answers.electricity);
      case QUESTIONNAIRE_STEPS.FOOD:
        return isTruthy(answers.food);
      case QUESTIONNAIRE_STEPS.FLIGHT_KM:
        return isNonNegativeNumber(answers.flightKm);
      case QUESTIONNAIRE_STEPS.BOAT_KM:
        return isNonNegativeNumber(answers.boatKm);
      case QUESTIONNAIRE_STEPS.TRAIN_KM:
        return isNonNegativeNumber(answers.trainKm);
      case QUESTIONNAIRE_STEPS.BUS_KM:
        return isNonNegativeNumber(answers.busKm);
      case QUESTIONNAIRE_STEPS.CAR_KM:
        return isNonNegativeNumber(answers.carKm);
      case QUESTIONNAIRE_STEPS.CAR_TYPE:
        return isTruthy(answers.carType);
      case QUESTIONNAIRE_STEPS.CAR_PASSENGERS:
        return isNumberAtLeast(answers.carPassengers, 1);
      case QUESTIONNAIRE_STEPS.AGE:
        return isPositiveNumber(answers.age);
      case QUESTIONNAIRE_STEPS.GENDER:
        return isTruthy(answers.gender);
      default:
        return false;
    }
  };

  const emissions = calculateEmissions(answers, project.activities);
  /**
   * Adjust step display number when car questions are conditionally skipped.
   * If user enters 0 car km, we skip CAR_TYPE and CAR_PASSENGERS steps,
   * so when at AGE step, display it as if at CAR_TYPE step for progress bar.
   */
  const currentStepDisplay =
    currentStep === QUESTIONNAIRE_STEPS.AGE &&
    (!answers.carKm || answers.carKm === 0)
      ? QUESTIONNAIRE_STEPS.CAR_TYPE
      : currentStep;

  const renderedStep = isHydrated ? currentStep : 0;

  return (
    <div className="space-y-6">
      {/* Compact Stats Bar - shown from step 2 onwards */}
      {isHydrated && currentStep >= 2 && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3 sm:gap-4"
          initial={{ opacity: 0, y: -10 }}
        >
          <Card className="flex flex-col items-center justify-between gap-2 border-red-500/20 bg-red-500/5 p-3 sm:flex-row sm:gap-4 sm:p-4 md:gap-6">
            <div className="mb-1 flex items-center gap-2 sm:mb-0">
              <Factory className="h-4 w-4 text-red-400 sm:h-5 sm:w-5" />
              <span className="font-medium text-muted-foreground text-xs sm:text-sm">
                {t("results.co2-footprint")}
              </span>
            </div>
            <span className="font-bold font-mono text-lg text-red-400 sm:text-xl">
              {(confirmedEmissions?.totalCO2 ?? 0).toFixed(1)} kg
            </span>
          </Card>
          <Card className="flex flex-col items-center justify-between gap-2 border-green-500/20 bg-green-500/5 p-3 sm:flex-row sm:gap-4 sm:p-4 md:gap-6">
            <div className="mb-1 flex items-center gap-2 sm:mb-0">
              <TreePine className="h-4 w-4 text-green-400 sm:h-5 sm:w-5" />
              <span className="font-medium text-muted-foreground text-xs sm:text-sm">
                {t("results.trees-needed")}
              </span>
            </div>
            <span className="font-bold font-mono text-green-400 text-lg sm:text-xl">
              {confirmedEmissions?.treesNeeded ?? 0}
            </span>
          </Card>
        </motion.div>
      )}

      {/* Progress Bar */}
      {isHydrated && (
        <div className="space-y-2">
          <Progress className="h-2" value={progress} />
          <div className="text-right text-muted-foreground text-xs">
            {t("header.step-counter", {
              current: currentStepDisplay + 1,
              total: totalSteps,
            })}
          </div>
        </div>
      )}

      {/* Impact Modal */}
      {showImpactModal && impactData && (
        <ImpactModal
          accommodationCategory={answers.accommodationCategory}
          carKm={answers.carKm}
          days={answers.days}
          impact={impactData.impact}
          isOpen={showImpactModal}
          newCO2={impactData.newCO2}
          onClose={handleImpactModalClose}
          previousCO2={impactData.previousCO2}
          roomOccupancy={answers.roomOccupancy}
          stepKey={impactData.stepKey}
          stepValue={impactData.stepValue}
        />
      )}

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          initial={{ opacity: 0, x: 20 }}
          key={renderedStep}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Card className="border-primary/20 bg-card/50 p-4 backdrop-blur-sm sm:p-6 md:p-8">
            {/* Step 0: Welcome */}
            {renderedStep === 0 && (
              <div className="space-y-8 text-center">
                <p className="text-base text-muted-foreground sm:text-lg">
                  {project.welcomeMessage || t("welcome.default-message")}
                </p>
                <AnimatedGroup>
                  <p className="mt-4 text-center font-bold text-2xl text-emerald-500 sm:text-3xl">
                    {t("welcome.ready")}
                  </p>
                  <p className="mt-2 text-center font-medium text-lg text-secondary sm:text-xl">
                    {t("welcome.every-choice")}
                  </p>
                  <p className="mx-auto mt-6 max-w-xl text-center font-semibold text-foreground text-xl sm:text-2xl">
                    {t("welcome.fun-message")}
                  </p>
                </AnimatedGroup>
                <Button
                  className="mt-6 w-full bg-gradient-to-r from-teal-700 to-emerald-600 px-8 py-6 text-lg transition-all duration-250 hover:scale-105 hover:from-teal-800 hover:to-emerald-700 sm:w-auto"
                  onClick={handleNext}
                  size="lg"
                >
                  {t("welcome.start-button")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}

            {/* Step 1: Participant Info */}
            {renderedStep === 1 && (
              <div className="space-y-6">
                <h2 className="mb-4 text-center font-bold text-2xl text-foreground sm:text-3xl">
                  {t("participant-info.title")}
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-foreground" htmlFor="firstName">
                      {t("participant-info.first-name")}{" "}
                      <span className="text-red-500">
                        {t("participant-info.required")}
                      </span>
                    </Label>
                    <Input
                      className="text-lg"
                      id="firstName"
                      onChange={(e) =>
                        updateAnswer("firstName", e.target.value)
                      }
                      placeholder={t("participant-info.first-name-placeholder")}
                      type="text"
                      value={answers.firstName || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">
                      {t("participant-info.country")}{" "}
                      <span className="text-red-500">
                        {t("participant-info.required")}
                      </span>
                    </Label>
                    <CountrySelect
                      className="text-lg"
                      onValueChange={(value) => updateAnswer("country", value)}
                      placeholder={t("participant-info.country-placeholder")}
                      value={answers.country || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground" htmlFor="email">
                      {t("participant-info.email")}{" "}
                      <span className="text-red-500">
                        {t("participant-info.required")}
                      </span>
                    </Label>
                    <Input
                      className="text-lg"
                      id="email"
                      onChange={(e) => updateAnswer("email", e.target.value)}
                      placeholder={t("participant-info.email-placeholder")}
                      type="email"
                      value={answers.email || ""}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Days */}
            {renderedStep === 2 && (
              <div className="space-y-6">
                <Label className="font-bold text-foreground text-xl md:text-2xl">
                  {t("days.question")}
                </Label>
                <p className="text-muted-foreground text-sm">
                  {t("days.note")}
                </p>
                <Input
                  className="h-12 text-lg"
                  min="1"
                  onChange={(e) =>
                    updateAnswer("days", Number.parseInt(e.target.value, 10))
                  }
                  placeholder={t("days.placeholder")}
                  type="number"
                  value={answers.days || ""}
                />
              </div>
            )}

            {/* Step 3: Accommodation Category */}
            {renderedStep === 3 && (
              <div className="space-y-6">
                <Label className="font-bold text-foreground text-xl md:text-2xl">
                  Which type of accommodation are you staying in?
                </Label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {ACCOMMODATION_OPTIONS.map((option) => (
                    <button
                      className={`rounded-lg border-2 p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        answers.accommodationCategory === option
                          ? "border-teal-500 bg-teal-500/10 font-semibold text-teal-400 shadow-sm"
                          : "border-border text-foreground hover:border-border/50 hover:bg-accent"
                      }`}
                      key={option}
                      onClick={() =>
                        updateAnswer("accommodationCategory", option)
                      }
                      type="button"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Room Occupancy */}
            {renderedStep === 4 && (
              <div className="space-y-6">
                <Label className="font-bold text-foreground text-xl md:text-2xl">
                  How many people are sharing the room/tent?
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {ROOM_OCCUPANCY_OPTIONS.map((option) => (
                    <button
                      className={`rounded-lg border-2 p-4 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        answers.roomOccupancy === option
                          ? "border-teal-500 bg-teal-500/10 font-semibold text-teal-400 shadow-sm"
                          : "border-border text-foreground hover:border-border/50 hover:bg-accent"
                      }`}
                      key={option}
                      onClick={() => updateAnswer("roomOccupancy", option)}
                      type="button"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Electricity */}
            {renderedStep === 5 && (
              <div className="space-y-6">
                <Label className="font-bold text-foreground text-xl md:text-2xl">
                  Which type of energy does your accommodation use?
                </Label>
                <div className="grid grid-cols-1 gap-3">
                  {ELECTRICITY_OPTIONS.map((option) => (
                    <button
                      className={`rounded-lg border-2 p-4 text-left transition-all hover:scale-[1.01] active:scale-[0.99] ${
                        answers.electricity === option
                          ? "border-teal-500 bg-teal-500/10 font-semibold text-teal-400 shadow-sm"
                          : "border-border text-foreground hover:border-border/50 hover:bg-accent"
                      }`}
                      key={option}
                      onClick={() => updateAnswer("electricity", option)}
                      type="button"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 6: Food */}
            {renderedStep === 6 && (
              <div className="space-y-6">
                <Label className="font-bold text-foreground text-xl md:text-2xl">
                  How often do you plan to eat meat on your project?
                </Label>
                <div className="grid grid-cols-1 gap-3">
                  {FOOD_OPTIONS.map((option) => (
                    <button
                      className={`rounded-lg border-2 p-4 text-left transition-all hover:scale-[1.01] active:scale-[0.99] ${
                        answers.food === option
                          ? "border-teal-500 bg-teal-500/10 font-semibold text-teal-400 shadow-sm"
                          : "border-border text-foreground hover:border-border/50 hover:bg-accent"
                      }`}
                      key={option}
                      onClick={() => updateAnswer("food", option)}
                      type="button"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 7: Flight km */}
            {renderedStep === 7 && (
              <div className="space-y-6">
                <Label className="font-bold text-foreground text-xl md:text-2xl">
                  Your way TO the project: How many kilometres did you fly?
                </Label>
                <Input
                  className="h-12 text-lg"
                  min="0"
                  onChange={(e) =>
                    updateAnswer(
                      "flightKm",
                      Number.parseFloat(e.target.value) || 0,
                    )
                  }
                  placeholder="0"
                  step="0.1"
                  type="number"
                  value={answers.flightKm ?? ""}
                />
              </div>
            )}

            {/* Step 8: Boat km */}
            {renderedStep === 8 && (
              <div className="space-y-6">
                <Label className="font-bold text-foreground text-xl md:text-2xl">
                  Your way TO the project: How many kilometres did you go by
                  boat?
                </Label>
                <Input
                  className="h-12 text-lg"
                  min="0"
                  onChange={(e) =>
                    updateAnswer(
                      "boatKm",
                      Number.parseFloat(e.target.value) || 0,
                    )
                  }
                  placeholder="0"
                  step="0.1"
                  type="number"
                  value={answers.boatKm ?? ""}
                />
              </div>
            )}

            {/* Step 9: Train km */}
            {renderedStep === 9 && (
              <div className="space-y-6">
                <Label className="font-bold text-foreground text-xl md:text-2xl">
                  Your way TO the project: How many kilometres did you go by
                  train or metro?
                </Label>
                <Input
                  className="h-12 text-lg"
                  min="0"
                  onChange={(e) =>
                    updateAnswer(
                      "trainKm",
                      Number.parseFloat(e.target.value) || 0,
                    )
                  }
                  placeholder="0"
                  step="0.1"
                  type="number"
                  value={answers.trainKm ?? ""}
                />
              </div>
            )}

            {/* Step 10: Bus km */}
            {renderedStep === 10 && (
              <div className="space-y-6">
                <Label className="font-bold text-foreground text-xl md:text-2xl">
                  Your way TO the project: How many kilometres did you go by
                  bus/van?
                </Label>
                <Input
                  className="h-12 text-lg"
                  min="0"
                  onChange={(e) =>
                    updateAnswer(
                      "busKm",
                      Number.parseFloat(e.target.value) || 0,
                    )
                  }
                  placeholder="0"
                  step="0.1"
                  type="number"
                  value={answers.busKm ?? ""}
                />
              </div>
            )}

            {/* Step 11: Car km */}
            {renderedStep === 11 && (
              <div className="space-y-6">
                <Label className="font-bold text-foreground text-xl md:text-2xl">
                  Your way TO the project: How many kilometres did you go by
                  car?
                </Label>
                <Input
                  className="h-12 text-lg"
                  min="0"
                  onChange={(e) =>
                    updateAnswer(
                      "carKm",
                      Number.parseFloat(e.target.value) || 0,
                    )
                  }
                  placeholder="0"
                  step="0.1"
                  type="number"
                  value={answers.carKm ?? ""}
                />
              </div>
            )}

            {/* Step 12: Car Type (conditional) */}
            {renderedStep === 12 && (
              <div className="space-y-6">
                <Label className="font-bold text-foreground text-xl md:text-2xl">
                  What type of car did you use?
                </Label>
                <div className="grid grid-cols-1 gap-3">
                  {CAR_TYPE_OPTIONS.map((option) => (
                    <button
                      className={`rounded-lg border-2 p-4 text-left transition-all hover:scale-[1.01] active:scale-[0.99] ${
                        answers.carType === option
                          ? "border-teal-500 bg-teal-500/10 font-semibold text-teal-400 shadow-sm"
                          : "border-border text-foreground hover:border-border/50 hover:bg-accent"
                      }`}
                      key={option}
                      onClick={() => updateAnswer("carType", option)}
                      type="button"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 13: Car Passengers (conditional) */}
            {renderedStep === 13 && (
              <div className="space-y-6">
                <Label className="font-bold text-foreground text-xl md:text-2xl">
                  How many participants (including you) were sitting in the car?
                </Label>
                <Input
                  className="h-12 text-lg"
                  min="1"
                  onChange={(e) =>
                    updateAnswer(
                      "carPassengers",
                      Number.parseInt(e.target.value, 10),
                    )
                  }
                  placeholder="1"
                  type="number"
                  value={answers.carPassengers || ""}
                />
              </div>
            )}

            {/* Step 14: Age */}
            {renderedStep === 14 && (
              <div className="space-y-6">
                <Label className="font-bold text-foreground text-xl md:text-2xl">
                  How old are you?
                </Label>
                <Input
                  className="h-12 text-lg"
                  min="1"
                  onChange={(e) =>
                    updateAnswer("age", Number.parseInt(e.target.value, 10))
                  }
                  placeholder="Age"
                  type="number"
                  value={answers.age || ""}
                />
              </div>
            )}

            {/* Step 15: Gender */}
            {renderedStep === 15 && (
              <div className="space-y-6">
                <Label className="font-bold text-foreground text-xl md:text-2xl">
                  What is your gender?
                </Label>
                <div className="grid grid-cols-1 gap-3">
                  {GENDER_OPTIONS.map((option) => (
                    <button
                      className={`rounded-lg border-2 p-4 text-left transition-all hover:scale-[1.01] active:scale-[0.99] ${
                        answers.gender === option
                          ? "border-teal-500 bg-teal-500/10 font-semibold text-teal-400 shadow-sm"
                          : "border-border text-foreground hover:border-border/50 hover:bg-accent"
                      }`}
                      key={option}
                      onClick={() => updateAnswer("gender", option)}
                      type="button"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            {renderedStep > 0 && (
              <div className="mt-8 flex gap-3">
                <Button
                  className="h-12 flex-1 text-base"
                  onClick={handleBack}
                  type="button"
                  variant="outline"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("navigation.back")}
                </Button>
                <Button
                  className={`h-12 flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-base text-white transition-all duration-250 hover:from-teal-600 hover:to-emerald-600 hover:shadow-md ${
                    renderedStep === 0 ? "w-full" : ""
                  }`}
                  disabled={!canProceed()}
                  onClick={handleNext}
                  type="button"
                >
                  {renderedStep === 14 ? (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      {t("navigation.complete")}
                    </>
                  ) : (
                    <>
                      {t("navigation.continue")}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Show final results after completion */}
      {renderedStep === 15 && emissions.totalCO2 > 0 && (
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          initial={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-teal-500/30 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 p-6">
            <div className="space-y-6">
              <h3 className="text-center font-bold text-2xl text-foreground sm:text-3xl">
                {t("results.summary-title")}
              </h3>
              <div className="space-y-3 text-sm sm:text-base">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("results.transport")}
                  </span>
                  <span className="font-semibold text-foreground">
                    {emissions.transportCO2.toFixed(1)} kg CO₂
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("results.accommodation")}
                  </span>
                  <span className="font-semibold text-foreground">
                    {emissions.accommodationCO2.toFixed(1)} kg CO₂
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("results.food")}
                  </span>
                  <span className="font-semibold text-foreground">
                    {emissions.foodCO2.toFixed(1)} kg CO₂
                  </span>
                </div>
                {emissions.projectActivitiesCO2 > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("results.project-activities")}
                    </span>
                    <span className="font-semibold text-foreground">
                      {emissions.projectActivitiesCO2.toFixed(1)} kg CO₂
                    </span>
                  </div>
                )}
                <div className="border-teal-500/30 border-t pt-3">
                  <div className="flex justify-between text-lg sm:text-xl">
                    <span className="font-bold text-foreground">
                      {t("results.total")}
                    </span>
                    <span className="font-bold text-teal-400">
                      {emissions.totalCO2.toFixed(1)} kg CO₂
                    </span>
                  </div>
                </div>
              </div>
              <p className="pt-2 text-center text-muted-foreground text-xs sm:text-sm">
                {t("results.console-note")}
              </p>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
