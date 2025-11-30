import { relations } from "drizzle-orm";
import { decimal, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { organization, user, member } from "@/lib/drizzle/schemas/auth-schema";
import type { ActivityType } from "@/components/features/projects/types";


// ============================================================================
// TABLES
// ============================================================================

/**
 * Project table
 * 
 * Projects belong to organizations and access is controlled through
 * Better Auth's organization membership system.
 * 
 * Members with "member" role can READ projects
 * Members with "admin" or "owner" role can CREATE, READ, UPDATE, DELETE projects
 *   - Owners can delete any projects in the organization
 *   - Admins can only delete projects they created (where they are the responsible team member)
 */
export const projectTable = pgTable("project", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  location: text("location"),
  country: text("country").notNull(),
  welcomeMessage: text("welcome_message"),

  // Foreign key to user (responsible team member)
  responsibleUserId: text("responsible_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Foreign key to organization - projects are scoped to organizations
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/**
 * Project Activity table
 * 
 * Tracks travel activities associated with projects for carbon footprint calculation.
 * Each activity is associated directly with a project (optional relation).
 * ProjectActivities are optional - a project without activities is always valid.
 */
export const projectActivity = pgTable("project_activity", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projectTable.id, { onDelete: "cascade" }),

  // type ActivityType = "boat" | "bus" | "train" | "car"
  activityType: text("activity_type", { enum: ["boat", "bus", "train", "car"] as const })
    .$type<ActivityType>()
    .notNull(),

  // Distance in kilometers
  distanceKm: decimal("distance_km", { precision: 10, scale: 2 }).notNull(),

  // Optional fields for additional activity details
  description: text("description"),
  activityDate: timestamp("activity_date"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/**
 * Project Participant table
 * 
 * Links project participants (members of the organization) to projects
 */
export const projectParticipant = pgTable("project_participant", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projectTable.id, { onDelete: "cascade" }),
  memberId: text("member_id")
    .notNull()
    .references(() => member.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ============================================================================
// RELATIONS
// ============================================================================

// project - relations
export const projectRelations = relations(projectTable, ({ one, many }) => ({
  responsibleUser: one(user, {
    fields: [projectTable.responsibleUserId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [projectTable.organizationId],
    references: [organization.id],
  }),
  activities: many(projectActivity),
  participants: many(projectParticipant),
}));

// projectActivity - relations
export const projectActivityRelations = relations(
  projectActivity,
  ({ one }) => ({
    project: one(projectTable, {
      fields: [projectActivity.projectId],
      references: [projectTable.id],
    }),
  }),
);

// projectParticipant - relations
export const projectParticipantRelations = relations(
  projectParticipant,
  ({ one }) => ({
    project: one(projectTable, {
      fields: [projectParticipant.projectId],
      references: [projectTable.id],
    }),
    member: one(member, {
      fields: [projectParticipant.memberId],
      references: [member.id],
    }),
    user: one(user, {
      fields: [projectParticipant.userId],
      references: [user.id],
    }),
  }),
);
