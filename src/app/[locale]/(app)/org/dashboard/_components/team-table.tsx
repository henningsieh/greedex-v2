"use client";

import { useTranslations } from "next-intl";
import { organizationRoles } from "@/components/features/organizations/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Member {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null | undefined;
  };
}

interface TeamTableProps {
  members: Member[];
}

export function TeamTable({ members }: TeamTableProps) {
  const t = useTranslations("organization.team.table");
  const roleKeyByValue: Record<string, string> = Object.fromEntries(
    Object.entries(organizationRoles).map(([key, value]) => [value, key]),
  );
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("member")}</TableHead>
            <TableHead>{t("email")}</TableHead>
            <TableHead>{t("role")}</TableHead>
            <TableHead>{t("joined")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.user.image || undefined} />
                    <AvatarFallback>
                      {member.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{member.user.name}</span>
                </div>
              </TableCell>
              <TableCell>{member.user.email}</TableCell>
              <TableCell>
                <Badge
                  variant={member.role === "owner" ? "default" : "secondary"}
                >
                  {roleKeyByValue[member.role] ?? member.role}
                </Badge>
              </TableCell>
              <TableCell>
                {new Intl.DateTimeFormat("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }).format(new Date(member.createdAt))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
