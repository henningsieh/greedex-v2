import AuthFlowLayout from "@/features/authentication/components/auth-flow-layout";
import { ForgotPasswordForm } from "@/features/authentication/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthFlowLayout>
      <ForgotPasswordForm />
    </AuthFlowLayout>
  );
}
