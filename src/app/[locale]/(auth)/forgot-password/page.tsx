import AuthFlowLayout from "@/components/features/authentication/auth-flow-layout";
import { ForgotPasswordForm } from "@/components/features/authentication/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthFlowLayout>
      <ForgotPasswordForm />
    </AuthFlowLayout>
  );
}
