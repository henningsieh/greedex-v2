"use client";

import type { ComponentPropsWithoutRef } from "react";

import { useTranslations } from "@greendex/i18n";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LastUsedBadgeProps extends ComponentPropsWithoutRef<typeof Badge> {
  label?: string;
}

export function LastUsedBadge({
  variant = "secondary",
  className,
  ...props
}: LastUsedBadgeProps) {
  const t = useTranslations("authentication.login");

  if (props.label === undefined) {
    props.label = t("lastUsed");
  }
  const label = props.label;

  return (
    <Badge
      className={cn(
        "absolute self-center border border-secondary bg-secondary/50 text-secondary-foreground",
        className,
      )}
      variant={variant}
      {...props}
    >
      {label}
    </Badge>
  );
}
