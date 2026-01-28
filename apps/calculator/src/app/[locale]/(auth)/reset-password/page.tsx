import { getLocale } from "@greendex/i18n/server";

import { LOGIN_PATH } from "@/app/routes";
import AuthFlowLayout from "@/features/authentication/components/auth-flow-layout";
import { ResetPasswordForm } from "@/features/authentication/components/reset-password-form";
import { redirect } from "@/lib/i18n/routing";

interface ResetPasswordPageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const locale = await getLocale();
  const token = params.token;

  // If no token is provided, redirect to forgot password page
  if (!token || typeof token !== "string") {
    return redirect({
      href: LOGIN_PATH,
      locale,
    });
  }

  return (
    <AuthFlowLayout>
      <ResetPasswordForm token={token} />
    </AuthFlowLayout>
  );
}
