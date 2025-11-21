import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { eq, desc } from "drizzle-orm";
import { authenticatedOnly } from "../middleware/auth";
import type { HonoContext } from "../types";
import { communityGroups, groupMembers } from "../db/schema";

const createGroupSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  location: z.string().min(1),
  city: z.string().min(1),
  state: z.string().optional(),
  country: z.string().min(1),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  groupType: z.string().min(1),
  meetingSchedule: z.string().optional(),
  maxMembers: z.number().optional(),
  imageUrl: z.string().optional(),
  websiteUrl: z.string().optional(),
  contactEmail: z.string().optional(),
});

const updateGroupSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  meetingSchedule: z.string().optional(),
  maxMembers: z.number().optional(),
  imageUrl: z.string().optional(),
  websiteUrl: z.string().optional(),
  contactEmail: z.string().optional(),
});

export const groupRoutes = new Hono<HonoContext>()
  .use("*", authenticatedOnly)
  .get("/", async (c) => {
    const db = c.get("db");
    const city = c.req.query("city");
    const country = c.req.query("country");
    const groupType = c.req.query("groupType");

    let query = db.select().from(communityGroups);

    if (city) {
      query = query.where(eq(communityGroups.city, city));
    }
    if (country) {
      query = query.where(eq(communityGroups.country, country));
    }
    if (groupType) {
      query = query.where(eq(communityGroups.groupType, groupType));
    }

    const groups = await query.orderBy(desc(communityGroups.createdAt));

    return c.json({ groups });
  })
  .get("/my", async (c) => {
    const db = c.get("db");
    const user = c.get("user");

    const myMemberships = await db
      .select()
      .from(groupMembers)
      .where(eq(groupMembers.userId, user!.id));

    const groupIds = myMemberships.map(m => m.groupId);
    
    const myGroups = [];
    for (const groupId of groupIds) {
      const group = await db
        .select()
        .from(communityGroups)
        .where(eq(communityGroups.id, groupId))
        .limit(1);
      if (group.length > 0) {
        myGroups.push(group[0]);
      }
    }

    return c.json({ groups: myGroups });
  })
  .get("/:id", async (c) => {
    const db = c.get("db");
    const id = c.req.param("id");

    const group = await db
      .select()
      .from(communityGroups)
      .where(eq(communityGroups.id, id))
      .limit(1);

    if (group.length === 0) {
      return c.json({ error: "Group not found" }, 404);
    }

    return c.json({ group: group[0] });
  })
  .post(
    "/",
    zValidator("json", createGroupSchema),
    async (c) => {
      const db = c.get("db");
      const user = c.get("user");
      const data = c.req.valid("json");

      const groupId = crypto.randomUUID();
      const now = new Date();

      await db.insert(communityGroups).values({
        id: groupId,
        name: data.name,
        description: data.description,
        location: data.location,
        city: data.city,
        state: data.state || null,
        country: data.country,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        groupType: data.groupType,
        meetingSchedule: data.meetingSchedule || null,
        maxMembers: data.maxMembers || null,
        currentMembers: 1,
        creatorId: user!.id,
        imageUrl: data.imageUrl || null,
        websiteUrl: data.websiteUrl || null,
        contactEmail: data.contactEmail || null,
        createdAt: now,
        updatedAt: now,
      });

      const memberId = crypto.randomUUID();
      await db.insert(groupMembers).values({
        id: memberId,
        groupId,
        userId: user!.id,
        role: "admin",
        joinedAt: now,
      });

      const created = await db
        .select()
        .from(communityGroups)
        .where(eq(communityGroups.id, groupId))
        .limit(1);

      return c.json({ group: created[0] }, 201);
    }
  )
  .patch(
    "/:id",
    zValidator("json", updateGroupSchema),
    async (c) => {
      const db = c.get("db");
      const user = c.get("user");
      const id = c.req.param("id");
      const data = c.req.valid("json");

      const existing = await db
        .select()
        .from(communityGroups)
        .where(eq(communityGroups.id, id))
        .limit(1);

      if (existing.length === 0) {
        return c.json({ error: "Group not found" }, 404);
      }

      const membership = await db
        .select()
        .from(groupMembers)
        .where(eq(groupMembers.groupId, id))
        .where(eq(groupMembers.userId, user!.id))
        .limit(1);

      if (membership.length === 0 || membership[0].role !== "admin") {
        return c.json({ error: "Unauthorized" }, 403);
      }

      await db
        .update(communityGroups)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(communityGroups.id, id));

      const updated = await db
        .select()
        .from(communityGroups)
        .where(eq(communityGroups.id, id))
        .limit(1);

      return c.json({ group: updated[0] });
    }
  )
  .delete("/:id", async (c) => {
    const db = c.get("db");
    const user = c.get("user");
    const id = c.req.param("id");

    const existing = await db
      .select()
      .from(communityGroups)
      .where(eq(communityGroups.id, id))
      .limit(1);

    if (existing.length === 0) {
      return c.json({ error: "Group not found" }, 404);
    }

    if (existing[0].creatorId !== user!.id) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    await db.delete(groupMembers).where(eq(groupMembers.groupId, id));
    await db.delete(communityGroups).where(eq(communityGroups.id, id));

    return c.json({ success: true });
  })
  .post("/:id/join", async (c) => {
    const db = c.get("db");
    const user = c.get("user");
    const id = c.req.param("id");

    const group = await db
      .select()
      .from(communityGroups)
      .where(eq(communityGroups.id, id))
      .limit(1);

    if (group.length === 0) {
      return c.json({ error: "Group not found" }, 404);
    }

    const existing = await db
      .select()
      .from(groupMembers)
      .where(eq(groupMembers.groupId, id))
      .where(eq(groupMembers.userId, user!.id))
      .limit(1);

    if (existing.length > 0) {
      return c.json({ error: "Already a member" }, 400);
    }

    if (group[0].maxMembers && group[0].currentMembers >= group[0].maxMembers) {
      return c.json({ error: "Group is full" }, 400);
    }

    const memberId = crypto.randomUUID();
    await db.insert(groupMembers).values({
      id: memberId,
      groupId: id,
      userId: user!.id,
      role: "member",
      joinedAt: new Date(),
    });

    await db
      .update(communityGroups)
      .set({ currentMembers: group[0].currentMembers + 1 })
      .where(eq(communityGroups.id, id));

    return c.json({ success: true });
  })
  .post("/:id/leave", async (c) => {
    const db = c.get("db");
    const user = c.get("user");
    const id = c.req.param("id");

    const group = await db
      .select()
      .from(communityGroups)
      .where(eq(communityGroups.id, id))
      .limit(1);

    if (group.length === 0) {
      return c.json({ error: "Group not found" }, 404);
    }

    const membership = await db
      .select()
      .from(groupMembers)
      .where(eq(groupMembers.groupId, id))
      .where(eq(groupMembers.userId, user!.id))
      .limit(1);

    if (membership.length === 0) {
      return c.json({ error: "Not a member" }, 400);
    }

    if (group[0].creatorId === user!.id) {
      return c.json({ error: "Creator cannot leave group" }, 400);
    }

    await db
      .delete(groupMembers)
      .where(eq(groupMembers.id, membership[0].id));

    await db
      .update(communityGroups)
      .set({ currentMembers: Math.max(0, group[0].currentMembers - 1) })
      .where(eq(communityGroups.id, id));

    return c.json({ success: true });
  })
  .get("/:id/members", async (c) => {
    const db = c.get("db");
    const id = c.req.param("id");

    const members = await db
      .select()
      .from(groupMembers)
      .where(eq(groupMembers.groupId, id))
      .orderBy(groupMembers.joinedAt);

    return c.json({ members });
  });
