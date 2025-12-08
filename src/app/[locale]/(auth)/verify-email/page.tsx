// verify-email/page.tsx

import AuthFlowLayout from "@/components/features/authentication/auth-flow-layout";
import { VerifyEmailContent } from "@/components/features/authentication/verify-email-content";
import { LOGIN_PATH } from "@/lib/config/AppRoutes";

export default async function VerifyEmailPage() {
  return (
    <AuthFlowLayout backLabel="Back to login" backHref={LOGIN_PATH}>
      <VerifyEmailContent />
    </AuthFlowLayout>
  );
}
