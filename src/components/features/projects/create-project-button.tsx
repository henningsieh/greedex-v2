"use client";

import type { VariantProps } from "class-variance-authority";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
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
  const t = useTranslations("project");

  return (
    <Button asChild variant={variant} className={className}>
      <Link href="/org/create-project">
        {showIcon && <PlusIcon />}
        {t("create.form.submit.label")}
      </Link>
    </Button>
  );
}
