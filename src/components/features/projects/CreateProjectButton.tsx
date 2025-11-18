"use client";

import type { VariantProps } from "class-variance-authority";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";

interface CreateProjectButtonProps {
  variant?: VariantProps<typeof Button>["variant"];
  showIcon?: boolean;
}

export function CreateProjectButton({
  variant = "default",
  showIcon = true,
}: CreateProjectButtonProps) {
  const t = useTranslations("project");

  return (
    <Button asChild variant={variant}>
      <Link href="/org/create-project">
        {showIcon && <Plus className="mr-2 size-4" />}
        {t("button.create-project")}
      </Link>
    </Button>
  );
}
