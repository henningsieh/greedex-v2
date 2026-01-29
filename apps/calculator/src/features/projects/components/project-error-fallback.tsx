"use client";

import { useTranslations } from "@greendex/i18n/client";
import { ORPCError } from "@orpc/client";
import { toast } from "sonner";

import type { ErrorCode } from "@/lib/orpc/context";

import { PROJECTS_PATH } from "@/app/routes";
import { useRouter } from "@/lib/i18n/routing";

/**
 * Determines whether a value is an ORPCError with a known ErrorCode.
 *
 * Narrows the input to `ORPCError<ErrorCode, unknown>` when true.
 *
 * @param error - The value to test
 * @returns `true` if `error` is an `ORPCError` whose code is part of `ErrorCode`, `false` otherwise.
 */
function isDefinedORPCError(
  error: unknown,
): error is ORPCError<ErrorCode, unknown> {
  return error instanceof ORPCError;
}

/**
 * Render an error UI for the project details view and handle specific ORPC errors by showing a localized toast and navigating away.
 *
 * @param error - The error encountered while rendering project details.
 * @returns A JSX element with a localized default error message, or `null` when navigation is performed for ORPC `NOT_FOUND` or `FORBIDDEN` errors.
 */
export function ErrorFallback({ error }: { error: unknown }) {
  const router = useRouter();
  const t = useTranslations("project.details.errors");

  if (isDefinedORPCError(error)) {
    console.error("ORPC Error in Project Details Page:", error);
    if (error.code === "NOT_FOUND") {
      toast.error(t("project-not-found"));
      router.push(PROJECTS_PATH);
      return null;
    }
    if (error.code === "FORBIDDEN") {
      toast.error(t("project-access-denied"));
      router.push(PROJECTS_PATH);
      return null;
    }
  }
  return <div>{t("default-error")}</div>;
}
