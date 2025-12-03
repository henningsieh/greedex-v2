import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { projectActivitiesTable } from "@/lib/drizzle/schema";

// Form schema for ProjectActivity with proper number handling for distanceKm
export const ProjectActivityFormSchema = createInsertSchema(
  projectActivitiesTable,
)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    distanceKm: z.number().min(0, "Distance must be positive"),
  });
