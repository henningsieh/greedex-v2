"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { UserPlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { InviteFormSchema } from "@/components/features/organizations/validation-schemas";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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

interface Props {
  organizationId: string;
  allowedRoles?: MemberRole[];
  onSuccess?: () => void;
}

export default function InviteMemberDialog({
  organizationId,
  allowedRoles = Object.values(memberRoles),
  onSuccess,
}: Props) {
  const queryClient = useQueryClient();
  const tRoles = useTranslations("organization.roles");
  const tInvite = useTranslations("organization.team.invite");
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof InviteFormSchema>>({
    resolver: zodResolver(InviteFormSchema),
    defaultValues: {
      email: "",
      name: "",
      role: memberRoles.Employee,
    },
  });

  async function onSubmit(data: z.infer<typeof InviteFormSchema>) {
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
            toast.success(tInvite("successToast"));
            setOpen(false);
            form.reset();
            void queryClient.invalidateQueries(
              orpcQuery.members.search.queryOptions({
                input: {
                  organizationId,
                  filters: {
                    roles: [memberRoles.Owner, memberRoles.Employee],
                  },
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
        <Button variant="outline" className="ml-auto">
          <UserPlusIcon className="size-5" />
          {tInvite("button")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">{tInvite("title")}</DialogTitle>
          <DialogDescription>{tInvite("description")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <InputField
                name="email"
                control={form.control}
                label={tInvite("emailLabel")}
                id="invite-email"
                type="email"
                placeholder="name@domain.com"
                description={tInvite("emailDescription")}
                inputProps={{
                  disabled: form.formState.isSubmitting,
                }}
              />

              <InputField
                name="name"
                control={form.control}
                label={tInvite("nameLabel")}
                id="invite-name"
                type="text"
                placeholder="Jane Doe"
                inputProps={{
                  disabled: form.formState.isSubmitting,
                }}
              />

              <FormField<z.infer<typeof InviteFormSchema>, "role">
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tInvite("roleLabel")}</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="invite-role" size="default">
                          <SelectValue placeholder={tInvite("rolePlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          {allowedRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {tRoles(role)}
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
                  <Button variant="outline">{tInvite("cancelButton")}</Button>
                </DialogClose>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting
                    ? tInvite("sendingButton")
                    : tInvite("sendButton")}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
