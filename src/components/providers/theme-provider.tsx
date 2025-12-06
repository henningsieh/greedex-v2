"use client";

import { ThemeProvider as Theme } from "@/components/theme-provider";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <Theme
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </Theme>
  );
}
