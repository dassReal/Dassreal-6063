import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { authenticatedOnly } from "../middleware/auth";
import type { HonoContext } from "../types";
import { materialScienceCategories, materialScienceItems } from "../db/schema";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";

const createCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

const createItemSchema = z.object({
  categoryId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  aiGenerated: z.boolean().optional(),
});

export const materialRoutes = new Hono<HonoContext>()
  .use("*", authenticatedOnly)
  .get("/categories", async (c) => {
    const db = c.get("db");

    const categories = await db
      .select()
      .from(materialScienceCategories)
      .orderBy(materialScienceCategories.name);

    return c.json({ categories });
  })
  .post(
    "/categories",
    zValidator("json", createCategorySchema),
    async (c) => {
      const db = c.get("db");
      const data = c.req.valid("json");

      const categoryId = crypto.randomUUID();
      const now = new Date();

      await db.insert(materialScienceCategories).values({
        id: categoryId,
        name: data.name,
        description: data.description || null,
        createdAt: now,
      });

      const created = await db
        .select()
        .from(materialScienceCategories)
        .where(eq(materialScienceCategories.id, categoryId))
        .limit(1);

      return c.json({ category: created[0] }, 201);
    }
  )
  .get("/items", async (c) => {
    const db = c.get("db");
    const categoryId = c.req.query("categoryId");

    let query = db.select().from(materialScienceItems);

    if (categoryId) {
      query = query.where(eq(materialScienceItems.categoryId, categoryId));
    }

    const items = await query.orderBy(materialScienceItems.createdAt);

    return c.json({ items });
  })
  .get("/items/:id", async (c) => {
    const db = c.get("db");
    const id = c.req.param("id");

    const item = await db
      .select()
      .from(materialScienceItems)
      .where(eq(materialScienceItems.id, id))
      .limit(1);

    if (item.length === 0) {
      return c.json({ error: "Item not found" }, 404);
    }

    return c.json({ item: item[0] });
  })
  .post(
    "/items",
    zValidator("json", createItemSchema),
    async (c) => {
      const db = c.get("db");
      const user = c.get("user");
      const data = c.req.valid("json");

      const itemId = crypto.randomUUID();
      const now = new Date();

      await db.insert(materialScienceItems).values({
        id: itemId,
        categoryId: data.categoryId,
        userId: user!.id,
        title: data.title,
        description: data.description,
        aiGenerated: data.aiGenerated || false,
        status: "pending",
        createdAt: now,
      });

      const created = await db
        .select()
        .from(materialScienceItems)
        .where(eq(materialScienceItems.id, itemId))
        .limit(1);

      return c.json({ item: created[0] }, 201);
    }
  )
  .patch(
    "/items/:id",
    zValidator("json", z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.string().optional(),
    })),
    async (c) => {
      const db = c.get("db");
      const user = c.get("user");
      const id = c.req.param("id");
      const data = c.req.valid("json");

      const existing = await db
        .select()
        .from(materialScienceItems)
        .where(eq(materialScienceItems.id, id))
        .limit(1);

      if (existing.length === 0) {
        return c.json({ error: "Item not found" }, 404);
      }

      if (existing[0].userId !== user!.id) {
        return c.json({ error: "Unauthorized" }, 403);
      }

      await db
        .update(materialScienceItems)
        .set(data)
        .where(eq(materialScienceItems.id, id));

      const updated = await db
        .select()
        .from(materialScienceItems)
        .where(eq(materialScienceItems.id, id))
        .limit(1);

      return c.json({ item: updated[0] });
    }
  )
  .delete("/items/:id", async (c) => {
    const db = c.get("db");
    const user = c.get("user");
    const id = c.req.param("id");

    const existing = await db
      .select()
      .from(materialScienceItems)
      .where(eq(materialScienceItems.id, id))
      .limit(1);

    if (existing.length === 0) {
      return c.json({ error: "Item not found" }, 404);
    }

    if (existing[0].userId !== user!.id) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    await db.delete(materialScienceItems).where(eq(materialScienceItems.id, id));

    return c.json({ success: true });
  })
  .post("/ai-assist", async (c) => {
    try {
      const { topic, categoryId } = await c.req.json();
      
      const gatewayUrl = c.env.RUNABLE_GATEWAY_URL || "https://api.runable.com/gateway/v1";
      const gatewayKey = c.env.RUNABLE_SECRET;

      if (!gatewayKey) {
        return c.json({ error: "AI service not configured" }, 500);
      }

      const provider = createOpenAICompatible({
        baseURL: gatewayUrl,
        apiKey: gatewayKey,
        name: "gpt-5",
      });

      const result = await generateText({
        model: provider("gpt-5-mini"),
        prompt: `Generate a detailed material science submission about "${topic}". Include:
1. A concise title
2. A comprehensive description covering key properties, applications, and innovations
3. Practical applications and use cases
Format the response as JSON with keys: title, description`,
      });

      const suggestion = JSON.parse(result.text);
      return c.json({ suggestion });
    } catch (error) {
      console.error("AI assist error:", error);
      return c.json({ error: "Failed to generate suggestion" }, 500);
    }
  });
