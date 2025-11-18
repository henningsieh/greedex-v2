import BackToHome from "@/components/back-to-home";
import { LoginForm } from "@/components/features/authentication/login-form";
import RightSideImage from "@/components/features/authentication/right-side-image";

interface LoginPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const nextPageUrl = (await searchParams).nextPageUrl;
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative flex flex-col p-6 md:p-10">
        <div className="absolute top-6 left-6 z-10">
          <BackToHome />
        </div>
        <div className="flex flex-1 justify-center pt-12">
          <div className="w-full max-w-lg">
            <LoginForm nextPageUrl={nextPageUrl} />
          </div>
        </div>
      </div>
      <RightSideImage />
    </div>
  );
}
