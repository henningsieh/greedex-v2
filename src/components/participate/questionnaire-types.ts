// Questionnaire types based on the clickdummy App.js structure

export type AccommodationCategory =
  | "Camping"
  | "Hostel"
  | "3★ Hotel"
  | "4★ Hotel"
  | "5★ Hotel"
  | "Apartment"
  | "Friends/Family";

export type RoomOccupancy = "alone" | "2 people" | "3 people" | "4+ people";

export type ElectricityType =
  | "green energy"
  | "conventional energy"
  | "could not find out";

export type FoodFrequency =
  | "never"
  | "rarely"
  | "sometimes"
  | "almost every day"
  | "every day";

export type CarType = "conventional (diesel, petrol, gas…)" | "electric";

export type Gender = "Female" | "Male" | "Other / Prefer not to say";

export interface ParticipantAnswers {
  // Step 0: Participant Info
  firstName: string;
  country: string;
  email: string;

  // Step 1: Days
  days: number;

  // Step 2: Accommodation category
  accommodationCategory: AccommodationCategory;

  // Step 3: Room occupancy
  roomOccupancy: RoomOccupancy;

  // Step 4: Electricity
  electricity: ElectricityType;

  // Step 5: Food
  food: FoodFrequency;

  // Step 6: Flight km TO project
  flightKm: number;

  // Step 7: Boat km TO project
  boatKm: number;

  // Step 8: Train km TO project
  trainKm: number;

  // Step 9: Bus km TO project
  busKm: number;

  // Step 10: Car km TO project
  carKm: number;

  // Step 11: Car type (conditional on carKm > 0)
  carType?: CarType;

  // Step 12: Car passengers (conditional on carKm > 0)
  carPassengers?: number;

  // Step 13: Age
  age: number;

  // Step 14: Gender
  gender: Gender;
}

// CO₂ emission factors (kg CO₂ per km per person)
export const CO2_FACTORS = {
  flight: 0.255,
  boat: 0.115,
  train: 0.041,
  bus: 0.089,
  car: 0.192,
  electricCar: 0.053,
};

// Accommodation CO₂ factors (kg CO₂ per night per person)
export const ACCOMMODATION_FACTORS: Record<AccommodationCategory, number> = {
  Camping: 1.5,
  Hostel: 3.0,
  "3★ Hotel": 5.0,
  "4★ Hotel": 7.5,
  "5★ Hotel": 10.0,
  Apartment: 4.0,
  "Friends/Family": 2.0,
};

// Food CO₂ factors (kg CO₂ per day)
const FOOD_FACTORS: Record<FoodFrequency, number> = {
  never: 1.5, // Vegetarian/vegan
  rarely: 2.5,
  sometimes: 4.0,
  "almost every day": 5.5,
  "every day": 7.0,
};

export interface EmissionCalculation {
  transportCO2: number;
  accommodationCO2: number;
  foodCO2: number;
  totalCO2: number;
  treesNeeded: number;
}

export function calculateEmissions(
  answers: Partial<ParticipantAnswers>,
): EmissionCalculation {
  let transportCO2 = 0;
  let accommodationCO2 = 0;
  let foodCO2 = 0;

  // Calculate transport emissions (TO project only, as per clickdummy)
  if (answers.flightKm) {
    transportCO2 += answers.flightKm * CO2_FACTORS.flight;
  }
  if (answers.boatKm) {
    transportCO2 += answers.boatKm * CO2_FACTORS.boat;
  }
  if (answers.trainKm) {
    transportCO2 += answers.trainKm * CO2_FACTORS.train;
  }
  if (answers.busKm) {
    transportCO2 += answers.busKm * CO2_FACTORS.bus;
  }
  if (answers.carKm) {
    const carFactor =
      answers.carType === "electric"
        ? CO2_FACTORS.electricCar
        : CO2_FACTORS.car;
    const passengers = answers.carPassengers || 1;
    transportCO2 += (answers.carKm * carFactor) / passengers;
  }

  // Calculate accommodation emissions
  if (answers.days && answers.accommodationCategory) {
    const baseFactor = ACCOMMODATION_FACTORS[answers.accommodationCategory];

    // Adjust for room occupancy
    let occupancyFactor = 1.0;
    switch (answers.roomOccupancy) {
      case "alone":
        occupancyFactor = 1.0;
        break;
      case "2 people":
        occupancyFactor = 0.6;
        break;
      case "3 people":
        occupancyFactor = 0.4;
        break;
      case "4+ people":
        occupancyFactor = 0.3;
        break;
    }

    // Adjust for electricity type
    let electricityFactor = 1.0;
    if (answers.electricity === "green energy") {
      electricityFactor = 0.5;
    }

    accommodationCO2 =
      answers.days * baseFactor * occupancyFactor * electricityFactor;
  }

  // Calculate food emissions
  if (answers.days && answers.food) {
    foodCO2 = answers.days * FOOD_FACTORS[answers.food];
  }

  const totalCO2 = transportCO2 + accommodationCO2 + foodCO2;
  const treesNeeded = Math.ceil(totalCO2 / 22); // 22kg CO₂ per tree per year

  return {
    transportCO2,
    accommodationCO2,
    foodCO2,
    totalCO2,
    treesNeeded,
  };
}
