import type { EUCountryCode } from "@greendex/config/eu-countries";

import {
  ACTIVITY_VALUES,
  DECIMAL_PRECISION,
  DECIMAL_SCALE,
} from "@greendex/config/activities";
import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  boolean,
  customType,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import type { ActivityValueType } from "@/features/project-activities/types";

import { organization, user, member } from "@/lib/drizzle/schemas/auth-schema";

/**
 * Custom Drizzle type for distance values
 * Stores as DECIMAL(10,1) in DB, exposes as number in TypeScript
 * Database handles rounding natively via DECIMAL(10,1)
 */
const distanceKmType = customType<{ data: number; driverData: string }>({
  dataType() {
    return `decimal(${DECIMAL_PRECISION}, ${DECIMAL_SCALE})`;
  },
  fromDriver(value: string): number {
    return Number.parseFloat(value);
  },
  toDriver(value: number): string {
    return value.toString();
  },
});

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
export const projectsTable = pgTable("project", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  location: text("location").notNull(),
  country: text("country").$type<EUCountryCode>().notNull(),
  welcomeMessage: text("welcome_message"),

  // Foreign key to user (responsible team member)
  responsibleUserId: text("responsible_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Foreign key to organization - projects are scoped to organizations
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),

  // Archived flag - projects can be archived instead of deleted
  archived: boolean("archived").default(false).notNull(),

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
export const projectActivitiesTable = pgTable("project_activity", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  projectId: text("project_id")
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),

  // type ActivityType = "boat" | "bus" | "train" | "car"
  activityType: text("activity_type", { enum: ACTIVITY_VALUES })
    .$type<ActivityValueType>()
    .notNull(),

  // Distance in kilometers (scale 1 supports 0.1 km increments)
  distanceKm: distanceKmType("distance_km").notNull(),

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
 * Links project participants (members of the organization) to projects.
 * Country is stored here because it comes from the participation questionnaire,
 * not from the user's account registration.
 */
export const projectParticipantsTable = pgTable("project_participant", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  projectId: text("project_id")
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),
  memberId: text("member_id")
    .notNull()
    .references(() => member.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Country code from participation questionnaire (EU member state)
  country: text("country").$type<EUCountryCode>().notNull(),

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
export const projectRelations = relations(projectsTable, ({ one, many }) => ({
  responsibleUser: one(user, {
    fields: [projectsTable.responsibleUserId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [projectsTable.organizationId],
    references: [organization.id],
  }),
  activities: many(projectActivitiesTable),
  participants: many(projectParticipantsTable),
}));

// projectActivity - relations
export const projectActivityRelations = relations(
  projectActivitiesTable,
  ({ one }) => ({
    project: one(projectsTable, {
      fields: [projectActivitiesTable.projectId],
      references: [projectsTable.id],
    }),
  }),
);

// projectParticipant - relations
export const projectParticipantRelations = relations(
  projectParticipantsTable,
  ({ one }) => ({
    project: one(projectsTable, {
      fields: [projectParticipantsTable.projectId],
      references: [projectsTable.id],
    }),
    member: one(member, {
      fields: [projectParticipantsTable.memberId],
      references: [member.id],
    }),
    user: one(user, {
      fields: [projectParticipantsTable.userId],
      references: [user.id],
    }),
  }),
);
