import { render } from "@react-email/components";
import nodemailer from "nodemailer";

import { EmailVerification } from "../src/lib/email/templates/email-verification";
import { OrganizationInvitation } from "../src/lib/email/templates/organization-invitation";
import { PasswordResetEmail } from "../src/lib/email/templates/password-reset";

// SMTP configuration from .env
const transporter = nodemailer.createTransport({
  host: "mail.sieh.org",
  port: 587,
  secure: false,
  auth: {
    user: "henning@sieh.org",
    pass: "15,%,aniFtSMu",
  },
});

async function sendTestEmails() {
  const testRecipient = "henning@sieh.org";

  try {
    // Test 1: Email Verification
    console.log("Sending email verification test...");
    const verificationHtml = await render(
      <EmailVerification
        userName="Henning Sieh"
        verificationUrl="https://greendex.world/verify?token=test123"
      />,
    );

    await transporter.sendMail({
      from: "greendex@sieh.org",
      to: testRecipient,
      subject: "Test: Verify Your Greendex Email Address",
      html: verificationHtml,
    });

    // Test 2: Password Reset
    console.log("Sending password reset test...");
    const resetHtml = await render(
      <PasswordResetEmail
        resetUrl="https://greendex.world/reset-password?token=test456"
        userName="Henning Sieh"
      />,
    );

    await transporter.sendMail({
      from: "greendex@sieh.org",
      to: testRecipient,
      subject: "Test: Reset Your Greendex Password",
      html: resetHtml,
    });

    // Test 3: Organization Invitation
    console.log("Sending organization invitation test...");
    const invitationHtml = await render(
      <OrganizationInvitation
        inviteLink="https://greendex.world/invite/accept?token=test789"
        inviterName="Anna Schmidt"
        organizationName="GreenTech Solutions"
      />,
    );

    await transporter.sendMail({
      from: "greendex@sieh.org",
      to: testRecipient,
      subject: "Test: Join GreenTech Solutions on Greendex",
      html: invitationHtml,
    });

    console.log("✅ All test emails sent successfully!");
    console.log(`📧 Check your inbox at ${testRecipient}`);
  } catch (error) {
    console.error("❌ Error sending test emails:", error);
    process.exit(1);
  }
}

sendTestEmails();
