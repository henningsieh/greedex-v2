import { LastUsedBadge } from "@/components/features/authentication/last-used-badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { authClient } from "@/lib/better-auth/auth-client";
import {
  SUPPORTED_OAUTH_PROVIDER_DETAILS,
  SUPPORTED_OAUTH_PROVIDERS,
  type SupportedOAuthProvider,
} from "@/lib/better-auth/o-auth-providers";
import { DASHBOARD_PATH } from "@/lib/utils/app-routes";

interface Props {
  disabled?: boolean;
  callbackUrl?: string | string[];
  lastLoginMethod?: string | null;
}

export function SocialButtons({
  disabled,
  callbackUrl,
  lastLoginMethod,
}: Props) {
  const handleSocialSignIn = async (provider: SupportedOAuthProvider) => {
    await authClient.signIn.social({
      provider,
      callbackURL:
        typeof callbackUrl === "string" ? callbackUrl : DASHBOARD_PATH,
    });
  };

  return (
    <Field>
      <div className="flex flex-col gap-2 sm:flex-row">
        {SUPPORTED_OAUTH_PROVIDERS.map((provider) => {
          const { name, Icon } = SUPPORTED_OAUTH_PROVIDER_DETAILS[provider];

          return (
            <div className="relative grow" key={provider}>
              {lastLoginMethod && lastLoginMethod === provider && (
                <LastUsedBadge className="-top-7" />
              )}
              <Button
                className="w-full"
                disabled={disabled}
                onClick={() => handleSocialSignIn(provider)}
                type="button"
                variant="outline"
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
