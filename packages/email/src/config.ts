/**
 * Nodemailer configuration
 * Creates and manages SMTP transporter
 */
import type { Transporter } from "nodemailer";
import nodemailer from "nodemailer";

/**
 * SMTP configuration options
 */
export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

/**
 * Create a nodemailer transporter with the given configuration
 */
export function createTransporter(config: SmtpConfig): Transporter {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });
}

// Store the transporter instance for reuse
let _transporter: Transporter | null = null;

/**
 * Get or create a transporter instance
 */
export function getTransporter(config: SmtpConfig): Transporter {
  if (!_transporter) {
    _transporter = createTransporter(config);
  }
  return _transporter;
}
