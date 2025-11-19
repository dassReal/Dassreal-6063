import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export * from "./auth-schema";

export const nfts = sqliteTable("nfts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  prompt: text("prompt"),
  monetizationTips: text("monetization_tips"),
  tags: text("tags"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const materialScienceCategories = sqliteTable(
  "material_science_categories",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  }
);

export const materialScienceItems = sqliteTable("material_science_items", {
  id: text("id").primaryKey(),
  categoryId: text("category_id").notNull(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  aiGenerated: integer("ai_generated", { mode: "boolean" }).default(false),
  status: text("status").notNull().default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const ideas = sqliteTable("ideas", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  categoryId: text("category_id"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  fieldCategory: text("field_category").notNull(),
  status: text("status").notNull().default("submitted"),
  aiAssisted: integer("ai_assisted", { mode: "boolean" }).default(false),
  fundingGoal: integer("funding_goal").default(0),
  fundingRaised: integer("funding_raised").default(0),
  voteCount: integer("vote_count").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const votes = sqliteTable("votes", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  ideaId: text("idea_id").notNull(),
  value: integer("value").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const contributions = sqliteTable("contributions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  ideaId: text("idea_id").notNull(),
  amount: integer("amount").notNull(),
  message: text("message"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const communityGroups = sqliteTable("community_groups", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  city: text("city").notNull(),
  state: text("state"),
  country: text("country").notNull(),
  latitude: text("latitude"),
  longitude: text("longitude"),
  groupType: text("group_type").notNull(),
  meetingSchedule: text("meeting_schedule"),
  maxMembers: integer("max_members"),
  currentMembers: integer("current_members").default(0),
  creatorId: text("creator_id").notNull(),
  imageUrl: text("image_url"),
  websiteUrl: text("website_url"),
  contactEmail: text("contact_email"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const groupMembers = sqliteTable("group_members", {
  id: text("id").primaryKey(),
  groupId: text("group_id").notNull(),
  userId: text("user_id").notNull(),
  role: text("role").notNull().default("member"),
  joinedAt: integer("joined_at", { mode: "timestamp" }).notNull(),
});

export const workshops = sqliteTable("workshops", {
  id: text("id").primaryKey(),
  groupId: text("group_id"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  startDate: integer("start_date", { mode: "timestamp" }).notNull(),
  endDate: integer("end_date", { mode: "timestamp" }),
  maxAttendees: integer("max_attendees"),
  currentAttendees: integer("current_attendees").default(0),
  skillLevel: text("skill_level").notNull().default("beginner"),
  tags: text("tags"),
  imageUrl: text("image_url"),
  creatorId: text("creator_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const workshopAttendees = sqliteTable("workshop_attendees", {
  id: text("id").primaryKey(),
  workshopId: text("workshop_id").notNull(),
  userId: text("user_id").notNull(),
  status: text("status").notNull().default("registered"),
  registeredAt: integer("registered_at", { mode: "timestamp" }).notNull(),
});

