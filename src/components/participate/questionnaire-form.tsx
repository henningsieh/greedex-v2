"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Leaf,
  TreePine,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImpactModal } from "./impact-modal";
import {
  type AccommodationCategory,
  type CarType,
  calculateEmissions,
  type ElectricityType,
  type FoodFrequency,
  type Gender,
  type ParticipantAnswers,
  type RoomOccupancy,
} from "./questionnaire-types";

interface Project {
  id: string;
  name: string;
  location: string;
  country: string;
  startDate: Date;
  endDate: Date;
  welcomeMessage?: string | null;
}

interface QuestionnaireFormProps {
  project: Project;
}

const ACCOMMODATION_OPTIONS: AccommodationCategory[] = [
  "Camping",
  "Hostel",
  "3★ Hotel",
  "4★ Hotel",
  "5★ Hotel",
  "Apartment",
  "Friends/Family",
];

const ROOM_OCCUPANCY_OPTIONS: RoomOccupancy[] = [
  "alone",
  "2 people",
  "3 people",
  "4+ people",
];

const ELECTRICITY_OPTIONS: ElectricityType[] = [
  "green energy",
  "conventional energy",
  "could not find out",
];

const FOOD_OPTIONS: FoodFrequency[] = [
  "never",
  "rarely",
  "sometimes",
  "almost every day",
  "every day",
];

const CAR_TYPE_OPTIONS: CarType[] = [
  "conventional (diesel, petrol, gas…)",
  "electric",
];

const GENDER_OPTIONS: Gender[] = [
  "Female",
  "Male",
  "Other / Prefer not to say",
];

// Steps that trigger impact modal when answered
const EMISSION_IMPACT_STEPS = [
  "flightKm",
  "boatKm",
  "trainKm",
  "busKm",
  "carKm",
  "carPassengers",
  "electricity",
  "food",
];

export function QuestionnaireForm({ project }: QuestionnaireFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<ParticipantAnswers>>({
    firstName: "",
    country: "",
    email: "",
    days: 0,
    flightKm: 0,
    boatKm: 0,
    trainKm: 0,
    busKm: 0,
    carKm: 0,
    carPassengers: 1,
    age: 0,
  });

  // Impact modal state
  const [showImpactModal, setShowImpactModal] = useState(false);
  const [impactData, setImpactData] = useState<{
    previousCO2: number;
    newCO2: number;
    impact: number;
    stepKey: string;
    stepValue: string | number;
  } | null>(null);

  // Total steps: 1 welcome form + 1 participant info + 14 questions = 16 total
  // Steps 12-13 are conditional based on carKm (car type and passengers)
  const totalSteps = 16;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const updateAnswer = <K extends keyof ParticipantAnswers>(
    key: K,
    value: ParticipantAnswers[K],
  ) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
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
    if (currentStep === 11 && (!answers.carKm || answers.carKm === 0)) {
      setCurrentStep(14); // Skip to age
      return;
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const shouldShowImpact = (stepKey: string | null): boolean => {
    if (!stepKey) return false;

    // Skip impact for zero-value transport questions
    if (["flightKm", "boatKm", "trainKm", "busKm"].includes(stepKey)) {
      const value = answers[stepKey as keyof ParticipantAnswers];
      if (Number(value) === 0) return false;
    }

    // Skip carPassengers impact if no car travel
    if (
      stepKey === "carPassengers" &&
      (!answers.carKm || answers.carKm === 0)
    ) {
      return false;
    }

    return EMISSION_IMPACT_STEPS.includes(stepKey);
  };

  const handleNext = () => {
    const stepKey = getStepKey(currentStep);

    if (stepKey && shouldShowImpact(stepKey)) {
      // Calculate previous CO2 WITHOUT the current answer
      const answersWithoutCurrent = { ...answers };
      delete answersWithoutCurrent[stepKey as keyof ParticipantAnswers];
      const previousCO2 = calculateEmissions(answersWithoutCurrent).totalCO2;

      // Calculate new CO2 WITH the current answer
      const currentValue = answers[stepKey as keyof ParticipantAnswers];
      const newCO2 = calculateEmissions(answers).totalCO2;
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
    setShowImpactModal(false);
    proceedToNextStep();
  };

  const handleBack = () => {
    // Handle back navigation with conditional steps
    if (currentStep === 14 && (!answers.carKm || answers.carKm === 0)) {
      // Jump back to step 11 (carKm) if we skipped car questions
      setCurrentStep(11);
      return;
    }

    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const emissions = calculateEmissions(answers);

    // Complete data structure as requested
    const completeData = {
      answers, // Discrete answers object
      emissions, // Calculated results
      summary: {
        totalCO2: emissions.totalCO2,
        treesNeeded: emissions.treesNeeded,
        breakdown: {
          transport: emissions.transportCO2,
          accommodation: emissions.accommodationCO2,
          food: emissions.foodCO2,
        },
      },
    };

    console.log("=== Participant Questionnaire Complete ===");
    console.log("Discrete Answers:", answers);
    console.log("Emissions Calculation:", emissions);
    console.log("Complete Data:", completeData);
    console.log("==========================================");
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0:
        return true; // Welcome
      case 1:
        return (
          !!answers.firstName?.trim() &&
          !!answers.country?.trim() &&
          !!answers.email?.trim()
        );
      case 2:
        return typeof answers.days === "number" && answers.days > 0;
      case 3:
        return !!answers.accommodationCategory;
      case 4:
        return !!answers.roomOccupancy;
      case 5:
        return !!answers.electricity;
      case 6:
        return !!answers.food;
      case 7:
        return typeof answers.flightKm === "number" && answers.flightKm >= 0;
      case 8:
        return typeof answers.boatKm === "number" && answers.boatKm >= 0;
      case 9:
        return typeof answers.trainKm === "number" && answers.trainKm >= 0;
      case 10:
        return typeof answers.busKm === "number" && answers.busKm >= 0;
      case 11:
        return typeof answers.carKm === "number" && answers.carKm >= 0;
      case 12:
        return !!answers.carType;
      case 13:
        return (
          typeof answers.carPassengers === "number" &&
          answers.carPassengers >= 1
        );
      case 14:
        return typeof answers.age === "number" && answers.age > 0;
      case 15:
        return !!answers.gender;
      default:
        return false;
    }
  };

  const emissions = calculateEmissions(answers);
  const currentStepDisplay =
    currentStep === 14 && (!answers.carKm || answers.carKm === 0)
      ? 12 // Show as step 12 if we skipped car questions
      : currentStep;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500/20 to-emerald-500/20 px-6 py-2">
          <Leaf className="h-5 w-5 text-teal-400" />
          <span className="font-semibold text-sm text-teal-400">
            Greendex 2.0
          </span>
        </div>
        <h1 className="mb-2 font-bold text-3xl text-foreground sm:text-4xl">
          CO₂ Calculator for Erasmus+ Mobilities
        </h1>
        <p className="text-lg text-muted-foreground">{project.name}</p>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Counter */}
      <div className="text-center text-muted-foreground text-sm">
        Step {currentStepDisplay + 1} of {totalSteps}
      </div>

      {/* Permanent CO₂ and Trees Display - shown from step 2 onwards */}
      {currentStep >= 2 && (
        <div className="grid grid-cols-2 gap-4">
          {/* CO₂ Footprint Card */}
          <Card className="border-teal-500/30 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 p-4 text-center">
            <div className="mb-2 flex justify-center">
              <Leaf className="h-8 w-8 text-teal-400" />
            </div>
            <div className="mb-1 font-bold text-3xl text-teal-400">
              {emissions.totalCO2.toFixed(1)}
            </div>
            <div className="text-muted-foreground text-xs">kg</div>
            <div className="mt-1 text-foreground text-sm">CO₂ Footprint</div>
          </Card>

          {/* Trees Needed Card */}
          <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-4 text-center">
            <div className="mb-2 flex justify-center">
              <TreePine className="h-8 w-8 text-green-400" />
            </div>
            <div className="mb-1 font-bold text-3xl text-green-400">
              {emissions.treesNeeded}
            </div>
            <div className="text-muted-foreground text-xs">(1 Year)</div>
            <div className="mt-1 text-foreground text-sm">Trees</div>
          </Card>
        </div>
      )}

      {/* Impact Modal */}
      {showImpactModal && impactData && (
        <ImpactModal
          isOpen={showImpactModal}
          previousCO2={impactData.previousCO2}
          newCO2={impactData.newCO2}
          impact={impactData.impact}
          stepKey={impactData.stepKey}
          stepValue={impactData.stepValue}
          days={answers.days}
          accommodationCategory={answers.accommodationCategory}
          roomOccupancy={answers.roomOccupancy}
          carKm={answers.carKm}
          onClose={handleImpactModalClose}
        />
      )}

      {/* Question Card */}
      <Card className="border-primary/20 bg-card/50 p-6 backdrop-blur-sm sm:p-8">
        {/* Step 0: Welcome */}
        {currentStep === 0 && (
          <div className="space-y-6 text-center">
            <h2 className="font-bold text-2xl text-foreground">
              Welcome to Greendex
            </h2>
            <p className="text-muted-foreground">
              {project.welcomeMessage ||
                "Calculate the carbon footprint of your participation in this Erasmus+ project."}
            </p>
            <Button
              onClick={handleNext}
              size="lg"
              className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600"
            >
              Start Greendex
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Step 1: Participant Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="mb-6 text-center font-bold text-foreground text-xl">
              Before we start, please tell us:
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-foreground">
                  Your first name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Enter your first name"
                  value={answers.firstName || ""}
                  onChange={(e) => updateAnswer("firstName", e.target.value)}
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="text-foreground">
                  In which country do you live?{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="country"
                  type="text"
                  placeholder="Enter your country"
                  value={answers.country || ""}
                  onChange={(e) => updateAnswer("country", e.target.value)}
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Your email address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={answers.email || ""}
                  onChange={(e) => updateAnswer("email", e.target.value)}
                  className="text-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Days */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <Label className="font-bold text-foreground text-xl">
              How many days are you participating on your project?
            </Label>
            <p className="text-muted-foreground text-sm">without travel days</p>
            <Input
              type="number"
              min="1"
              placeholder="Number of days"
              value={answers.days || ""}
              onChange={(e) =>
                updateAnswer("days", Number.parseInt(e.target.value, 10))
              }
              className="text-lg"
            />
          </div>
        )}

        {/* Step 3: Accommodation Category */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <Label className="font-bold text-foreground text-xl">
              Which type of accommodation are you staying in?
            </Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {ACCOMMODATION_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => updateAnswer("accommodationCategory", option)}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    answers.accommodationCategory === option
                      ? "border-teal-500 bg-teal-500/10 font-semibold text-teal-400"
                      : "border-border text-foreground hover:border-border/50 hover:bg-accent"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Room Occupancy */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <Label className="font-bold text-foreground text-xl">
              How many people are sharing the room/tent?
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {ROOM_OCCUPANCY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => updateAnswer("roomOccupancy", option)}
                  className={`rounded-lg border-2 p-4 transition-all ${
                    answers.roomOccupancy === option
                      ? "border-teal-500 bg-teal-500/10 font-semibold text-teal-400"
                      : "border-border text-foreground hover:border-border/50 hover:bg-accent"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Electricity */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <Label className="font-bold text-foreground text-xl">
              Which type of energy does your accommodation use?
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {ELECTRICITY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => updateAnswer("electricity", option)}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    answers.electricity === option
                      ? "border-teal-500 bg-teal-500/10 font-semibold text-teal-400"
                      : "border-border text-foreground hover:border-border/50 hover:bg-accent"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Food */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <Label className="font-bold text-foreground text-xl">
              How often do you plan to eat meat on your project?
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {FOOD_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => updateAnswer("food", option)}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    answers.food === option
                      ? "border-teal-500 bg-teal-500/10 font-semibold text-teal-400"
                      : "border-border text-foreground hover:border-border/50 hover:bg-accent"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 7: Flight km */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <Label className="font-bold text-foreground text-xl">
              Your way TO the project: How many kilometres did you fly?
            </Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              placeholder="0"
              value={answers.flightKm ?? ""}
              onChange={(e) =>
                updateAnswer("flightKm", Number.parseFloat(e.target.value) || 0)
              }
              className="text-lg"
            />
          </div>
        )}

        {/* Step 8: Boat km */}
        {currentStep === 8 && (
          <div className="space-y-4">
            <Label className="font-bold text-foreground text-xl">
              Your way TO the project: How many kilometres did you go by boat?
            </Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              placeholder="0"
              value={answers.boatKm ?? ""}
              onChange={(e) =>
                updateAnswer("boatKm", Number.parseFloat(e.target.value) || 0)
              }
              className="text-lg"
            />
          </div>
        )}

        {/* Step 9: Train km */}
        {currentStep === 9 && (
          <div className="space-y-4">
            <Label className="font-bold text-foreground text-xl">
              Your way TO the project: How many kilometres did you go by train
              or metro?
            </Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              placeholder="0"
              value={answers.trainKm ?? ""}
              onChange={(e) =>
                updateAnswer("trainKm", Number.parseFloat(e.target.value) || 0)
              }
              className="text-lg"
            />
          </div>
        )}

        {/* Step 10: Bus km */}
        {currentStep === 10 && (
          <div className="space-y-4">
            <Label className="font-bold text-foreground text-xl">
              Your way TO the project: How many kilometres did you go by
              bus/van?
            </Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              placeholder="0"
              value={answers.busKm ?? ""}
              onChange={(e) =>
                updateAnswer("busKm", Number.parseFloat(e.target.value) || 0)
              }
              className="text-lg"
            />
          </div>
        )}

        {/* Step 11: Car km */}
        {currentStep === 11 && (
          <div className="space-y-4">
            <Label className="font-bold text-foreground text-xl">
              Your way TO the project: How many kilometres did you go by car?
            </Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              placeholder="0"
              value={answers.carKm ?? ""}
              onChange={(e) =>
                updateAnswer("carKm", Number.parseFloat(e.target.value) || 0)
              }
              className="text-lg"
            />
          </div>
        )}

        {/* Step 11: Car Type (conditional) */}
        {currentStep === 12 && (
          <div className="space-y-4">
            <Label className="font-bold text-foreground text-xl">
              What type of car did you use?
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {CAR_TYPE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => updateAnswer("carType", option)}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    answers.carType === option
                      ? "border-teal-500 bg-teal-500/10 font-semibold text-teal-400"
                      : "border-border text-foreground hover:border-border/50 hover:bg-accent"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 12: Car Passengers (conditional) */}
        {currentStep === 13 && (
          <div className="space-y-4">
            <Label className="font-bold text-foreground text-xl">
              How many participants (including you) were sitting in the car?
            </Label>
            <Input
              type="number"
              min="1"
              placeholder="1"
              value={answers.carPassengers || ""}
              onChange={(e) =>
                updateAnswer(
                  "carPassengers",
                  Number.parseInt(e.target.value, 10),
                )
              }
              className="text-lg"
            />
          </div>
        )}

        {/* Step 14: Age */}
        {currentStep === 14 && (
          <div className="space-y-4">
            <Label className="font-bold text-foreground text-xl">
              How old are you?
            </Label>
            <Input
              type="number"
              min="1"
              placeholder="Age"
              value={answers.age || ""}
              onChange={(e) =>
                updateAnswer("age", Number.parseInt(e.target.value, 10))
              }
              className="text-lg"
            />
          </div>
        )}

        {/* Step 15: Gender */}
        {currentStep === 15 && (
          <div className="space-y-4">
            <Label className="font-bold text-foreground text-xl">
              What is your gender?
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {GENDER_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => updateAnswer("gender", option)}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    answers.gender === option
                      ? "border-teal-500 bg-teal-500/10 font-semibold text-teal-400"
                      : "border-border text-foreground hover:border-border/50 hover:bg-accent"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex gap-3">
          {currentStep > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          <Button
            type="button"
            onClick={handleNext}
            disabled={!canProceed()}
            className={`flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 ${
              currentStep === 0 ? "w-full" : ""
            }`}
          >
            {currentStep === 14 ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Complete
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Show final results after completion */}
      {currentStep === 15 && emissions.totalCO2 > 0 && (
        <Card className="border-teal-500/30 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 p-6">
          <div className="space-y-4">
            <h3 className="text-center font-bold text-foreground text-xl">
              Your Carbon Footprint Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transport:</span>
                <span className="font-semibold text-foreground">
                  {emissions.transportCO2.toFixed(1)} kg CO₂
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Accommodation:</span>
                <span className="font-semibold text-foreground">
                  {emissions.accommodationCO2.toFixed(1)} kg CO₂
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Food:</span>
                <span className="font-semibold text-foreground">
                  {emissions.foodCO2.toFixed(1)} kg CO₂
                </span>
              </div>
              <div className="border-teal-500/30 border-t pt-3">
                <div className="flex justify-between text-lg">
                  <span className="font-bold text-foreground">Total:</span>
                  <span className="font-bold text-teal-400">
                    {emissions.totalCO2.toFixed(1)} kg CO₂
                  </span>
                </div>
              </div>
            </div>
            <p className="pt-4 text-center text-muted-foreground text-sm">
              Data has been logged to the console (check browser developer
              tools)
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
