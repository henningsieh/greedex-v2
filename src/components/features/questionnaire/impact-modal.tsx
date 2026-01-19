"use client";

import { ArrowRightIcon, LeafIcon, XIcon } from "lucide-react";
import { animate, motion, useMotionValue } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { ParticipantActivityValueType } from "@/features/questionnaire/types";

import { PROJECT_ICONS } from "../projects/project-icons";

/**
 * Threshold for negligible impact (below this value, impact is considered insignificant).
 */
const NEGLIGIBLE_IMPACT_THRESHOLD = 0.1;

/**
 * CO₂ impact thresholds for color coding (in kg).
 */
const CO2_THRESHOLDS = {
  LOW: 1, // Green: impact < 1 kg
  MODERATE: 20, // Yellow: impact < 20 kg
  HIGH: 100, // Orange: impact < 100 kg
  // Above 100: Red (very high)
} as const;

/**
 * Total CO₂ thresholds for color coding (in kg).
 */
const TOTAL_CO2_THRESHOLDS = {
  LOW: 50, // Green: total <= 50 kg
  MODERATE: 150, // Yellow: total <= 150 kg
  HIGH: 300, // Orange: total <= 300 kg
  // Above 300: Red (very high)
} as const;

interface ImpactModalProps {
  isOpen: boolean;
  previousCO2: number;
  newCO2: number;
  impact: number;
  stepKey: string;
  stepValue: string | number;
  days?: number;
  accommodationCategory?: string;
  roomOccupancy?: string;
  carKm?: number;
  onClose: () => void;
}

const getImpactMessage = (
  stepKey: string,
  stepValue: string | number,
  impact: number,
  days?: number,
  accommodationCategory?: string,
  roomOccupancy?: string,
  _carKm?: number,
): string => {
  const value = typeof stepValue === "string" ? stepValue : Number(stepValue);

  const transportHandler = (mode: ParticipantActivityValueType) => {
    if (mode === "plane") {
      if (Number(value) === 0)
        return "✅ Great! No flying keeps your footprint low!";
      return `✈️ Flying ${value} km adds ${impact.toFixed(1)} kg CO₂ to your footprint`;
    }

    if (mode === "train") {
      if (Number(value) === 0) return "🚆 No train travel this time";
      return `🚆 Excellent choice! Train travel is eco-friendly (+${impact.toFixed(1)} kg CO₂)`;
    }

    if (mode === "bus") {
      if (Number(value) === 0) return "🚌 No bus travel";
      return `🚌 Good public transport choice! (+${impact.toFixed(1)} kg CO₂)`;
    }

    if (mode === "boat") {
      if (Number(value) === 0) return "⛴️ No boat travel";
      return `⛴️ Boat travel adds ${impact.toFixed(1)} kg CO₂`;
    }

    if (mode === "electricCar") {
      if (Number(value) === 0)
        return "🚗 Great! No car travel keeps emissions low!";
      return `🔋 Electric car travel adds ${impact.toFixed(1)} kg CO₂`;
    }

    // car
    if (Number(value) === 0)
      return "🚗 Great! No car travel keeps emissions low!";
    return `🚗 Car travel adds ${impact.toFixed(1)} kg CO₂`;
  };

  const foodMessage = () => {
    const foodMessages: Record<string, string> = {
      never: `🌱 Amazing! Vegetarian diet for ${days} days is planet-friendly! (+${impact.toFixed(1)} kg CO₂)`,
      rarely: `🥗 Great choice! Low meat consumption for ${days} days (+${impact.toFixed(1)} kg CO₂)`,
      sometimes: `🍖 Moderate meat consumption for ${days} days (+${impact.toFixed(1)} kg CO₂)`,
      "almost every day": `🥩 High meat consumption for ${days} days has significant impact (+${impact.toFixed(1)} kg CO₂)`,
      "every day": `🥩 Daily meat for ${days} days has major environmental impact (+${impact.toFixed(1)} kg CO₂)`,
    };
    return (
      foodMessages[value as string] ||
      `🍽️ Food choice: +${impact.toFixed(1)} kg CO₂`
    );
  };

  const electricityMessage = () => {
    const nights = days ? days - 1 : 0;
    const baseMessage = `${accommodationCategory || "Accommodation"} with ${value} for ${nights} nights, ${roomOccupancy || "alone"}`;
    return value === "green energy"
      ? `♻️ Excellent! ${baseMessage} keeps emissions low at ${impact.toFixed(1)} kg CO₂`
      : `🏨 ${baseMessage} adds ${impact.toFixed(1)} kg CO₂ to your footprint`;
  };

  const carTypeMessage = () =>
    value === "electricCar"
      ? "🔋 Excellent! Electric cars have 75% lower emissions!"
      : "⛽ Conventional car increases your footprint";

  const carPassengersMessage = () => {
    if (Number(value) === 1) {
      return "🚗 Consider carpooling next time! Sharing rides can cut emissions by up to 75%.";
    }
    return `👥 Great carpooling! You're reducing emissions by sharing with ${Number(value) - 1} other${Number(value) > 2 ? "s" : ""}.`;
  };

  switch (stepKey) {
    case "flightKm":
      if (Number(value) === 0) {
        return "✅ Great! No flying keeps your footprint low!";
      }
      return `✈️ Flying ${value} km adds ${impact.toFixed(1)} kg CO₂ to your footprint`;

    case "trainKm":
      return transportHandler("train");

    case "busKm":
      return transportHandler("bus");

    case "boatKm":
      return transportHandler("boat");

    case "carKm":
      return transportHandler("car");

    case "food":
      return foodMessage();

    case "electricity":
      return electricityMessage();

    case "carType":
      return carTypeMessage();

    case "carPassengers":
      return carPassengersMessage();

    default:
      if (impact < NEGLIGIBLE_IMPACT_THRESHOLD) {
        return "✅ This choice doesn't affect your CO₂ footprint";
      }

      return `+${impact.toFixed(1)} kg CO₂ added`;
  }
};

const getImpactColor = (impact: number): string => {
  if (impact < CO2_THRESHOLDS.LOW) {
    return "text-green-500";
  }
  if (impact < CO2_THRESHOLDS.MODERATE) {
    return "text-yellow-500";
  }
  if (impact < CO2_THRESHOLDS.HIGH) {
    return "text-orange-500";
  }
  return "text-red-500";
};

const getCO2Color = (co2: number): string => {
  if (co2 <= TOTAL_CO2_THRESHOLDS.LOW) {
    return "text-green-500";
  }
  if (co2 <= TOTAL_CO2_THRESHOLDS.MODERATE) {
    return "text-yellow-500";
  }
  if (co2 <= TOTAL_CO2_THRESHOLDS.HIGH) {
    return "text-orange-500";
  }
  return "text-red-500";
};

export function ImpactModal({
  isOpen,
  previousCO2,
  newCO2,
  impact,
  stepKey,
  stepValue,
  days,
  accommodationCategory,
  roomOccupancy,
  carKm,
  onClose,
}: ImpactModalProps) {
  const [animationPhase, setAnimationPhase] = useState<
    "start" | "counting" | "complete"
  >("start");
  const [displayCO2, setDisplayCO2] = useState(previousCO2.toFixed(1));
  const counterValue = useMotionValue(previousCO2);

  const t = useTranslations("participation.questionnaire.impact-modal");

  // Start animation when modal opens
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setAnimationPhase("start");
    setDisplayCO2(previousCO2.toFixed(1));
    counterValue.set(previousCO2);

    // Phase 1: Show modal, then start counting
    const showTimer = setTimeout(() => {
      setAnimationPhase("counting");

      // Phase 2: Animate counter
      animate(counterValue, newCO2, {
        duration: 2,
        ease: "easeOut",
        onUpdate: (value) => setDisplayCO2(value.toFixed(1)),
      }).then(() => {
        setAnimationPhase("complete");
      });
    }, 100);

    return () => clearTimeout(showTimer);
  }, [isOpen, previousCO2, newCO2, counterValue]);

  if (!isOpen) {
    return null;
  }

  const impactMessage = getImpactMessage(
    stepKey,
    stepValue,
    impact,
    days,
    accommodationCategory,
    roomOccupancy,
    carKm,
  );

  const treesNeeded = Math.ceil(newCO2 / 22);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <motion.div
      animate={
        isOpen
          ? {
              opacity: 1,
              scale: 1,
            }
          : {
              opacity: 0,
              scale: 0.9,
            }
      }
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur sm:p-10"
      initial={{
        opacity: 0,
        scale: 0.9,
      }}
      transition={{
        duration: 0.5,
      }}
    >
      <div className="w-full max-w-3xl text-center">
        <button
          aria-label="Close"
          className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          onClick={onClose}
          type="button"
        >
          <XIcon className="h-6 w-6" />
        </button>

        <h2 className="mb-10 text-4xl font-bold text-white sm:text-5xl">
          {t("title")}
        </h2>

        <div
          className={`mb-10 flex flex-col gap-6 transition-opacity duration-1000 sm:flex-row sm:justify-center ${
            animationPhase !== "start" ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Current CO2 */}
          <div className="max-w-xs flex-1 rounded-2xl border-2 border-white/20 bg-linear-to-br from-teal-500/20 to-emerald-500/20 p-8 backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-center gap-2">
              <LeafIcon className="h-8 w-8 text-emerald-400" />
            </div>
            <div className="mb-2 text-lg text-white/80">{t("total-co2")}</div>
            <div className={`text-5xl font-bold ${getCO2Color(newCO2)}`}>
              {displayCO2}
            </div>
            <div className="mt-2 text-white/60">kg CO₂</div>
          </div>

          {/* Trees Needed */}
          <div className="max-w-xs flex-1 rounded-2xl border-2 border-white/20 bg-linear-to-br from-green-500/20 to-emerald-500/20 p-8 backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-center gap-2">
              <PROJECT_ICONS.emissions_offset className="h-8 w-8 text-green-400" />
            </div>
            <div className="mb-2 text-lg text-white/80">{t("trees-needed")}</div>
            <div className="text-5xl font-bold text-green-400">{treesNeeded}</div>
            <div className="mt-2 text-white/60">to offset</div>
          </div>
        </div>

        {/* Impact Message */}
        <div
          className={`mx-auto max-w-2xl rounded-2xl border-2 border-white/20 bg-white/10 p-8 backdrop-blur-sm transition-opacity duration-1000 ${
            animationPhase !== "start" ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className={`text-2xl font-semibold ${getImpactColor(impact)}`}>
            {impactMessage}
          </div>
          {impact > NEGLIGIBLE_IMPACT_THRESHOLD && (
            <div className="mt-4 text-lg text-white/80">
              Impact:{" "}
              <span className="font-bold">+{impact.toFixed(1)} kg CO₂</span>
            </div>
          )}
        </div>

        {/* Continue Button */}
        <Button
          className="bg-linear-to-r from-teal-500 to-emerald-500 text-lg text-white hover:from-teal-600 hover:to-emerald-600"
          onClick={onClose}
          size="lg"
        >
          Continue
          <ArrowRightIcon className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </motion.div>,
    document.body,
  );
}
