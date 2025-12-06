import type { Transporter } from "nodemailer";
import nodemailer from "nodemailer";
import { env } from "@/env";
import { maskEmail } from "@/lib/email/utils";

let transporter: Transporter | null = null;

/**
 * Get or create the Nodemailer transporter instance
 */
function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USERNAME,
        pass: env.SMTP_PASSWORD,
      },
    });
  }
  return transporter;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using Nodemailer
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  try {
    const transport = getTransporter();

    const maskedTo = Array.isArray(options.to)
      ? options.to.map(maskEmail)
      : maskEmail(options.to);

    console.log("📮 Attempting to send email:", {
      to: maskedTo,
      subject: options.subject,
      from: env.SMTP_SENDER,
    });

    const result = await transport.sendMail({
      from: env.SMTP_SENDER,
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
