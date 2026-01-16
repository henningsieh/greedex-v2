import { Section } from "@react-email/components";
import { EmailButton } from "../components/email-button";
import { EmailCode } from "../components/email-code";
import { EmailHeading } from "../components/email-heading";
import { EmailText } from "../components/email-text";
import { emailSpacing } from "../config/styles";
import { EmailLayout } from "./components/email-layout";

interface EmailVerificationProps {
  userName?: string;
  verificationUrl: string;
}

export function EmailVerification({
  userName,
  verificationUrl,
}: EmailVerificationProps) {
  return (
    <EmailLayout previewText="Verify your email address to complete your Greendex registration">
      <EmailHeading>Verify Your Email Address</EmailHeading>
      <EmailText>{userName ? `Hi ${userName},` : "Hi there,"}</EmailText>
      <EmailText>
        Thank you for signing up! Please verify your email address to complete
        your registration and get started.
      </EmailText>
      <Section style={emailSpacing.section}>
        <EmailButton href={verificationUrl}>Verify Email Address</EmailButton>
      </Section>
      <EmailText variant="muted">
        If the button doesn't work, copy and paste this link into your browser:
      </EmailText>
      <EmailCode>{verificationUrl}</EmailCode>
      <EmailText variant="muted">
        If you didn't create an account, you can safely ignore this email.
      </EmailText>
      <EmailText variant="small">
        This verification link will expire in 24 hours.
      </EmailText>
    </EmailLayout>
  );
}
