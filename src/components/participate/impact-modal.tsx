"use client";

import { ArrowRightIcon, LeafIcon, TreePineIcon, XIcon } from "lucide-react";
import { animate, motion, useMotionValue } from "motion/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

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

  switch (stepKey) {
    case "flightKm":
      if (Number(value) === 0) {
        return "✅ Great! No flying keeps your footprint low!";
      }
      return `✈️ Flying ${value} km adds ${impact.toFixed(
        1,
      )} kg CO₂ to your footprint`;

    case "trainKm":
      if (Number(value) === 0) return "🚆 No train travel this time";
      return `🚆 Excellent choice! Train travel is eco-friendly (+${impact.toFixed(
        1,
      )} kg CO₂)`;

    case "busKm":
      if (Number(value) === 0) return "🚌 No bus travel";
      return `🚌 Good public transport choice! (+${impact.toFixed(1)} kg CO₂)`;

    case "boatKm":
      if (Number(value) === 0) return "⛴️ No boat travel";
      return `⛴️ Boat travel adds ${impact.toFixed(1)} kg CO₂`;

    case "carKm":
      if (Number(value) === 0) {
        return "🚗 Great! No car travel keeps emissions low!";
      }
      return `🚗 Car travel adds ${impact.toFixed(1)} kg CO₂`;

    case "food": {
      const foodMessages: Record<string, string> = {
        never: `🌱 Amazing! Vegetarian diet for ${days} days is planet-friendly! (+${impact.toFixed(
          1,
        )} kg CO₂)`,
        rarely: `🥗 Great choice! Low meat consumption for ${days} days (+${impact.toFixed(
          1,
        )} kg CO₂)`,
        sometimes: `🍖 Moderate meat consumption for ${days} days (+${impact.toFixed(
          1,
        )} kg CO₂)`,
        "almost every day": `🥩 High meat consumption for ${days} days has significant impact (+${impact.toFixed(
          1,
        )} kg CO₂)`,
        "every day": `🥩 Daily meat for ${days} days has major environmental impact (+${impact.toFixed(
          1,
        )} kg CO₂)`,
      };
      return (
        foodMessages[value as string] ||
        `🍽️ Food choice: +${impact.toFixed(1)} kg CO₂`
      );
    }

    case "electricity": {
      const nights = days ? days - 1 : 0;
      const baseMessage = `${
        accommodationCategory || "Accommodation"
      } with ${value} for ${nights} nights, ${roomOccupancy || "alone"}`;

      if (value === "green energy") {
        return `♻️ Excellent! ${baseMessage} keeps emissions low at ${impact.toFixed(
          1,
        )} kg CO₂`;
      }
      return `🏨 ${baseMessage} adds ${impact.toFixed(
        1,
      )} kg CO₂ to your footprint`;
    }

    case "carType":
      return value === "electric"
        ? "🔋 Excellent! Electric cars have 75% lower emissions!"
        : "⛽ Conventional car increases your footprint";

    case "carPassengers":
      if (Number(value) === 1) {
        return "🚗 Consider carpooling next time! Sharing rides can cut emissions by up to 75%.";
      }
      return `👥 Great carpooling! You're reducing emissions by sharing with ${
        Number(value) - 1
      } other${Number(value) > 2 ? "s" : ""}.`;

    default:
      if (impact < 0.1) {
        return "✅ This choice doesn't affect your CO₂ footprint";
      }
      return `+${impact.toFixed(1)} kg CO₂ added`;
  }
};

const getImpactColor = (impact: number): string => {
  if (impact < 1) return "text-green-500";
  if (impact < 20) return "text-yellow-500";
  if (impact < 100) return "text-orange-500";
  return "text-red-500";
};

const getCO2Color = (co2: number): string => {
  if (co2 <= 50) return "text-green-500";
  if (co2 <= 150) return "text-yellow-500";
  if (co2 <= 300) return "text-orange-500";
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

  // Start animation when modal opens
  useEffect(() => {
    if (!isOpen) return;

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

  if (!isOpen) return null;

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

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.9,
      }}
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
      transition={{
        duration: 0.5,
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-10"
    >
      <div className="w-full max-w-3xl text-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          aria-label="Close"
        >
          <XIcon className="h-6 w-6" />
        </button>

        <h2 className="mb-10 font-bold text-4xl text-white sm:text-5xl">
          Your Impact
        </h2>

        <div
          className={`mb-10 flex flex-col gap-6 transition-opacity duration-1000 sm:flex-row sm:justify-center ${
            animationPhase !== "start" ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Current CO2 */}
          <div className="max-w-xs flex-1 rounded-2xl border-2 border-white/20 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 p-8 backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-center gap-2">
              <LeafIcon className="h-8 w-8 text-emerald-400" />
            </div>
            <div className="mb-2 text-lg text-white/80">Total CO₂</div>
            <div className={`font-bold text-5xl ${getCO2Color(newCO2)}`}>
              {displayCO2}
            </div>
            <div className="mt-2 text-white/60">kg CO₂</div>
          </div>

          {/* Trees Needed */}
          <div className="max-w-xs flex-1 rounded-2xl border-2 border-white/20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-8 backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-center gap-2">
              <TreePineIcon className="h-8 w-8 text-green-400" />
            </div>
            <div className="mb-2 text-lg text-white/80">Trees Needed</div>
            <div className="font-bold text-5xl text-green-400">{treesNeeded}</div>
            <div className="mt-2 text-white/60">to offset</div>
          </div>
        </div>

        {/* Impact Message */}
        <div
          className={`mx-auto mb-8 max-w-2xl rounded-2xl border-2 border-white/20 bg-white/10 p-8 backdrop-blur-sm transition-opacity duration-1000 ${
            animationPhase !== "start" ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className={`font-semibold text-2xl ${getImpactColor(impact)}`}>
            {impactMessage}
          </div>
          {impact > 0.1 && (
            <div className="mt-4 text-lg text-white/80">
              Impact:{" "}
              <span className="font-bold">+{impact.toFixed(1)} kg CO₂</span>
            </div>
          )}
        </div>

        {/* Continue Button */}
        <Button
          onClick={onClose}
          size="lg"
          className="bg-gradient-to-r from-teal-500 to-emerald-500 text-lg text-white hover:from-teal-600 hover:to-emerald-600"
        >
          Continue
          <ArrowRightIcon className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  );
}
