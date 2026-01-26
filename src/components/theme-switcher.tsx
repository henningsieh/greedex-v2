"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";

import { themes, type ThemeKey } from "@/lib/themes";
import { cn } from "@/lib/utils";

export interface ThemeSwitcherProps {
  value?: ThemeKey;
  onChange?: (theme: ThemeKey) => void;
  defaultValue?: ThemeKey;
  className?: string;
}

export const ThemeSwitcher = ({
  value,
  onChange,
  defaultValue = "system",
  className,
}: ThemeSwitcherProps) => {
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("userSettings.appearance.themes");

  const { theme, setTheme } = useTheme();

  const currentTheme = value !== undefined ? value : theme;

  const handleThemeClick = useCallback(
    (themeKey: ThemeKey) => {
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
        "relative isolate flex h-8 rounded-full bg-transparent p-1 ring-1 ring-border hover:bg-accent/40 hover:ring-primary",
        className,
      )}
    >
      <motion.div
        animate={{
          x: [3.8, 26.8, 50][
            themes.findIndex((theme) => theme.key === currentTheme)
          ],
        }}
        className="absolute left-0 size-6 rounded-full bg-accent"
        style={{ top: "calc(50% - 11.5px)" }}
        transition={{
          type: "spring",
          duration: 0.3,
        }}
      />
      {themes.map(({ key, icon: Icon }) => {
        const isActive = currentTheme === key;

        return (
          <button
            aria-label={t(key)}
            title={t(key)}
            className="relative size-6 rounded-full outline-none hover:bg-primary/60 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            key={key}
            onClick={() => handleThemeClick(key)}
            type="button"
          >
            <Icon
              className={cn(
                "relative m-auto size-4",
                isActive
                  ? "text-accent-foreground"
                  : "text-muted-foreground hover:text-primary-foreground",
              )}
              strokeWidth="2.6"
            />
          </button>
        );
      })}
    </div>
  );
};
