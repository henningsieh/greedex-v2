"use client";

import { useTranslations } from "next-intl";
import type { ComponentPropsWithoutRef } from "react";
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
    props.label = t("last-used");
  }
  const label = props.label;

  return (
    <Badge
      variant={variant}
      className={cn(
        "-top-7.5 absolute self-center border border-secondary bg-secondary/50 text-secondary-foreground",
        className,
      )}
      {...props}
    >
      {label}
    </Badge>
  );
}
