"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import InputField from "@/components/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormField as UIFormField,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/better-auth/auth-client";
import { orpcQuery } from "@/lib/orpc/orpc";
import type { MemberRole } from "./types";
import { memberRoles } from "./types";

type InviteFormSchema = z.infer<typeof InviteFormSchema>;

const InviteFormSchema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().optional(),
  role: z
    .string()
    .refine((v) => Object.values(memberRoles).includes(v as MemberRole), {
      message: "Invalid role",
    }),
});

interface Props {
  organizationId: string;
  allowedRoles?: MemberRole[];
  onSuccess?: () => void;
}

export default function InviteMemberDialog({
  organizationId,
  allowedRoles,
  onSuccess,
}: Props) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<InviteFormSchema>({
    resolver: zodResolver(InviteFormSchema),
    defaultValues: {
      email: "",
      name: "",
      role: allowedRoles?.[0] ?? memberRoles.Employee,
    },
  });

  async function onSubmit(data: InviteFormSchema) {
    try {
      await authClient.organization.inviteMember(
        {
          organizationId,
          email: data.email,
          role: data.role as MemberRole,
        },
        {
          onError: (ctx) => {
            toast.error(ctx.error.message || "Failed to send invitation");
          },
          onSuccess: () => {
            toast.success("Invitation sent!");
            setOpen(false);
            form.reset();
            void queryClient.invalidateQueries(
              orpcQuery.member.search.queryOptions({
                input: {
                  organizationId,
                  filters: { roles: [memberRoles.Owner, memberRoles.Employee] },
                },
              }),
            );

            onSuccess?.();
          },
        },
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to send invitation";
      toast.error(message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">New Invite</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join your organization.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <InputField
                name="email"
                control={form.control}
                label="User Email"
                id="invite-email"
                type="email"
                placeholder="name@domain.com"
                description="Email address of the person you want to invite"
                inputProps={{ disabled: form.formState.isSubmitting }}
              />

              <InputField
                name="name"
                control={form.control}
                label="Full Name (optional)"
                id="invite-name"
                type="text"
                placeholder="Jane Doe"
                inputProps={{ disabled: form.formState.isSubmitting }}
              />

              <UIFormField<InviteFormSchema, "role">
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="invite-role" size="default">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {(
                            allowedRoles ?? [
                              memberRoles.Owner,
                              memberRoles.Employee,
                              memberRoles.Participant,
                            ]
                          ).map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Sending..." : "Send Invite"}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
