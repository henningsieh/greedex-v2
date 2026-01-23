import AuthFlowLayout from "@/features/authentication/components/auth-flow-layout";
import { SignupForm } from "@/features/authentication/components/signup-form";

interface SignupPageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const nextPageUrl = (await searchParams).nextPageUrl;
  return (
    <AuthFlowLayout>
      <SignupForm nextPageUrl={nextPageUrl} />
    </AuthFlowLayout>
  );
}
