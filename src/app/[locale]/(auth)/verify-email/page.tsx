// verify-email/page.tsx

import AuthFlowLayout from "@/components/features/authentication/auth-flow-layout";
import { VerifyEmailContent } from "@/components/features/authentication/verify-email-content";

export default function VerifyEmailPage() {
  return (
    <AuthFlowLayout backLabel="Back to login" backHref="/login">
      <VerifyEmailContent />
    </AuthFlowLayout>
  );
}
