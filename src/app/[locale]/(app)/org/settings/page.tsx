/**
 * @file Settings page
 *
 * Mock placeholder file for settings page path
 */

import { SettingsIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function SettingsPage() {
  const t = await getTranslations("organization.settings");

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-start gap-3">
          <SettingsIcon className="mb-1.5 size-9" />
          <h2 className="font-bold font-sans text-4xl">{t("title")}</h2>
        </div>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
    </div>
  );
}
