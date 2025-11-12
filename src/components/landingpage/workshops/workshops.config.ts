import type { Route } from "next";

export type CalculatorType = "moment" | "deal" | "day";

export interface Step {
  title: string;
  content: string;
  links?: Array<{
    text: string;
    href: Route;
    isExternal?: boolean;
  }>;
}

export interface Section {
  title: string;
  steps: Step[];
}

export interface CalculatorWorkshop {
  id: CalculatorType;
  title: string;
  duration: string;
  image: string;
  description: string;
  sections: Section[];
}

export const calculatorWorkshops: Record<CalculatorType, CalculatorWorkshop> = {
  moment: {
    id: "moment",
    title: "Greendex Moment",
    duration: "30 min",
    image: "/workshops/workshop-moment.jpg",
    description:
      "This workshop offers calculations of the CO2 on your mobility and how many trees need to be planted to offset the CO2.",
    sections: [
      {
        title: "Calculator Steps",
        steps: [
          {
            title: "Create the project on the Greendex app",
            content:
              "Start by creating your project in our application to track your carbon footprint.",
            links: [
              {
                text: "Open Greendex App",
                href: "/org/dashboard",
                isExternal: false,
              },
            ],
          },
          {
            title: "Map your journey from your home to this place",
            content:
              "Invite participants to form national teams. Ask them to think about their traveling experience. You can help them map their journey by putting some posters to draw their travels. It is important for them to imagine the means of transport in sequence and to find how many kilometres they made with each means of transport.",
            links: [
              {
                text: "E+ Distance Calculator",
                href: "https://erasmus-plus.ec.europa.eu/resources-and-tools/distance-calculator",
                isExternal: true,
              },
              {
                text: "Google Maps",
                href: "https://www.google.com/maps",
                isExternal: true,
              },
            ],
          },
          {
            title: "Share the project link with the participants",
            content:
              "Offer them the QR code or share the provided link through social media used on the project.",
          },
          {
            title:
              "Invite participants to fill out the questions of the calculator",
            content:
              "Every participant should fill the form individually. Host should provide the following information for the participants:\n\n• Type of accommodation (camping, hostel, private, 1-3★ hotel, 4-5★ hotel)\n• Kind of energy the accommodation is using (conventional energy, green energy)",
          },
          {
            title:
              "Make sure every participant submitted the form and allow space for reflection",
            content:
              "Allow participants space to reflect on their individual results!",
          },
          {
            title: "Display and debate on project results",
            content:
              "You may ask them the following questions:\n\n• Is there something surprising for you in the results?\n• How do the results make you feel?\n• Do you have any suggestions on how to reduce the CO2 released on future projects?",
          },
          {
            title: "Plant trees to offset the carbon footprint of your project",
            content:
              "You can provide following options:\n\n• Donate to plant trees in one of the Erasmus+ forests\n• Search for possibilities to plant the trees on your own! Maybe you can even start your own Erasmus+ forest and become part of the Greendex movement.",
            links: [
              {
                text: "E-Forest",
                href: "https://greendex.world/e-forest",
                isExternal: true,
              },
            ],
          },
          {
            title: "Share your journey on social media using #greendex",
            content:
              "Spread the word about your sustainable journey and inspire others!",
          },
        ],
      },
    ],
  },
  deal: {
    id: "deal",
    title: "Greendex Deal",
    duration: "60 min",
    image: "/workshops/workshop-deal.jpg",
    description:
      "This workshop offers calculations of the CO2 on your mobility and how many trees need to be planted to offset the CO2 as well as some sustainable and inspirational challenges for the participants to try out during your mobility.",
    sections: [
      {
        title: "2.1. Calculator",
        steps: [
          {
            title: "Create the project on the Greendex app",
            content:
              "Start by creating your project in our application to track your carbon footprint.",
            links: [
              {
                text: "Open Greendex App",
                href: "/org/dashboard",
                isExternal: false,
              },
            ],
          },
          {
            title: "Map your journey from your home to this place",
            content:
              "Invite participants to form national teams. Ask them to think about their traveling experience. You can help them map their journey by putting some posters to draw their travels. It is important for them to imagine the means of transport in sequence and to find how many kilometres they made with each means of transport.",
            links: [
              {
                text: "E+ Distance Calculator",
                href: "https://erasmus-plus.ec.europa.eu/resources-and-tools/distance-calculator",
                isExternal: true,
              },
              {
                text: "Google Maps",
                href: "https://www.google.com/maps",
                isExternal: true,
              },
            ],
          },
          {
            title: "Share the project link with the participants",
            content:
              "Offer them the QR code or share the provided link through social media used on the project.",
          },
          {
            title:
              "Invite participants to fill out the questions of the calculator",
            content:
              "Every participant should fill the form individually. Host should provide the following information for the participants:\n\n• Type of accommodation (camping, hostel, private, 1-3★ hotel, 4-5★ hotel)\n• Kind of energy the accommodation is using (conventional energy, green energy)",
          },
          {
            title:
              "Make sure every participant submitted the form and allow space for reflection",
            content:
              "Allow participants space to reflect on their individual results!",
          },
          {
            title: "Display and debate on project results",
            content:
              "You may ask them the following questions:\n\n• Is there something surprising for you in the results?\n• How do the results make you feel?\n• Do you have any suggestions on how to reduce the CO2 released on future projects?",
          },
        ],
      },
      {
        title: "2.2. Challenges",
        steps: [
          {
            title: "Read more about the challenges",
            content:
              "As a part of preparation for this workshop, familiarize yourself with the available challenges.",
            links: [
              {
                text: "Challenges Description (PDF)",
                href: "https://greendex.world/wp-content/uploads/2023/05/02-Challenges-Description.pdf",
                isExternal: true,
              },
            ],
          },
          {
            title:
              "Present challenges to reduce released CO2 during the project",
            content:
              "Invite participants to choose at least one challenge they want to try out during the project. Create smaller support groups to motivate each other through the project.",
            links: [
              {
                text: "Challenges Presentation (PDF)",
                href: "https://greendex.world/wp-content/uploads/2023/05/02-Challenges-Presentation.pdf",
                isExternal: true,
              },
            ],
          },
          {
            title: "Plant trees to offset the carbon footprint of your project",
            content:
              "You can provide following options:\n\n• Donate to plant trees in one of the Erasmus+ forests\n• Search for possibilities to plant the trees on your own! Maybe you can even start your own Erasmus+ forest and become part of the Greendex movement.",
            links: [
              {
                text: "E-Forest",
                href: "https://greendex.world/e-forest",
                isExternal: true,
              },
            ],
          },
          {
            title: "Share your journey on social media using #greendex",
            content:
              "Spread the word about your sustainable journey and inspire others!",
          },
        ],
      },
      {
        title: "2.3. Evaluation",
        steps: [
          {
            title: "Use the final evaluation to check your progress",
            content:
              "Dedicate a few questions on the final evaluation of the project to check the range of awareness raised about sustainability and carbon footprint. You may ask them the following questions:\n\n• How successful were you in challenges?\n• Would you be willing to integrate some challenges into your life?\n• What else can you do to reduce your carbon footprint?",
          },
        ],
      },
    ],
  },
  day: {
    id: "day",
    title: "Greendex Day",
    duration: "180 min",
    image: "/workshops/workshop-day.jpg",
    description:
      "This session, in addition to previously mentioned calculator and challenges, offers quiz about carbon footprint, reflection about how much plastic did we bring to this mobility and support to make some social pressure.",
    sections: [
      {
        title: "3.1. How much plastic do we own?",
        steps: [
          {
            title: "Form national groups",
            content:
              "Ask participants to form national groups and position themselves in the room.",
          },
          {
            title:
              "Invite participants to bring all plastic and non-recyclable items",
            content:
              "Ask them to go through their luggage and bring to the room everything that is plastic or cannot be recycled. They should be very thorough. If they do not wish to bring their personal items to the room, they should count them. They should count every credit card, shoes, toothbrush, cables, shampoo bottles etc.",
          },
          {
            title: "Let's calculate some numbers",
            content:
              "Invite every national group to sum the number of all plastic items and/or the ones that cannot be recycled. Invite them to calculate items per person in the team. Facilitator should sum items for the entire mobility and an average per person of the mobility. Display the results on the poster or a board.",
          },
          {
            title: "Debate",
            content:
              "Look at the numbers and invite participants to express their thoughts and emotions. You may also ask them the following questions:\n\n• How many items are you planning to leave here?\n• Are there any items here, you could replace with something else? If yes, which items can you replace with what?\n• Are there any items here, you cannot replace right now, because you are waiting for the technology to improve?\n• Are there any items where the producer can do something about it?",
          },
          {
            title: "Introducing the Greendex website",
            content:
              "Introduce our website to participants as it holds several tips about how to improve daily routine and offers additional resources for study.",
            links: [
              {
                text: "www.greendex.world",
                href: "https://www.greendex.world/",
                isExternal: true,
              },
            ],
          },
        ],
      },
      {
        title: "3.2. Social pressure",
        steps: [
          {
            title: "Create smaller intercultural groups",
            content:
              "Create smaller intercultural groups or stay in the same if you use this activity as a continuation of the previous activity!",
          },
          {
            title: "Think of some products you love",
            content:
              "Maybe there are some special cookies you love to eat or shoes you like to wear. Think of some products you love to use but are wrapped in too much packaging. Maybe you use some product that does not need to be made of plastic? Each group should decide on one such product.",
          },
          {
            title: "Find some solutions if possible",
            content:
              "If possible, find a solution for your product that would satisfy you.",
          },
          {
            title: "Write a message to the producers",
            content:
              "Write a polite message or a letter to the producers of the product you were talking about. Make sure you write the message in a form of say something positive, say something negative, suggest improvement.",
          },
          {
            title: "Use #greendex",
            content:
              "If you decide to publish this message on social media, we kindly ask you to use #greendex for a better visibility of this movement.",
          },
        ],
      },
      {
        title: "3.3. What is carbon footprint?",
        steps: [
          {
            title: "Form smaller intercultural groups",
            content:
              "Let them find a comfortable place in the room and prepare at least one smartphone. It is important to provide access to the internet.",
          },
          {
            title: "Ask participants to name their group",
            content:
              "This has a team building purpose and will help you identify the answers better.",
          },
          {
            title: "Introducing the quiz",
            content:
              "Explain to participants that we will guide them through a short quiz, and they are allowed to use smartphones.",
          },
          {
            title: "Start the quiz",
            content:
              "You can read the questions, post them on the paper, or form some sort of online tool for participants to use. This is not a competition, just research.\n\nBefore the quiz starts, ask two very basic questions:\n\n• Do you know what a carbon footprint is?\nAnswer: A carbon footprint is the total amount of greenhouse gasses that are generated by our actions.\n\n• Why do we talk about Carbon Dioxide – CO2?\nAnswer: Too much carbon dioxide (and other greenhouse gasses such as methane) in the atmosphere warms the planet, causing climate change.\n\nHere are the questions:\n• How much CO2 is released by a meat eater?\n• How much CO2 is released by a vegetarian?\n• How much CO2 is released when flying 1000 km?\n• How much CO2 is released when traveling 1000 km by train?\n• How much CO2 is released when traveling 1000 km by car?\n• How much CO2 is absorbed by one coniferous tree?\n• How much CO2 is absorbed by one deciduous tree?\n• How much O2 does one person need in a year (in kg)?\n• How much O2 does one average tree produce in a year (in kg)?\n• How many people are currently in the world?",
          },
          {
            title: "Debate",
            content:
              "Encourage participants to share thoughts and emotions about the results. You may ask them the following questions:\n\n• What was the most interesting in your research?\n• Was there something that brought out some emotions? If yes, which emotions and why?\n• Were you able to recognize the ratio between the number absorbed CO2 and released O2?\n• How densely planted are trees in your country?",
          },
        ],
      },
      {
        title: "3.4. Calculator",
        steps: [
          {
            title: "Create the project on the Greendex app",
            content:
              "Start by creating your project in our application to track your carbon footprint.",
            links: [
              {
                text: "Open Greendex App",
                href: "/org/dashboard",
                isExternal: false,
              },
            ],
          },
          {
            title: "Map your journey from your home to this place",
            content:
              "Invite participants to form national teams. Ask them to think about their traveling experience. You can help them map their journey by putting some posters to draw their travels. It is important for them to imagine the means of transport in sequence and to find how many kilometres they made with each means of transport.",
            links: [
              {
                text: "E+ Distance Calculator",
                href: "https://erasmus-plus.ec.europa.eu/resources-and-tools/distance-calculator",
                isExternal: true,
              },
              {
                text: "Google Maps",
                href: "https://www.google.com/maps",
                isExternal: true,
              },
            ],
          },
          {
            title: "Share the project link with the participants",
            content:
              "Offer them the QR code or share the provided link through social media used on the project.",
          },
          {
            title:
              "Invite participants to fill out the questions of the calculator",
            content:
              "Every participant should fill the form individually. Host should provide the following information for the participants:\n\n• Type of accommodation (camping, hostel, private, 1-3★ hotel, 4-5★ hotel)\n• Kind of energy the accommodation is using (conventional energy, green energy)",
          },
          {
            title:
              "Make sure every participant submitted the form and allow space for reflection",
            content:
              "Allow participants space to reflect on their individual results!",
          },
          {
            title: "Display and debate on project results",
            content:
              "You may ask them the following questions:\n\n• Is there something surprising for you in the results?\n• How do the results make you feel?\n• Do you have any suggestions on how to reduce the CO2 released on future projects?",
          },
        ],
      },
      {
        title: "3.5. Challenges",
        steps: [
          {
            title: "Read more about the challenges",
            content:
              "As a part of preparation for this workshop, familiarize yourself with the available challenges.",
            links: [
              {
                text: "Challenges Description (PDF)",
                href: "https://greendex.world/wp-content/uploads/2023/05/02-Challenges-Description.pdf",
                isExternal: true,
              },
            ],
          },
          {
            title:
              "Present challenges to reduce released CO2 during the project",
            content:
              "Invite participants to choose at least one challenge they want to try out during the project. Create smaller support groups to motivate each other through the project.",
            links: [
              {
                text: "Challenges Presentation (PDF)",
                href: "https://greendex.world/wp-content/uploads/2023/05/02-Challenges-Presentation.pdf",
                isExternal: true,
              },
            ],
          },
          {
            title: "Plant trees to offset the carbon footprint of your project",
            content:
              "You can provide following options:\n\n• Donate to plant trees in one of the Erasmus+ forests\n• Search for possibilities to plant the trees on your own! Maybe you can even start your own Erasmus+ forest and become part of the Greendex movement.",
            links: [
              {
                text: "E-Forest",
                href: "https://greendex.world/e-forest",
                isExternal: true,
              },
            ],
          },
          {
            title: "Share your journey on social media using #greendex",
            content:
              "Spread the word about your sustainable journey and inspire others!",
          },
        ],
      },
      {
        title: "3.6. Final evaluation",
        steps: [
          {
            title: "Dedicate time for final evaluation",
            content:
              "We invite you to dedicate a small amount of time in your final evaluation on the last day of your mobility, to ask a few green questions. You may ask them the following questions:\n\n• How aware were you about your environmentally (un)friendly habits?\n• Have you recognised something you could do to change your habits?\n• Have you participated in the proposed challenges?\n• How successful were you in your challenges?\n• Is there any challenge you think you could do for the rest of your life?\n• Would you be willing to integrate some challenges into your life?\n• What else can you do to reduce your carbon footprint?\n\nWhat can you post on the social media, using #greendex:\n• Number of trees to plant\n• Which challenges have you decided to participate in?\n• Social pressure letter.",
          },
        ],
      },
    ],
  },
};
