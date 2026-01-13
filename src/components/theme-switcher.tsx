"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const themes = [
  {
    key: "light",
    icon: Sun,
    label: "Light theme",
  },
  {
    key: "dark",
    icon: Moon,
    label: "Dark theme",
  },
  {
    key: "system",
    icon: Monitor,
    label: "System theme",
  },
];

export interface ThemeSwitcherProps {
  value?: "light" | "dark" | "system";
  onChange?: (theme: "light" | "dark" | "system") => void;
  defaultValue?: "light" | "dark" | "system";
  className?: string;
}

export const ThemeSwitcher = ({
  value,
  onChange,
  defaultValue = "system",
  className,
}: ThemeSwitcherProps) => {
  const [mounted, setMounted] = useState(false);

  const { theme, setTheme } = useTheme();

  const currentTheme = value !== undefined ? value : theme;

  const handleThemeClick = useCallback(
    (themeKey: "light" | "dark" | "system") => {
      if (onChange) {
        onChange(themeKey);
      } else {
        setTheme(themeKey);
      }
    },
    [onChange, setTheme],
  );

  // Set default theme if not already set
  useEffect(() => {
    if (defaultValue && !theme && mounted) {
      setTheme(defaultValue);
    }
  }, [defaultValue, theme, setTheme, mounted]);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative isolate flex h-8 rounded-full bg-transparent p-1 ring-1 ring-border hover:ring-primary",
        className,
      )}
    >
      <motion.div
        animate={{
          x: [3.8, 26.8, 50][themes.findIndex((t) => t.key === currentTheme)],
        }}
        className="absolute left-0 h-6 w-6 rounded-full bg-accent"
        style={{ top: "calc(50% - 11.5px)" }}
        transition={{
          type: "spring",
          duration: 0.3,
        }}
      />
      {themes.map(({ key, icon: Icon, label }) => {
        const isActive = currentTheme === key;

        return (
          <button
            aria-label={label}
            className="relative size-6 rounded-full outline-none hover:bg-accent/40 focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring/50"
            key={key}
            onClick={() => handleThemeClick(key as "light" | "dark" | "system")}
            type="button"
          >
            <Icon
              className={cn(
                "relative m-auto h-4 w-4",
                isActive ? "text-accent-foreground" : "text-muted-foreground",
              )}
              strokeWidth="2.6"
            />
          </button>
        );
      })}
    </div>
  );
};
