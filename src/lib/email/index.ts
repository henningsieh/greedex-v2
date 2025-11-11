import { render } from "@react-email/components";
import { sendEmail } from "@/lib/email/nodemailer";
import { EmailVerification } from "@/lib/email/templates/email-verification";
import { PasswordResetEmail } from "@/lib/email/templates/password-reset";

interface User {
  email: string;
  name?: string;
}

interface SendPasswordResetEmailParams {
  user: User;
  url: string;
}

/**
 * Send a password reset email to the user
 */
export async function sendPasswordResetEmail({
  user,
  url,
}: SendPasswordResetEmailParams): Promise<void> {
  try {
    console.log("📧 Sending password reset email to:", user.email);

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

    console.log("✅ Password reset email sent successfully to:", user.email);
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
 * Send an email verification email to the user
 */
export async function sendEmailVerificationEmail({
  user,
  url,
}: SendEmailVerificationEmailParams): Promise<void> {
  try {
    console.log("📧 Sending verification email to:", user.email);

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

    console.log("✅ Verification email sent successfully to:", user.email);
  } catch (error) {
    console.error("❌ Failed to send verification email:", error);
    throw error;
  }
}
