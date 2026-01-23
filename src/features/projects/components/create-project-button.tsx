"use client";

import type { VariantProps } from "class-variance-authority";

import { useTranslations } from "next-intl";

import { CREATE_PROJECT_PATH } from "@/app/routes";
import { Button } from "@/components/ui/button";
import { PROJECT_ICONS } from "@/features/projects/components/project-icons";
import { Link } from "@/lib/i18n/routing";

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
        {showIcon && <PROJECT_ICONS.addProject />}
        {t("form.new.submit.label")}
      </Link>
    </Button>
  );
}
