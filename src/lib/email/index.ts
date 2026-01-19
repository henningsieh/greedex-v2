import { render } from "@react-email/components";

import { sendEmail } from "@/lib/email/nodemailer";
import { EmailVerification } from "@/lib/email/templates/email-verification";
import { OrganizationInvitation } from "@/lib/email/templates/organization-invitation";
import { PasswordResetEmail } from "@/lib/email/templates/password-reset";
import { maskEmail } from "@/lib/email/utils";

interface User {
  email: string;
  name?: string;
}

interface SendPasswordResetEmailParams {
  user: User;
  url: string;
}

/**
 * Send a password reset email to the specified user.
 *
 * @param user - The recipient user (must include `email`; `name` is optional and used in the template)
 * @param url - The password reset URL to include in the email
 */
export async function sendPasswordResetEmail({
  user,
  url,
}: SendPasswordResetEmailParams): Promise<void> {
  try {
    console.log("📧 Sending password reset email to:", maskEmail(user.email));

    const emailHtml = await render(
      PasswordResetEmail({
        userName: user.name,
        resetUrl: url,
      }),
    );

    await sendEmail({
      to: user.email,
      subject: "Reset Your Password",
      html: emailHtml,
    });

    console.log(
      "✅ Password reset email sent successfully to:",
      maskEmail(user.email),
    );
  } catch (error) {
    console.error("❌ Failed to send password reset email:", error);
    throw error;
  }
}

interface SendEmailVerificationEmailParams {
  user: User;
  url: string;
}

/**
 * Sends an email verification message to the specified user.
 *
 * @param user - The recipient user (must include `email`; `name` is optional and used in the template).
 * @param url - The verification link to include in the email
 */
export async function sendEmailVerificationEmail({
  user,
  url,
}: SendEmailVerificationEmailParams): Promise<void> {
  try {
    console.log("📧 Sending verification email to:", maskEmail(user.email));

    const emailHtml = await render(
      EmailVerification({
        userName: user.name,
        verificationUrl: url,
      }),
    );

    await sendEmail({
      to: user.email,
      subject: "Verify Your Email Address",
      html: emailHtml,
    });

    console.log(
      "✅ Verification email sent successfully to:",
      maskEmail(user.email),
    );
  } catch (error) {
    console.error("❌ Failed to send verification email:", error);
    throw error;
  }
}

interface SendOrganizationInvitationParams {
  email: string;
  inviteLink: string;
  organizationName: string;
  inviterName?: string;
}

/**
 * Sends an email inviting a recipient to join an organization.
 *
 * @param email - Recipient email address
 * @param inviteLink - URL the recipient can use to accept the invitation
 * @param organizationName - Name of the organization the recipient is invited to
 * @param inviterName - Optional name of the person who sent the invitation
 * @throws Propagates any error encountered while rendering or sending the email
 */
/**
 * Sends an invitation email asking the recipient to join the specified organization.
 *
 * @param email - Recipient's email address
 * @param inviteLink - URL the recipient can follow to accept the invitation
 * @param organizationName - Name of the organization the recipient is invited to join
 * @param inviterName - Optional name of the person who sent the invitation (displayed in the email)
 */
export async function sendOrganizationInvitation({
  email,
  inviteLink,
  organizationName,
  inviterName,
}: SendOrganizationInvitationParams): Promise<void> {
  try {
    console.log("📧 Sending organization invitation to:", maskEmail(email));
    const emailHtml = await render(
      OrganizationInvitation({
        organizationName,
        inviterName,
        inviteLink,
      }),
    );

    await sendEmail({
      to: email,
      subject: `You're invited to join ${organizationName}`,
      html: emailHtml,
    });

    console.log("✅ Invitation email sent successfully to:", maskEmail(email));
  } catch (error) {
    console.error("❌ Failed to send invitation email:", error);
    throw error;
  }
}
