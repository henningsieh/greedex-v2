import { Suspense } from "react";
import RightSideImage from "@/components/auth/right-side-image";
import { VerifyEmailContent } from "@/components/auth/verify-email-content";
import { Spinner } from "@/components/ui/spinner";

export default function VerifyEmailPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Suspense
              fallback={
                <div className="flex items-center justify-center p-8">
                  <Spinner />
                </div>
              }
            >
              <VerifyEmailContent />
            </Suspense>
          </div>
        </div>
      </div>
      <RightSideImage />
    </div>
  );
}
