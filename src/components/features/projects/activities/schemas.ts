import { createInsertSchema } from "drizzle-zod";
import { projectActivitiesTable } from "@/lib/drizzle/schema";

// Form schema for ProjectActivity (only user-provided fields)
export const ProjectActivityFormSchema = createInsertSchema(
  projectActivitiesTable,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
