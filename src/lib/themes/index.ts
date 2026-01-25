import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

export const THEMES = [
  {
    key: "light",
    icon: SunIcon,
  },
  {
    key: "dark",
    icon: MoonIcon,
  },
  {
    key: "system",
    icon: MonitorIcon,
  },
] as const;

export type ThemeKey = (typeof THEMES)[number]["key"];
export const themes = THEMES; // Reusable themes array
