import { Section } from "@react-email/components";

import { EmailButton } from "../components/email-button";
import { EmailCode } from "../components/email-code";
import { EmailHeading } from "../components/email-heading";
import { EmailText } from "../components/email-text";
import { emailSpacing } from "../config/styles";
import { EmailLayout } from "./components/email-layout";

interface PasswordResetEmailProps {
  userName?: string;
  resetUrl: string;
}

export function PasswordResetEmail({
  userName,
  resetUrl,
}: PasswordResetEmailProps) {
  return (
    <EmailLayout previewText="Reset your Greendex password - link expires in 24 hours">
      <EmailHeading>Reset Your Password</EmailHeading>
      <EmailText>{userName ? `Hi ${userName},` : "Hi there,"}</EmailText>
      <EmailText>
        We received a request to reset your password. Click the button below to
        create a new password:
      </EmailText>
      <Section style={emailSpacing.section}>
        <EmailButton href={resetUrl}>Reset Password</EmailButton>
      </Section>
      <EmailText variant="muted">
        If the button doesn't work, copy and paste this link into your browser:
      </EmailText>
      <EmailCode>{resetUrl}</EmailCode>
      <EmailText variant="muted">
        If you didn't request a password reset, you can safely ignore this email.
        Your password will remain unchanged.
      </EmailText>
      <EmailText variant="small">
        This link will expire in 24 hours for security reasons.
      </EmailText>
    </EmailLayout>
  );
}
