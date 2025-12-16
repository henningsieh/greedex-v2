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
  const t = useTranslations("project.details");

  if (isDefinedORPCError(error)) {
    console.error("ORPC Error in Project Details Page:", error);
    // Now error.code is type-safe!
    if (error.code === "NOT_FOUND") {
      notFound();
    } else if (error.code === "FORBIDDEN") {
      toast.error("You don't have access to this project");
      router.push(PROJECTS_PATH);
      return null;
    }
  }
  return <div>{t("error")}</div>;
}
