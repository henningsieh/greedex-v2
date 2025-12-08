"use client";

import type { VariantProps } from "class-variance-authority";
import { MapPinPlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CREATE_PROJECT_PATH } from "@/lib/config/AppRoutes";
import { Link } from "@/lib/i18n/navigation";

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
    <Button asChild variant={variant} className={className}>
      <Link href={CREATE_PROJECT_PATH}>
        {showIcon && <MapPinPlusIcon />}
        {t("form.new.submit.label")}
      </Link>
    </Button>
  );
}
