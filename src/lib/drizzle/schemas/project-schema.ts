import { relations } from "drizzle-orm";
import { decimal, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { organization, user } from "@/lib/drizzle/schemas/auth-schema";

// Define activity types as a const array (single source of truth)
const activityTypeValues = ["boat", "bus", "train", "car"] as const;
export type ActivityType = (typeof activityTypeValues)[number];

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
 * Tracks travel activities associated with projects for carbon footprint calculation
 */
export const projectActivity = pgTable("project_activity", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projectTable.id, { onDelete: "cascade" }),

  // Activity type: 'boat', 'bus', 'train', 'car'
  activityType: text("activity_type", { enum: activityTypeValues })
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
