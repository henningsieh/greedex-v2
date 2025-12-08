import { LastUsedBadge } from "@/components/features/authentication/last-used-badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { authClient } from "@/lib/better-auth/auth-client";
import {
  SUPPORTED_OAUTH_PROVIDER_DETAILS,
  SUPPORTED_OAUTH_PROVIDERS,
  type SupportedOAuthProvider,
} from "@/lib/better-auth/o-auth-providers";
import { DASHBOARD_PATH } from "@/lib/config/AppRoutes";

interface Props {
  disabled?: boolean;
  callbackUrl?: string | string[];
  lastLoginMethod?: string | null;
}

export function SocialButtons({ disabled, callbackUrl, lastLoginMethod }: Props) {
  const handleSocialSignIn = async (provider: SupportedOAuthProvider) => {
    await authClient.signIn.social({
      provider,
      callbackURL: typeof callbackUrl === "string" ? callbackUrl : DASHBOARD_PATH,
    });
  };

  return (
    <Field>
      <div className="flex flex-col gap-2 sm:flex-row">
        {SUPPORTED_OAUTH_PROVIDERS.map((provider) => {
          const { name, Icon } = SUPPORTED_OAUTH_PROVIDER_DETAILS[provider];

          return (
            <div key={provider} className="relative grow">
              {lastLoginMethod && lastLoginMethod === provider && (
                <LastUsedBadge className="-top-7" />
              )}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleSocialSignIn(provider)}
                disabled={disabled}
              >
                <Icon />
                {name}
              </Button>
            </div>
          );
        })}
      </div>
    </Field>
  );
}
