// Metadata configuration for workshops (static data only - no i18n content)
// All translatable content is in messages/[locale].json under LandingPage.workshops

export type CalculatorType = "moment" | "deal" | "day";

export interface WorkshopMetadata {
  id: CalculatorType;
  image: string;
}

// External link URLs (not internal routes, those are handled by next-intl)
export const WORKSHOP_LINKS = {
  erasmusCalculator:
    "https://erasmus-plus.ec.europa.eu/resources-and-tools/distance-calculator",
  googleMaps: "https://www.google.com/maps",
  eForest: "https://greendex.world/e-forest",
  challengesDescription:
    "https://greendex.world/wp-content/uploads/2023/05/02-Challenges-Description.pdf",
  challengesPresentation:
    "https://greendex.world/wp-content/uploads/2023/05/02-Challenges-Presentation.pdf",
  greendexWebsite: "https://www.greendex.world/",
} as const;

// Workshop metadata (images and structure)
export const WORKSHOPS: Record<CalculatorType, WorkshopMetadata> = {
  moment: {
    id: "moment",
    image: "/workshops/workshop-moment.jpg",
  },
  deal: {
    id: "deal",
    image: "/workshops/workshop-deal.jpg",
  },
  day: {
    id: "day",
    image: "/workshops/workshop-day.jpg",
  },
};
