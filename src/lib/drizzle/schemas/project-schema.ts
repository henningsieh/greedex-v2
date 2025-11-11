import { relations } from "drizzle-orm";
import { decimal, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { organization, user } from "@/lib/drizzle/schemas/auth-schema";

// Define enum for activity types
export const activityTypeEnum = pgEnum("activity_type", [
  "boat",
  "bus",
  "train",
  "car",
]);

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

  // Foreign key to organization (assuming projects belong to organizations)
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const projectActivity = pgTable("project_activity", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projectTable.id, { onDelete: "cascade" }),

  // Activity type: 'boat', 'bus', 'train', 'car'
  activityType: activityTypeEnum("activity_type").notNull(),

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

export const projectParticipant = pgTable("project_participant", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projectTable.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").default("participant").notNull(), // z.B. 'participant', 'leader'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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

export const projectParticipantRelations = relations(
  projectParticipant,
  ({ one }) => ({
    project: one(projectTable, {
      fields: [projectParticipant.projectId],
      references: [projectTable.id],
    }),
    user: one(user, {
      fields: [projectParticipant.userId],
      references: [user.id],
    }),
  }),
);
