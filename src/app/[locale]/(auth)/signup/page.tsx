import AuthFlowLayout from "@/components/features/authentication/auth-flow-layout";
import { SignupForm } from "@/components/features/authentication/signup-form";

export default function SignupPage() {
  return (
    <AuthFlowLayout>
      <SignupForm />
    </AuthFlowLayout>
  );
}
