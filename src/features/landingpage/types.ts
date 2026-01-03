/**
 * Landing Page Types
 *
 * Type definitions for landing page components
 */

/**
 * Navigation item for header menu
 */
export interface NavItem {
  href: string;
  label: string;
}

/**
 * Hero section props
 */
export interface HeroProps {
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaHref?: string;
}
