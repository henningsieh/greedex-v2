/**
 * Landing Page Constants
 *
 * Configuration and constants for landing page components
 */

import type { LogoCustomer, NavItem } from "@/features/landingpage/types";

/**
 * Main navigation items
 */
export const NAVIGATION_ITEMS: NavItem[] = [
  { href: "#features", label: "Features" },
  { href: "#about", label: "About" },
  { href: "#workshops", label: "Workshops" },
  { href: "/auth/sign-in", label: "Sign In" },
];

/**
 * Customer/partner logos displayed on landing page
 */
export const LOGO_CUSTOMERS: LogoCustomer[] = [
  {
    alt: "Nvidia Logo",
    src: "https://html.tailus.io/blocks/customers/nvidia.svg",
    width: 64,
    height: 20,
    className: "h-5",
  },
  {
    alt: "Column Logo",
    src: "https://html.tailus.io/blocks/customers/column.svg",
    width: 64,
    height: 16,
  },
  {
    alt: "GitHub Logo",
    src: "https://html.tailus.io/blocks/customers/github.svg",
    width: 64,
    height: 16,
  },
  {
    alt: "Nike Logo",
    src: "https://html.tailus.io/blocks/customers/nike.svg",
    width: 64,
    height: 20,
    className: "h-5",
  },
  {
    alt: "Amazon Logo",
    src: "https://html.tailus.io/blocks/customers/amazon.svg",
    width: 64,
    height: 16,
  },
  {
    alt: "Toyota Logo",
    src: "https://html.tailus.io/blocks/customers/toyota.svg",
    width: 64,
    height: 16,
  },
  {
    alt: "Airbus Logo",
    src: "https://html.tailus.io/blocks/customers/airbus.svg",
    width: 64,
    height: 16,
  },
  {
    alt: "Sephora Logo",
    src: "https://html.tailus.io/blocks/customers/sephora.svg",
    width: 64,
    height: 16,
  },
];
