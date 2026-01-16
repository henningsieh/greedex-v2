import { Text } from "@react-email/components";
import type { CSSProperties } from "react";

import { emailTypography } from "../config/styles";

interface EmailTextProps {
  children: React.ReactNode;
  variant?: "normal" | "muted" | "small";
}

export function EmailText({ children, variant = "normal" }: EmailTextProps) {
  const className = variant === "normal" ? "email-text" : "email-text-muted";

  let styles: CSSProperties = emailTypography.text;
  if (variant === "muted") {
    styles = emailTypography.textMuted;
  } else if (variant === "small") {
    styles = emailTypography.textSmall;
  }

  return (
    <Text className={className} style={styles}>
      {children}
    </Text>
  );
}
