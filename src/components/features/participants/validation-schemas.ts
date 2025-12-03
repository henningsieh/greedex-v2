import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { projectParticipantsTable } from "@/lib/drizzle/schema";

// Schema for participant with user details (as returned by the API)
export const ProjectParticipantWithUserSchema = createSelectSchema(
  projectParticipantsTable,
).extend({
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    image: z.string().nullable(),
  }),
});
