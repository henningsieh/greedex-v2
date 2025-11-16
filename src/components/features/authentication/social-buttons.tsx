import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { authClient } from "@/lib/better-auth/auth-client";
import {
  SUPPORTED_OAUTH_PROVIDER_DETAILS,
  SUPPORTED_OAUTH_PROVIDERS,
  type SupportedOAuthProvider,
} from "@/lib/better-auth/o-auth-providers";

interface Props {
  disabled?: boolean;
  callbackUrl?: string | string[];
}

function SocialButtons({ disabled, callbackUrl }: Props) {
  const handleSocialSignIn = async (provider: SupportedOAuthProvider) => {
    await authClient.signIn.social({
      provider,
      callbackURL:
        typeof callbackUrl === "string" ? callbackUrl : "/org/dashboard",
    });
  };

  return (
    <Field>
      <div className="flex flex-row gap-2">
        {SUPPORTED_OAUTH_PROVIDERS.map((provider) => {
          const { name, Icon } = SUPPORTED_OAUTH_PROVIDER_DETAILS[provider];

          return (
            <Button
              key={provider}
              type="button"
              variant="outline"
              className="grow"
              onClick={() => handleSocialSignIn(provider)}
              disabled={disabled}
            >
              <Icon />
              {name}
            </Button>
          );
        })}
      </div>
    </Field>
  );
}

export default SocialButtons;
