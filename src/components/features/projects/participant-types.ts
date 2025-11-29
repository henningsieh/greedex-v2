// src/components/features/projects/participant-types.ts

import type { InferSelectModel } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { projectParticipant } from "@/lib/drizzle/schema";

// Base participant type from schema
export type ProjectParticipantType = InferSelectModel<typeof projectParticipant>;

// Schema for participant selection
export const ProjectParticipantSelectSchema =
  createSelectSchema(projectParticipant);

// Schema for participant with user details (as returned by the API)
export const ProjectParticipantWithUserSchema =
  ProjectParticipantSelectSchema.extend({
    user: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      image: z.string().nullable(),
    }),
  });

export type ProjectParticipantWithUser = z.infer<
  typeof ProjectParticipantWithUserSchema
>;
