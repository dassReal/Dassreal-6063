import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { eq, desc } from "drizzle-orm";
import { authenticatedOnly } from "../middleware/auth";
import type { HonoContext } from "../types";
import { ideas, votes, contributions } from "../db/schema";

const createIdeaSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  fieldCategory: z.string().min(1),
  fundingGoal: z.number().optional(),
  aiAssisted: z.boolean().optional(),
});

const voteSchema = z.object({
  value: z.number().min(-1).max(1),
});

const contributeSchema = z.object({
  amount: z.number().min(1),
  message: z.string().optional(),
});

export const ideaRoutes = new Hono<HonoContext>()
  .use("*", authenticatedOnly)
  .get("/", async (c) => {
    const db = c.get("db");
    const fieldCategory = c.req.query("fieldCategory");

    let query = db.select().from(ideas);

    if (fieldCategory) {
      query = query.where(eq(ideas.fieldCategory, fieldCategory));
    }

    const allIdeas = await query.orderBy(desc(ideas.voteCount), desc(ideas.createdAt));

    return c.json({ ideas: allIdeas });
  })
  .get("/my", async (c) => {
    const db = c.get("db");
    const user = c.get("user");

    const myIdeas = await db
      .select()
      .from(ideas)
      .where(eq(ideas.userId, user!.id))
      .orderBy(desc(ideas.createdAt));

    return c.json({ ideas: myIdeas });
  })
  .get("/:id", async (c) => {
    const db = c.get("db");
    const id = c.req.param("id");

    const idea = await db
      .select()
      .from(ideas)
      .where(eq(ideas.id, id))
      .limit(1);

    if (idea.length === 0) {
      return c.json({ error: "Idea not found" }, 404);
    }

    return c.json({ idea: idea[0] });
  })
  .post(
    "/",
    zValidator("json", createIdeaSchema),
    async (c) => {
      const db = c.get("db");
      const user = c.get("user");
      const data = c.req.valid("json");

      const ideaId = crypto.randomUUID();
      const now = new Date();

      await db.insert(ideas).values({
        id: ideaId,
        userId: user!.id,
        categoryId: null,
        title: data.title,
        description: data.description,
        fieldCategory: data.fieldCategory,
        status: "submitted",
        aiAssisted: data.aiAssisted || false,
        fundingGoal: data.fundingGoal || 0,
        fundingRaised: 0,
        voteCount: 0,
        createdAt: now,
        updatedAt: now,
      });

      const created = await db
        .select()
        .from(ideas)
        .where(eq(ideas.id, ideaId))
        .limit(1);

      return c.json({ idea: created[0] }, 201);
    }
  )
  .patch(
    "/:id",
    zValidator("json", z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.string().optional(),
      fundingGoal: z.number().optional(),
    })),
    async (c) => {
      const db = c.get("db");
      const user = c.get("user");
      const id = c.req.param("id");
      const data = c.req.valid("json");

      const existing = await db
        .select()
        .from(ideas)
        .where(eq(ideas.id, id))
        .limit(1);

      if (existing.length === 0) {
        return c.json({ error: "Idea not found" }, 404);
      }

      if (existing[0].userId !== user!.id) {
        return c.json({ error: "Unauthorized" }, 403);
      }

      await db
        .update(ideas)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(ideas.id, id));

      const updated = await db
        .select()
        .from(ideas)
        .where(eq(ideas.id, id))
        .limit(1);

      return c.json({ idea: updated[0] });
    }
  )
  .delete("/:id", async (c) => {
    const db = c.get("db");
    const user = c.get("user");
    const id = c.req.param("id");

    const existing = await db
      .select()
      .from(ideas)
      .where(eq(ideas.id, id))
      .limit(1);

    if (existing.length === 0) {
      return c.json({ error: "Idea not found" }, 404);
    }

    if (existing[0].userId !== user!.id) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    await db.delete(ideas).where(eq(ideas.id, id));

    return c.json({ success: true });
  })
  .post(
    "/:id/vote",
    zValidator("json", voteSchema),
    async (c) => {
      const db = c.get("db");
      const user = c.get("user");
      const id = c.req.param("id");
      const { value } = c.req.valid("json");

      const idea = await db
        .select()
        .from(ideas)
        .where(eq(ideas.id, id))
        .limit(1);

      if (idea.length === 0) {
        return c.json({ error: "Idea not found" }, 404);
      }

      const existingVote = await db
        .select()
        .from(votes)
        .where(eq(votes.ideaId, id))
        .where(eq(votes.userId, user!.id))
        .limit(1);

      if (existingVote.length > 0) {
        const oldValue = existingVote[0].value;
        await db
          .update(votes)
          .set({ value, createdAt: new Date() })
          .where(eq(votes.id, existingVote[0].id));

        const voteDiff = value - oldValue;
        await db
          .update(ideas)
          .set({ voteCount: idea[0].voteCount + voteDiff })
          .where(eq(ideas.id, id));
      } else {
        const voteId = crypto.randomUUID();
        await db.insert(votes).values({
          id: voteId,
          userId: user!.id,
          ideaId: id,
          value,
          createdAt: new Date(),
        });

        await db
          .update(ideas)
          .set({ voteCount: idea[0].voteCount + value })
          .where(eq(ideas.id, id));
      }

      const updated = await db
        .select()
        .from(ideas)
        .where(eq(ideas.id, id))
        .limit(1);

      return c.json({ idea: updated[0] });
    }
  )
  .get("/:id/votes", async (c) => {
    const db = c.get("db");
    const id = c.req.param("id");

    const allVotes = await db
      .select()
      .from(votes)
      .where(eq(votes.ideaId, id))
      .orderBy(desc(votes.createdAt));

    return c.json({ votes: allVotes });
  })
  .post(
    "/:id/contribute",
    zValidator("json", contributeSchema),
    async (c) => {
      const db = c.get("db");
      const user = c.get("user");
      const id = c.req.param("id");
      const data = c.req.valid("json");

      const idea = await db
        .select()
        .from(ideas)
        .where(eq(ideas.id, id))
        .limit(1);

      if (idea.length === 0) {
        return c.json({ error: "Idea not found" }, 404);
      }

      const contributionId = crypto.randomUUID();
      await db.insert(contributions).values({
        id: contributionId,
        userId: user!.id,
        ideaId: id,
        amount: data.amount,
        message: data.message || null,
        createdAt: new Date(),
      });

      const newFundingRaised = idea[0].fundingRaised + data.amount;
      await db
        .update(ideas)
        .set({ fundingRaised: newFundingRaised })
        .where(eq(ideas.id, id));

      const updated = await db
        .select()
        .from(ideas)
        .where(eq(ideas.id, id))
        .limit(1);

      return c.json({ idea: updated[0], contribution: { id: contributionId, ...data } });
    }
  )
  .get("/:id/contributions", async (c) => {
    const db = c.get("db");
    const id = c.req.param("id");

    const allContributions = await db
      .select()
      .from(contributions)
      .where(eq(contributions.ideaId, id))
      .orderBy(desc(contributions.createdAt));

    return c.json({ contributions: allContributions });
  });
