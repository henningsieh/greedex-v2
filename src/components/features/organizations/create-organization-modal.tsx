"use client";

import { CreateOrganizationForm } from "@/components/features/organizations/create-organization-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface CreateOrganizationModalProps {
  label: string;
  triggerNode?: React.ReactNode;
}

export function CreateOrganizationModal({
  label,
  triggerNode,
}: CreateOrganizationModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        {triggerNode || <Button variant="default">{label}</Button>}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
        </DialogHeader>

        <div className="pt-2">
          <CreateOrganizationForm onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
