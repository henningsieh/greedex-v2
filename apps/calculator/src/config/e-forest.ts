import { Calculator, Mail, Trees } from "lucide-react";

export const eForestConfig = {
  heroImage: "/e+forest/hero.jpg",
  fundingLogo: "/European_Commission-logo-300x80.jpg",
  links: {
    calculator: "https://app.greendex.world/",
    email: "mailto:plant.trees@greendex.world",
    article1:
      "https://portugal.postsen.com/local/306229/First-Forest-Erasmus--is-already-a-reality-at-Casa-da-Juventude-de-Amarante-and-in-Portugal.html",
    article2:
      "https://amarantemagazine.sapo.pt/sociedade/amarante-foi-inaugurada-a-primeira-floresta-erasmus-em-portugal/",
  },
  icons: {
    /** Icon for how it works / calculator section */
    howItWorks: Calculator,
    /** Icon for tree planting section */
    planting: Trees,
    /** Icon for contact/email */
    contact: Mail,
  },
} as const;
