import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { eq, desc, gte } from "drizzle-orm";
import { authenticatedOnly } from "../middleware/auth";
import type { HonoContext } from "../types";
import { workshops, workshopAttendees } from "../db/schema";

const createWorkshopSchema = z.object({
  groupId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  location: z.string().min(1),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  maxAttendees: z.number().optional(),
  skillLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  tags: z.string().optional(),
  imageUrl: z.string().optional(),
});

const updateWorkshopSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  endDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  maxAttendees: z.number().optional(),
  skillLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  tags: z.string().optional(),
  imageUrl: z.string().optional(),
});

export const workshopRoutes = new Hono<HonoContext>()
  .use("*", authenticatedOnly)
  .get("/", async (c) => {
    const db = c.get("db");
    const skillLevel = c.req.query("skillLevel");
    const upcoming = c.req.query("upcoming");

    let query = db.select().from(workshops);

    if (skillLevel) {
      query = query.where(eq(workshops.skillLevel, skillLevel));
    }

    if (upcoming === "true") {
      const now = new Date();
      query = query.where(gte(workshops.startDate, now));
    }

    const allWorkshops = await query.orderBy(workshops.startDate);

    return c.json({ workshops: allWorkshops });
  })
  .get("/my", async (c) => {
    const db = c.get("db");
    const user = c.get("user");

    const myRegistrations = await db
      .select()
      .from(workshopAttendees)
      .where(eq(workshopAttendees.userId, user!.id));

    const workshopIds = myRegistrations.map(r => r.workshopId);
    
    const myWorkshops = [];
    for (const workshopId of workshopIds) {
      const workshop = await db
        .select()
        .from(workshops)
        .where(eq(workshops.id, workshopId))
        .limit(1);
      if (workshop.length > 0) {
        myWorkshops.push(workshop[0]);
      }
    }

    return c.json({ workshops: myWorkshops });
  })
  .get("/created", async (c) => {
    const db = c.get("db");
    const user = c.get("user");

    const created = await db
      .select()
      .from(workshops)
      .where(eq(workshops.creatorId, user!.id))
      .orderBy(desc(workshops.createdAt));

    return c.json({ workshops: created });
  })
  .get("/:id", async (c) => {
    const db = c.get("db");
    const id = c.req.param("id");

    const workshop = await db
      .select()
      .from(workshops)
      .where(eq(workshops.id, id))
      .limit(1);

    if (workshop.length === 0) {
      return c.json({ error: "Workshop not found" }, 404);
    }

    return c.json({ workshop: workshop[0] });
  })
  .post(
    "/",
    zValidator("json", createWorkshopSchema),
    async (c) => {
      const db = c.get("db");
      const user = c.get("user");
      const data = c.req.valid("json");

      const workshopId = crypto.randomUUID();
      const now = new Date();

      await db.insert(workshops).values({
        id: workshopId,
        groupId: data.groupId || null,
        title: data.title,
        description: data.description,
        location: data.location,
        startDate: data.startDate,
        endDate: data.endDate || null,
        maxAttendees: data.maxAttendees || null,
        currentAttendees: 0,
        skillLevel: data.skillLevel || "beginner",
        tags: data.tags || null,
        imageUrl: data.imageUrl || null,
        creatorId: user!.id,
        createdAt: now,
      });

      const created = await db
        .select()
        .from(workshops)
        .where(eq(workshops.id, workshopId))
        .limit(1);

      return c.json({ workshop: created[0] }, 201);
    }
  )
  .patch(
    "/:id",
    zValidator("json", updateWorkshopSchema),
    async (c) => {
      const db = c.get("db");
      const user = c.get("user");
      const id = c.req.param("id");
      const data = c.req.valid("json");

      const existing = await db
        .select()
        .from(workshops)
        .where(eq(workshops.id, id))
        .limit(1);

      if (existing.length === 0) {
        return c.json({ error: "Workshop not found" }, 404);
      }

      if (existing[0].creatorId !== user!.id) {
        return c.json({ error: "Unauthorized" }, 403);
      }

      await db
        .update(workshops)
        .set(data)
        .where(eq(workshops.id, id));

      const updated = await db
        .select()
        .from(workshops)
        .where(eq(workshops.id, id))
        .limit(1);

      return c.json({ workshop: updated[0] });
    }
  )
  .delete("/:id", async (c) => {
    const db = c.get("db");
    const user = c.get("user");
    const id = c.req.param("id");

    const existing = await db
      .select()
      .from(workshops)
      .where(eq(workshops.id, id))
      .limit(1);

    if (existing.length === 0) {
      return c.json({ error: "Workshop not found" }, 404);
    }

    if (existing[0].creatorId !== user!.id) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    await db.delete(workshopAttendees).where(eq(workshopAttendees.workshopId, id));
    await db.delete(workshops).where(eq(workshops.id, id));

    return c.json({ success: true });
  })
  .post("/:id/register", async (c) => {
    const db = c.get("db");
    const user = c.get("user");
    const id = c.req.param("id");

    const workshop = await db
      .select()
      .from(workshops)
      .where(eq(workshops.id, id))
      .limit(1);

    if (workshop.length === 0) {
      return c.json({ error: "Workshop not found" }, 404);
    }

    const existing = await db
      .select()
      .from(workshopAttendees)
      .where(eq(workshopAttendees.workshopId, id))
      .where(eq(workshopAttendees.userId, user!.id))
      .limit(1);

    if (existing.length > 0) {
      return c.json({ error: "Already registered" }, 400);
    }

    if (workshop[0].maxAttendees && workshop[0].currentAttendees >= workshop[0].maxAttendees) {
      return c.json({ error: "Workshop is full" }, 400);
    }

    const attendeeId = crypto.randomUUID();
    await db.insert(workshopAttendees).values({
      id: attendeeId,
      workshopId: id,
      userId: user!.id,
      status: "registered",
      registeredAt: new Date(),
    });

    await db
      .update(workshops)
      .set({ currentAttendees: workshop[0].currentAttendees + 1 })
      .where(eq(workshops.id, id));

    return c.json({ success: true });
  })
  .post("/:id/unregister", async (c) => {
    const db = c.get("db");
    const user = c.get("user");
    const id = c.req.param("id");

    const workshop = await db
      .select()
      .from(workshops)
      .where(eq(workshops.id, id))
      .limit(1);

    if (workshop.length === 0) {
      return c.json({ error: "Workshop not found" }, 404);
    }

    const registration = await db
      .select()
      .from(workshopAttendees)
      .where(eq(workshopAttendees.workshopId, id))
      .where(eq(workshopAttendees.userId, user!.id))
      .limit(1);

    if (registration.length === 0) {
      return c.json({ error: "Not registered" }, 400);
    }

    await db
      .delete(workshopAttendees)
      .where(eq(workshopAttendees.id, registration[0].id));

    await db
      .update(workshops)
      .set({ currentAttendees: Math.max(0, workshop[0].currentAttendees - 1) })
      .where(eq(workshops.id, id));

    return c.json({ success: true });
  })
  .get("/:id/attendees", async (c) => {
    const db = c.get("db");
    const id = c.req.param("id");

    const attendees = await db
      .select()
      .from(workshopAttendees)
      .where(eq(workshopAttendees.workshopId, id))
      .orderBy(workshopAttendees.registeredAt);

    return c.json({ attendees });
  });
