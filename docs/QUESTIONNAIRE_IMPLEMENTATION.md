# Greendex Participant Questionnaire Implementation

## Overview
This document describes the implementation of the 14-step participant questionnaire based on the clickdummy App.js structure.

## Route Location
```
src/app/[locale]/(app)/(public participation)/project/[id]/participate/
├── layout.tsx  - Public access layout (no auth required)
└── page.tsx    - Main route with QuestionnaireForm component
```

## Components Structure
```
src/components/participate/
├── questionnaire-form.tsx      - Main 14-step questionnaire (22KB)
├── questionnaire-types.ts      - Type definitions & calculations (4KB)
└── __tests__/
    └── questionnaire.test.tsx  - Unit tests for calculations
```

## 14-Step Questionnaire Flow

### Step 0: Welcome
- Project name and details
- Welcome message
- "Start Greendex" button

### Step 1: Project Days
**Question:** "How many days are you participating on your project?"
- Type: Number input
- Min: 1
- Hint: "without travel days"

### Step 2: Accommodation Category
**Question:** "Which type of accommodation are you staying in?"
- Type: Options
- Choices:
  - Camping
  - Hostel
  - 3★ Hotel
  - 4★ Hotel
  - 5★ Hotel
  - Apartment
  - Friends/Family

### Step 3: Room Occupancy
**Question:** "How many people are sharing the room/tent?"
- Type: Options
- Choices:
  - alone
  - 2 people
  - 3 people
  - 4+ people

### Step 4: Electricity Type
**Question:** "Which type of energy does your accommodation use?"
- Type: Options
- Choices:
  - green energy
  - conventional energy
  - could not find out

### Step 5: Food Habits
**Question:** "How often do you plan to eat meat on your project?"
- Type: Options
- Choices:
  - never
  - rarely
  - sometimes
  - almost every day
  - every day

### Step 6: Flight Distance
**Question:** "Your way TO the project: How many kilometres did you fly?"
- Type: Number input
- Min: 0
- Default: 0

### Step 7: Boat Distance
**Question:** "Your way TO the project: How many kilometres did you go by boat?"
- Type: Number input
- Min: 0
- Default: 0

### Step 8: Train Distance
**Question:** "Your way TO the project: How many kilometres did you go by train or metro?"
- Type: Number input
- Min: 0
- Default: 0

### Step 9: Bus Distance
**Question:** "Your way TO the project: How many kilometres did you go by bus/van?"
- Type: Number input
- Min: 0
- Default: 0

### Step 10: Car Distance
**Question:** "Your way TO the project: How many kilometres did you go by car?"
- Type: Number input
- Min: 0
- Default: 0
- **Note:** After this step, emissions are displayed

### Step 11: Car Type (CONDITIONAL)
**Question:** "What type of car did you use?"
- Type: Options
- Choices:
  - conventional (diesel, petrol, gas…)
  - electric
- **Conditional:** Only shown if `carKm > 0`
- **Auto-skipped** if car distance is 0

### Step 12: Car Passengers (CONDITIONAL)
**Question:** "How many participants (including you) were sitting in the car?"
- Type: Number input
- Min: 1
- Default: 1
- **Conditional:** Only shown if `carKm > 0`
- **Auto-skipped** if car distance is 0

### Step 13: Age
**Question:** "How old are you?"
- Type: Number input
- Min: 1

### Step 14: Gender
**Question:** "What is your gender?"
- Type: Options
- Choices:
  - Female
  - Male
  - Other / Prefer not to say
- **Note:** After completion, final emissions are displayed

## Emission Calculations

### Transport CO₂ Factors (kg CO₂ per km per person)
```typescript
const CO2_FACTORS = {
  flight: 0.255,
  boat: 0.115,
  train: 0.041,
  bus: 0.089,
  car: 0.192,
  electricCar: 0.053,
};
```

### Car Emissions with Passengers
Car emissions are divided by the number of passengers:
```typescript
carCO2 = (carKm * carFactor) / carPassengers
```

### Accommodation CO₂ Factors (kg CO₂ per night per person)
```typescript
const ACCOMMODATION_FACTORS = {
  "Camping": 1.5,
  "Hostel": 3.0,
  "3★ Hotel": 5.0,
  "4★ Hotel": 7.5,
  "5★ Hotel": 10.0,
  "Apartment": 4.0,
  "Friends/Family": 2.0,
};
```

#### Room Occupancy Adjustments
```typescript
const occupancyFactors = {
  "alone": 1.0,
  "2 people": 0.6,
  "3 people": 0.4,
  "4+ people": 0.3,
};
```

#### Electricity Type Adjustments
```typescript
const electricityFactors = {
  "green energy": 0.5,
  "conventional energy": 1.0,
  "could not find out": 1.0,
};
```

#### Final Accommodation Formula
```typescript
accommodationCO2 = days × baseFactor × occupancyFactor × electricityFactor
```

### Food CO₂ Factors (kg CO₂ per day)
```typescript
const FOOD_FACTORS = {
  "never": 1.5,           // Vegetarian/vegan
  "rarely": 2.5,
  "sometimes": 4.0,
  "almost every day": 5.5,
  "every day": 7.0,
};
```

#### Food Formula
```typescript
foodCO2 = days × foodFactor
```

### Total Emissions
```typescript
totalCO2 = transportCO2 + accommodationCO2 + foodCO2
treesNeeded = Math.ceil(totalCO2 / 22)  // 22kg CO₂ per tree per year
```

## Emission Display Logic

### Intermediate Display (Step 10)
After completing transport questions, emissions are shown for 3 seconds:
- Current total CO₂
- Trees needed

### Final Display (Step 14)
After completing all questions:
- Breakdown by category:
  - Transport CO₂
  - Accommodation CO₂
  - Food CO₂
- Total CO₂
- Trees needed to offset

## Console Output

When the questionnaire is completed, the following is logged to the console:

```javascript
=== Participant Questionnaire Complete ===
Participant Answers: {
  days: 7,
  accommodationCategory: "Hostel",
  roomOccupancy: "2 people",
  electricity: "green energy",
  food: "sometimes",
  flightKm: 500,
  boatKm: 0,
  trainKm: 0,
  busKm: 20,
  carKm: 0,
  // carType and carPassengers are undefined when carKm = 0
  age: 25,
  gender: "Female"
}
Emissions Calculation: {
  transportCO2: 129.3,    // 500*0.255 + 20*0.089
  accommodationCO2: 6.3,  // 7*3.0*0.6*0.5
  foodCO2: 28.0,          // 7*4.0
  totalCO2: 163.6,
  treesNeeded: 8          // ceil(163.6/22)
}
==========================================
```

## Example Calculation

**Scenario:**
- 7 days project
- Hostel accommodation, 2 people per room
- Green energy
- Sometimes eat meat
- Flight: 500 km
- Bus: 20 km
- No car
- Age: 25
- Gender: Female

**Calculations:**

1. **Transport:**
   - Flight: 500 × 0.255 = 127.5 kg CO₂
   - Bus: 20 × 0.089 = 1.78 kg CO₂
   - Total: 129.28 kg CO₂

2. **Accommodation:**
   - Base: 3.0 kg CO₂/night (Hostel)
   - Occupancy: 0.6 (2 people)
   - Electricity: 0.5 (green energy)
   - Total: 7 × 3.0 × 0.6 × 0.5 = 6.3 kg CO₂

3. **Food:**
   - Factor: 4.0 kg CO₂/day (sometimes meat)
   - Total: 7 × 4.0 = 28.0 kg CO₂

4. **Grand Total:**
   - 129.28 + 6.3 + 28.0 = 163.58 kg CO₂
   - Trees needed: ceil(163.58 / 22) = 8 trees

## Conditional Logic Implementation

### Auto-Skip Logic
When `carKm = 0`:
- User clicks "Continue" on Step 10 (Car km)
- Steps 11-12 are automatically skipped
- User jumps directly to Step 13 (Age)

### Back Navigation with Conditionals
When user clicks "Back" on Step 13:
- If `carKm = 0`: Jump back to Step 10 (skipping 11-12)
- If `carKm > 0`: Go back to Step 12 normally

### Step Counter Adjustment
Step counter shows correct number accounting for skipped steps:
- If steps 11-12 are skipped, Step 13 displays as "Step 11 of 15"
- This matches the "X questions automatically skipped" behavior

## Type Definitions

All types are strongly typed in TypeScript:

```typescript
export interface ParticipantAnswers {
  days: number;
  accommodationCategory: AccommodationCategory;
  roomOccupancy: RoomOccupancy;
  electricity: ElectricityType;
  food: FoodFrequency;
  flightKm: number;
  boatKm: number;
  trainKm: number;
  busKm: number;
  carKm: number;
  carType?: CarType;              // Optional
  carPassengers?: number;         // Optional
  age: number;
  gender: Gender;
}
```

## UI/UX Features

### Progress Bar
- Shows completion percentage: `(currentStep + 1) / 15 * 100`
- Animated with smooth transitions
- Gradient color: Teal → Emerald

### Step Counter
- Shows "Step X of 15"
- Adjusts for skipped conditional steps

### Validation
- Each step requires a valid answer before proceeding
- Number inputs must be ≥ 0 or ≥ 1 as appropriate
- All option selections must be made

### Navigation
- "Back" button on all steps except welcome
- "Continue" button changes to "Complete" on final step
- Buttons disabled when validation fails

### Visual Design
- Greendex 2.0 branding with leaf icon
- Teal/Emerald gradient theme throughout
- Semi-transparent cards with backdrop blur
- Large, readable question text
- Responsive grid layouts for options

## Testing

Unit tests verify all calculation logic:

```bash
npm run test:run
```

Tests cover:
- Transport emission factors
- Accommodation emission factors
- Car emissions with passenger division
- Electric vs conventional car calculations
- Room occupancy adjustments
- Electricity type adjustments
- Food emission calculations
- Total emissions and trees needed
- Zero-value handling

## Future Enhancements

1. **Backend Integration**
   - Save answers to database
   - Associate with project and participant
   - Real-time emission tracking

2. **Return Journey**
   - Add questions for departure transport
   - Calculate round-trip emissions

3. **Multi-language Support**
   - Translate all questions via next-intl
   - Support multiple languages

4. **Advanced Features**
   - Flight class selection (economy/business/first)
   - Multi-leg journey support
   - Carbon offset options
   - Comparison with other participants

5. **Validation Enhancements**
   - Distance reasonableness checks
   - Cross-field validation
   - Helpful error messages

## Files Modified/Created

### New Files (3)
1. `src/components/participate/questionnaire-form.tsx` - Main questionnaire component (22KB)
2. `src/components/participate/questionnaire-types.ts` - Types and calculations (4KB)
3. `src/components/participate/__tests__/questionnaire.test.tsx` - Unit tests (4KB)

### Modified Files (1)
1. `src/app/[locale]/(app)/(public participation)/project/[id]/participate/page.tsx` - Updated to use QuestionnaireForm

### Removed Files (5)
1. `src/components/participate/participate-form.tsx` - Old incorrect implementation
2. `src/components/participate/steps/welcome-step.tsx` - Old incorrect step
3. `src/components/participate/steps/transport-step.tsx` - Old incorrect step
4. `src/components/participate/steps/accommodation-step.tsx` - Old incorrect step
5. `src/components/participate/steps/review-step.tsx` - Old incorrect step

## Summary

This implementation correctly replicates the clickdummy's 14-step questionnaire with:
- ✅ All 14 questions in correct order
- ✅ Conditional car questions (11-12) that auto-skip
- ✅ Proper emission calculations for transport/accommodation/food
- ✅ Intermediate emission display after transport
- ✅ Final breakdown at completion
- ✅ Console logging of complete answers and calculations
- ✅ Type-safe implementation with TypeScript
- ✅ Responsive UI with Greendex branding
- ✅ Unit tests for all calculations
