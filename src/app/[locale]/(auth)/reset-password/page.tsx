import { getLocale } from "next-intl/server";
import AuthFlowLayout from "@/components/features/authentication/auth-flow-layout";
import { ResetPasswordForm } from "@/components/features/authentication/reset-password-form";
import { LOGIN_PATH } from "@/lib/config/AppRoutes";
import { redirect } from "@/lib/i18n/navigation";

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
