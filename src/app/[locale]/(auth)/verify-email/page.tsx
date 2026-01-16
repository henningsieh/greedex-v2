import { LOGIN_PATH } from "@/app/routes";
import AuthFlowLayout from "@/components/features/authentication/auth-flow-layout";
import { VerifyEmailContent } from "@/components/features/authentication/verify-email-content";
import { getTranslations } from "next-intl/server";

/**
 * Renders the verify-email page inside the authentication flow layout.
 *
 * @returns A React element containing an AuthFlowLayout configured with a localized back link and the VerifyEmailContent component.
 */
export default async function VerifyEmailPage() {
  const t = await getTranslations("authentication.common");

  return (
    <AuthFlowLayout backHref={LOGIN_PATH} backLabel={t("backToLogin")}>
      <VerifyEmailContent />
    </AuthFlowLayout>
  );
}
