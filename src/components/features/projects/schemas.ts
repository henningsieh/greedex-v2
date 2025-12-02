import { createInsertSchema } from "drizzle-zod";
import { projectsTable } from "@/lib/drizzle/schema";

// Form schema (only user-provided fields)
export const ProjectFormSchema = createInsertSchema(projectsTable).omit({
  id: true,
  responsibleUserId: true,
  createdAt: true,
  updatedAt: true,
});
