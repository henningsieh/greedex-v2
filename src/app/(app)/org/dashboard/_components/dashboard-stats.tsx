import { Card } from "@/components/ui/card";

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="p-6">
        <div className="font-medium text-muted-foreground text-sm">
          Total Projects
        </div>
        <div className="font-bold text-2xl">Coming Soon</div>
      </Card>
      <Card className="p-6">
        <div className="font-medium text-muted-foreground text-sm">
          Total Participants
        </div>
        <div className="font-bold text-2xl">Coming Soon</div>
      </Card>
      <Card className="p-6">
        <div className="font-medium text-muted-foreground text-sm">
          Total Activities
        </div>
        <div className="font-bold text-2xl">Coming Soon</div>
      </Card>
    </div>
  );
}
