/**
 * Centralized email styles configuration
 * Single source of truth for all email styling
 *
 * WHY SEPARATE FROM globals.css:
 * Emails are rendered as standalone HTML documents sent via SMTP.
 * They CANNOT reference external CSS files or use app stylesheets.
 * All styles must be inline or embedded in <style> tags within the email HTML.
 *
 * Email clients (Gmail, Outlook, Thunderbird) have limited CSS support:
 * - No external stylesheets
 * - No CSS variables (--var)
 * - No modern selectors
 * - Aggressive style stripping
 *
 * React Email's Tailwind is just a convenience - it generates inline styles.
 * The CSS here is embedded in each email for maximum compatibility.
 */

export const emailColors = {
  // Light mode
  light: {
    background: "#fbfbfb",
    foreground: "#5e5e5e",
    card: "#ffffff",
    cardForeground: "#5e5e5e",
    primary: "#42a869",
    primaryForeground: "#ffffff",
    secondary: "#8491d8",
    secondaryForeground: "#f4f5fb",
    muted: "#f0efea",
    mutedForeground: "#706f69",
    accent: "#4db376",
    accentForeground: "#f7f7f7",
    border: "#dfdfdf",
  },
  // Dark mode
  dark: {
    background: "#0a0a0a",
    foreground: "#e0e0e0",
    card: "#1f1f1f",
    cardForeground: "#e0e0e0",
    primary: "#42a869",
    primaryForeground: "#ffffff",
    secondary: "#8491d8",
    secondaryForeground: "#f4f5fb",
    muted: "#2a2a2a",
    mutedForeground: "#b0b0b0",
    accent: "#6fd89a",
    accentForeground: "#f7f7f7",
    border: "#404040",
  },
} as const;

export const emailFonts = {
  sans: ["Comfortaa", "ui-sans-serif", "system-ui"],
  serif: ["Source Serif 4", "serif"],
  mono: ["JetBrains Mono", "monospace"],
} as const;

export const emailTypography = {
  heading: {
    fontSize: "30px",
    fontWeight: "600",
    lineHeight: "1.2",
    letterSpacing: "-0.5px",
    marginBottom: "32px",
    color: emailColors.light.foreground,
  },
  text: {
    fontSize: "16px",
    lineHeight: "1.6",
    marginBottom: "24px",
    color: emailColors.light.foreground,
  },
  textMuted: {
    fontSize: "14px",
    lineHeight: "1.6",
    marginBottom: "16px",
    color: emailColors.light.mutedForeground,
  },
  textSmall: {
    fontSize: "12px",
    lineHeight: "1.5",
    marginBottom: "0",
    color: emailColors.light.mutedForeground,
  },
  code: {
    fontSize: "14px",
    lineHeight: "1.5",
    fontFamily: emailFonts.mono.join(", "),
    backgroundColor: emailColors.light.muted,
    color: emailColors.light.accent,
    padding: "12px 16px",
    borderRadius: "6px",
    wordBreak: "break-all" as const,
  },
} as const;

export const emailButton = {
  backgroundColor: emailColors.light.primary,
  color: emailColors.light.primaryForeground,
  fontSize: "16px",
  fontWeight: "600",
  padding: "16px 32px",
  borderRadius: "8px",
  textDecoration: "none",
  display: "inline-block",
  border: `2px solid ${emailColors.light.primary}`,
} as const;

export const emailSpacing = {
  section: {
    textAlign: "center" as const,
  },
  hr: {
    borderColor: emailColors.light.border,
    marginTop: "32px",
    marginBottom: "32px",
  },
} as const;

export const emailLayout = {
  container: {
    backgroundColor: emailColors.light.card,
    borderRadius: "12px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  body: {
    backgroundColor: emailColors.light.background,
    fontFamily: emailFonts.sans.join(", "),
  },
} as const;

/**
 * Generate CSS for dark mode support
 */
export function generateDarkModeCSS(): string {
  return `
    /* Force button colors - NEVER change on visited/hover/active */
    a[class~="email-btn"],
    a[class~="email-btn"]:visited,
    a[class~="email-btn"]:hover,
    a[class~="email-btn"]:active {
      background: ${emailColors.light.primary} !important;
      background-color: ${emailColors.light.primary} !important;
      border: 2px solid ${emailColors.light.primary} !important;
      color: ${emailColors.light.primaryForeground} !important;
      -webkit-text-fill-color: ${emailColors.light.primaryForeground} !important;
    }
    
    @media (prefers-color-scheme: dark) {
      body { 
        background-color: ${emailColors.dark.background} !important; 
      }
      table[class~="email-container"] { 
        background-color: ${emailColors.dark.card} !important; 
      }
      p[class~="email-text"], 
      h1[class~="email-heading"], 
      h2[class~="email-heading"], 
      h3[class~="email-heading"] { 
        color: ${emailColors.dark.foreground} !important; 
      }
      p[class~="email-text-muted"] { 
        color: ${emailColors.dark.mutedForeground} !important; 
      }
      p[class~="email-code"] { 
        background-color: ${emailColors.dark.muted} !important; 
        color: ${emailColors.dark.accent} !important; 
      }
      a[class~="email-link"], 
      strong[class~="email-link"] { 
        color: ${emailColors.dark.accent} !important; 
      }
      hr[class~="email-hr"] { 
        border-color: ${emailColors.dark.border} !important; 
      }
      
      /* Ensure buttons NEVER change in dark mode - all states */
      a[class~="email-btn"],
      a[class~="email-btn"]:visited,
      a[class~="email-btn"]:hover,
      a[class~="email-btn"]:active {
        background: ${emailColors.dark.primary} !important;
        background-color: ${emailColors.dark.primary} !important;
        color: ${emailColors.dark.primaryForeground} !important;
        -webkit-text-fill-color: ${emailColors.dark.primaryForeground} !important;
        border: 2px solid ${emailColors.dark.primary} !important;
      }
    }
  `;
}

/**
 * Generate Tailwind config for email templates
 */
export function getTailwindConfig() {
  return {
    theme: {
      extend: {
        colors: {
          background: emailColors.light.background,
          foreground: emailColors.light.foreground,
          card: emailColors.light.card,
          "card-foreground": emailColors.light.cardForeground,
          primary: emailColors.light.primary,
          "primary-foreground": emailColors.light.primaryForeground,
          secondary: emailColors.light.secondary,
          "secondary-foreground": emailColors.light.secondaryForeground,
          muted: emailColors.light.muted,
          "muted-foreground": emailColors.light.mutedForeground,
          accent: emailColors.light.accent,
          "accent-foreground": emailColors.light.accentForeground,
          border: emailColors.light.border,
        },
        fontFamily: {
          sans: emailFonts.sans,
          serif: emailFonts.serif,
          mono: emailFonts.mono,
        },
      },
    },
  };
}
