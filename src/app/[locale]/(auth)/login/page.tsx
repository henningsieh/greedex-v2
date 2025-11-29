import AuthFlowLayout from "@/components/features/authentication/auth-flow-layout";
import { LoginForm } from "@/components/features/authentication/login-form";

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
