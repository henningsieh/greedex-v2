import type React from "react";

import { cn } from "@/lib/utils";

interface ContentContainerProps {
  width?: "sm" | "md" | "lg" | "xl" | "full";
  children: React.ReactNode;
  className?: string;
}

const widthClasses = {
  sm: "max-w-3xl", // Forms, settings (768px)
  md: "max-w-4xl", // Text-heavy content (896px)
  lg: "max-w-6xl", // Mixed content (1152px)
  xl: "max-w-7xl", // Dashboards, wide tables (1280px)
  full: "w-full", // No constraint
};

/**
 * Smart width container component that applies appropriate max-width based on content type.
 * Automatically adds responsive horizontal padding.
 *
 * @example
 * ```tsx
 * // For forms
 * <ContentContainer width="sm">
 *   <MyForm />
 * </ContentContainer>
 *
 * // For data tables
 * <ContentContainer width="xl">
 *   <DataTable />
 * </ContentContainer>
 * ```
 */
export function ContentContainer({
  width = "xl",
  children,
  className,
}: ContentContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto px-4 sm:px-6 lg:px-8",
        widthClasses[width],
        className,
      )}
    >
      {children}
    </div>
  );
}
