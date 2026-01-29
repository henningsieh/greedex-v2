/**
 * @greendex/email
 * Email sending utilities and templates
 */

// Export email sending utilities
export { sendEmail, type SendEmailOptions } from "./send";
export { createTransporter, type SmtpConfig } from "./config";

// Export utility functions
export { maskEmail } from "./utils";

// Export templates from their own module
export * from "./templates";
