/**
 * Email sending utility
 */
import type { Transporter } from "nodemailer";

import { maskEmail } from "./utils";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email via the configured SMTP transporter.
 *
 * The function logs the send attempt (with recipient addresses masked for privacy),
 * sends the message using the configured SMTP sender, logs the resulting messageId on success,
 * and re-throws any error encountered.
 *
 * @param options - Email send options including recipients and content
 * @param options.to - Recipient address or list of addresses
 * @param options.subject - Message subject line
 * @param options.html - HTML body of the message
 * @param options.text - Optional plain-text body of the message
 * @param transporter - Nodemailer transporter instance
 * @param sender - Sender email address
 * @throws Propagates any error thrown by the transport when sending fails
 */
export async function sendEmail(
  options: SendEmailOptions,
  transporter: Transporter,
  sender: string,
): Promise<void> {
  try {
    const maskedTo = Array.isArray(options.to)
      ? options.to.map(maskEmail)
      : maskEmail(options.to);

    console.log("📮 Attempting to send email:", {
      to: maskedTo,
      subject: options.subject,
      from: sender,
    });

    const result = await transporter.sendMail({
      from: sender,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log("✉️ Email sent successfully:", result.messageId);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error;
  }
}
