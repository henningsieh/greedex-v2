import { getTranslations } from "@greendex/i18n";

import { LOGIN_PATH } from "@/app/routes";
import AuthFlowLayout from "@/features/authentication/components/auth-flow-layout";
import { VerifyEmailContent } from "@/features/authentication/components/verify-email-content";

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
