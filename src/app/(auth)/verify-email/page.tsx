import RightSideImage from "@/components/auth/right-side-image";
import { VerifyEmailContent } from "@/components/auth/verify-email-content";
import BackToHome from "@/components/back-to-home";

export default function VerifyEmailPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative flex flex-col p-6 md:p-10">
        <div className="absolute top-6 left-6 z-10">
          <BackToHome label="Back to login" href="/login" />
        </div>
        <div className="flex flex-1 justify-center pt-12">
          <div className="w-full max-w-lg">
            <VerifyEmailContent />
          </div>
        </div>
      </div>
      <RightSideImage />
    </div>
  );
}
