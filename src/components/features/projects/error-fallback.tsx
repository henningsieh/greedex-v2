"use client";

import { ORPCError } from "@orpc/client";
import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PROJECTS_PATH } from "@/config/AppRoutes";
import { useRouter } from "@/lib/i18n/routing";
import type { ErrorCode } from "@/lib/orpc/router";

/**
 * Type guard to check if error is an ORPCError with defined error codes
 */
function isDefinedORPCError(
  error: unknown,
): error is ORPCError<ErrorCode, unknown> {
  return error instanceof ORPCError;
}

export function ErrorFallback({ error }: { error: Error }) {
  const router = useRouter();
  const t = useTranslations("project.errors");

  if (isDefinedORPCError(error)) {
    console.error("ORPC Error in Project Details Page:", error);
    if (error.code === "NOT_FOUND") {
      toast.error(t("project-not-found"));
      notFound();
    } else if (error.code === "FORBIDDEN") {
      toast.error(t("project-access-denied"));
      router.push(PROJECTS_PATH);
      return null;
    }
  }
  return <div>{t("default-error")}</div>;
}
