import { UserCogIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { ContentContainer } from "@/components/content-container";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { PageHeader } from "@/components/page-header";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

/**
 * User Settings Page Component
 *
 * Provides a professional settings interface for user preferences including:
 * - Theme selection (light/dark/system)
 * - Language/locale selection
 *
 * Uses PageHeader and ContentContainer for consistent layout across the application.
 * Mobile responsive with proper spacing and card-based sections.
 */
export async function UserSettingsPage() {
  const t = await getTranslations("userSettings");

  return (
    <div className="flex h-full w-full flex-col">
      <PageHeader
        icon={<UserCogIcon />}
        title={t("title")}
        description={t("description")}
      />

      <ContentContainer width="md" className="py-8">
        <div className="space-y-6">
          {/* Appearance Section */}
          <Card>
            <CardHeader>
              <CardTitle>{t("appearance.title")}</CardTitle>
              <CardDescription>{t("appearance.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    {t("appearance.theme")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("appearance.themeDescription")}
                  </p>
                </div>
                <ThemeSwitcher className="shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Language & Region Section */}
          <Card>
            <CardHeader>
              <CardTitle>{t("language.title")}</CardTitle>
              <CardDescription>{t("language.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    {t("language.locale")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("language.localeDescription")}
                  </p>
                </div>
                <LocaleSwitcher className="shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>
      </ContentContainer>
    </div>
  );
}
