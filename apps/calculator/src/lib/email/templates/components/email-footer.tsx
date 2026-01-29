import { Hr, Section, Text } from "@react-email/components";

import { emailColors, emailSpacing } from "../../config/styles";

const footerStyles = {
  greeting: {
    color: "#9ca3af",
    fontSize: "13px",
    lineHeight: "1.4",
    margin: "0 0 24px 0",
  },
  brand: {
    color: emailColors.light.foreground,
    fontSize: "22px",
    fontWeight: "600",
    lineHeight: "1.2",
    margin: "0 0 4px 0",
    letterSpacing: "-0.3px",
  },
  subtitle: {
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "1.4",
    margin: "0 0 32px 0",
  },
  mission: {
    color: "#4b5563",
    fontSize: "14px",
    lineHeight: "1.6",
    margin: "0 0 28px 0",
  },
  erasmus: {
    color: "#9ca3af",
    fontSize: "12px",
    lineHeight: "1.4",
    margin: "0 0 28px 0",
  },
  contact: {
    color: "#6b7280",
    fontSize: "13px",
    lineHeight: "2",
    margin: "0 0 28px 0",
  },
  contactLink: {
    color: "#6b7280",
    textDecoration: "none",
  },
  contactLinkAccent: {
    color: emailColors.light.accent,
    textDecoration: "none",
  },
  quote: {
    color: "#9ca3af",
    fontSize: "13px",
    fontStyle: "italic",
    lineHeight: "1.5",
    margin: "0",
  },
} as const;

export function EmailFooter() {
  return (
    <>
      <Hr className="email-hr" style={emailSpacing.hr} />
      <Section>
        <Text style={footerStyles.greeting}>Best regards,</Text>
        <Text style={footerStyles.brand}>Greendex</Text>
        <Text style={footerStyles.subtitle}>
          Carbon Footprint & Sustainability Awareness Initiative
        </Text>
        <Text style={footerStyles.mission}>
          🌱 Helping communities calculate and offset carbon footprints through
          tree planting and education
        </Text>
        <Text style={footerStyles.erasmus}>
          Erasmus+ Strategic Partnership Project
        </Text>
        <Text style={footerStyles.contact}>
          <a href="mailto:info@greendex.world" style={footerStyles.contactLink}>
            info@greendex.world
          </a>
          {" · "}
          <a href="https://greendex.world" style={footerStyles.contactLinkAccent}>
            greendex.world
          </a>
        </Text>
        <Text style={footerStyles.quote}>
          "Empowering sustainable habits and greener mobility."
        </Text>
      </Section>
    </>
  );
}
