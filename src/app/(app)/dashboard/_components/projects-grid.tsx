import { FolderOpen } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function ProjectsGrid() {
  // No projects in MVP - always show empty state
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderOpen className="size-6" />
        </EmptyMedia>
        <EmptyTitle>No projects yet</EmptyTitle>
        <EmptyDescription>
          Projects will help you organize your work and track activities. Stay
          tuned for this feature!
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
