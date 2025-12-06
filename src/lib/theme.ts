export const THEMES = ["light", "dark", "system"] as const;
export type ThemeKey = (typeof THEMES)[number];

// No runtime helpers required — `ThemeKey` can be used directly.

