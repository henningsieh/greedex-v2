"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ProjectActivityType } from "@/features/project-activities/types";

import { ProjectActivityForm } from "./project-activity-form";

interface ProjectActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  activity?: ProjectActivityType;
  onSuccess?: () => void;
}

/**
 * Dialog component for adding or editing project activities.
 *
 * @param open - Whether the dialog is open
 * @param onOpenChange - Callback when dialog open state changes
 * @param projectId - ID of the project
 * @param activity - Optional activity to edit (undefined for adding)
 * @param onSuccess - Callback when form submission succeeds
 * @returns The dialog component
 */
export function ProjectActivityDialog({
  open,
  onOpenChange,
  projectId,
  activity,
  onSuccess,
}: ProjectActivityDialogProps) {
  const isEditing = !!activity;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Activity" : "Add Activity"}
          </DialogTitle>
        </DialogHeader>
        <ProjectActivityForm
          activity={activity}
          onCancel={() => onOpenChange(false)}
          onSuccess={() => {
            onSuccess?.();
            onOpenChange(false);
          }}
          projectId={projectId}
        />
      </DialogContent>
    </Dialog>
  );
}
