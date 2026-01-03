import { getTranslations } from "next-intl/server";
import { LOGIN_PATH } from "@/app/routes";
import AuthFlowLayout from "@/components/features/authentication/auth-flow-layout";
import { VerifyEmailContent } from "@/components/features/authentication/verify-email-content";

export default async function VerifyEmailPage() {
  const t = await getTranslations("authentication.common");

  return (
    <AuthFlowLayout backHref={LOGIN_PATH} backLabel={t("backToLogin")}>
      <VerifyEmailContent />
    </AuthFlowLayout>
  );
}
