import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";

export function DashboardStats() {
  const t = useTranslations("organization.dashboard");

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="p-6">
        <div className="font-medium text-muted-foreground text-sm">
          {t("total-projects")}
        </div>
        <div className="font-bold text-2xl">{t("coming-soon")}</div>
      </Card>
      <Card className="p-6">
        <div className="font-medium text-muted-foreground text-sm">
          {t("total-participants")}
        </div>
        <div className="font-bold text-2xl">{t("coming-soon")}</div>
      </Card>
      <Card className="p-6">
        <div className="font-medium text-muted-foreground text-sm">
          {t("total-activities")}
        </div>
        <div className="font-bold text-2xl">{t("coming-soon")}</div>
      </Card>
    </div>
  );
}
