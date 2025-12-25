// verify-email/page.tsx

import { getTranslations } from "next-intl/server";
import AuthFlowLayout from "@/components/features/authentication/auth-flow-layout";
import { VerifyEmailContent } from "@/components/features/authentication/verify-email-content";
import { LOGIN_PATH } from "@/config/app-routes";

export default async function VerifyEmailPage() {
  const t = await getTranslations("authentication.verifyEmail");

  return (
    <AuthFlowLayout backHref={LOGIN_PATH} backLabel={t("backToLogin")}>
      <VerifyEmailContent />
    </AuthFlowLayout>
  );
}
