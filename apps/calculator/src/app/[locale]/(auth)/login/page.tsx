import AuthFlowLayout from "@/features/authentication/components/auth-flow-layout";
import { LoginForm } from "@/features/authentication/components/login-form";

interface LoginPageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const nextPageUrl = (await searchParams).nextPageUrl;
  return (
    <AuthFlowLayout>
      <LoginForm nextPageUrl={nextPageUrl} />
    </AuthFlowLayout>
  );
}
