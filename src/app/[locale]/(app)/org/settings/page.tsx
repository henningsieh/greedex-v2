/**
 * @file Settings page
 *
 * Mock placeholder file for settings page path
 */

import { getTranslations } from "next-intl/server";

export default async function SettingsPage() {
  const t = await getTranslations("organization.settings");

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-4 font-bold text-3xl">{t("title")}</h1>
      <p>{t("description")}</p>
    </div>
  );
}
