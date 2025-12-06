import { createSelectSchema } from "drizzle-zod";
import {
  projectParticipantsTable,
  user as userTable,
} from "@/lib/drizzle/schema";

// Schema for participant with user details (as returned by the API)
export const ProjectParticipantWithUserSchema = createSelectSchema(
  projectParticipantsTable,
).extend({
  user: createSelectSchema(userTable).omit({
    emailVerified: true,
    createdAt: true,
    updatedAt: true,
  }),
});

