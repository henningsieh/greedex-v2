"use client";

import type { VariantProps } from "class-variance-authority";
import { MapPinPlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/routing";
import { CREATE_PROJECT_PATH } from "@/lib/utils/app-routes";

interface CreateProjectButtonProps {
  variant?: VariantProps<typeof Button>["variant"];
  showIcon?: boolean;
  className?: string;
}

export function CreateProjectButton({
  variant = "secondary",
  showIcon = true,
  className,
}: CreateProjectButtonProps) {
  const t = useTranslations("organization.projects");

  return (
    <Button asChild className={className} variant={variant}>
      <Link href={CREATE_PROJECT_PATH}>
        {showIcon && <MapPinPlusIcon />}
        {t("form.new.submit.label")}
      </Link>
    </Button>
  );
}
