/**
 * Questionnaire Flow Configuration
 * Single source of truth for questionnaire step definitions and flow logic
 */

// ============================================================================
// QUESTIONNAIRE STRUCTURE
// ============================================================================

/**
 * Total number of steps in the questionnaire.
 * Breakdown:
 * - 1 welcome screen
 * - 1 participant info (name, country, email)
 * - 14 questions (days, accommodation, food, transport, demographics)
 */
export const QUESTIONNAIRE_TOTAL_STEPS = 16;

/**
 * Step indices for the questionnaire.
 */
export const QUESTIONNAIRE_STEPS = {
	WELCOME: 0,
	PARTICIPANT_INFO: 1,
	DAYS: 2,
	ACCOMMODATION_CATEGORY: 3,
	ROOM_OCCUPANCY: 4,
	ELECTRICITY: 5,
	FOOD: 6,
	FLIGHT_KM: 7,
	BOAT_KM: 8,
	TRAIN_KM: 9,
	BUS_KM: 10,
	CAR_KM: 11,
	CAR_TYPE: 12, // Conditional - only if carKm > 0
	CAR_PASSENGERS: 13, // Conditional - only if carKm > 0
	AGE: 14,
	GENDER: 15,
} as const;

/**
 * Steps that should trigger the impact modal when answered.
 */
export const EMISSION_IMPACT_STEPS = [
	"electricity",
	"food",
	"flightKm",
	"boatKm",
	"trainKm",
	"busKm",
	"carPassengers",
] as const;
