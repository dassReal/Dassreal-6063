import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { authenticatedOnly } from "../middleware/auth";
import type { HonoContext } from "../types";
import { nfts } from "../db/schema";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";

const createNftSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  prompt: z.string().optional(),
  monetizationTips: z.string().optional(),
  tags: z.string().optional(),
  generateImage: z.boolean().optional(),
});

const updateNftSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  monetizationTips: z.string().optional(),
  tags: z.string().optional(),
});

export const nftRoutes = new Hono<HonoContext>()
  .use("*", authenticatedOnly)
  .get("/", async (c) => {
    const db = c.get("db");
    const user = c.get("user");

    const allNfts = await db
      .select()
      .from(nfts)
      .orderBy(nfts.createdAt);

    return c.json({ nfts: allNfts });
  })
  .get("/my", async (c) => {
    const db = c.get("db");
    const user = c.get("user");

    const myNfts = await db
      .select()
      .from(nfts)
      .where(eq(nfts.userId, user!.id))
      .orderBy(nfts.createdAt);

    return c.json({ nfts: myNfts });
  })
  .get("/:id", async (c) => {
    const db = c.get("db");
    const id = c.req.param("id");

    const nft = await db
      .select()
      .from(nfts)
      .where(eq(nfts.id, id))
      .limit(1);

    if (nft.length === 0) {
      return c.json({ error: "NFT not found" }, 404);
    }

    return c.json({ nft: nft[0] });
  })
  .post(
    "/",
    zValidator("json", createNftSchema),
    async (c) => {
      const db = c.get("db");
      const user = c.get("user");
      const data = c.req.valid("json");

      let imageUrl = "/nft-example.png";

      if (data.generateImage && data.prompt) {
        try {
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
            prompt: `Generate a detailed description for an AI-generated image based on this prompt: "${data.prompt}". Return only the image description.`,
          });

          imageUrl = `/nft-example.png?desc=${encodeURIComponent(result.text)}`;
        } catch (error) {
          console.error("Image generation error:", error);
        }
      }

      const nftId = crypto.randomUUID();
      const now = new Date();

      await db.insert(nfts).values({
        id: nftId,
        userId: user!.id,
        title: data.title,
        description: data.description,
        imageUrl,
        prompt: data.prompt || null,
        monetizationTips: data.monetizationTips || null,
        tags: data.tags || null,
        createdAt: now,
      });

      const createdNft = await db
        .select()
        .from(nfts)
        .where(eq(nfts.id, nftId))
        .limit(1);

      return c.json({ nft: createdNft[0] }, 201);
    }
  )
  .patch(
    "/:id",
    zValidator("json", updateNftSchema),
    async (c) => {
      const db = c.get("db");
      const user = c.get("user");
      const id = c.req.param("id");
      const data = c.req.valid("json");

      const existing = await db
        .select()
        .from(nfts)
        .where(eq(nfts.id, id))
        .limit(1);

      if (existing.length === 0) {
        return c.json({ error: "NFT not found" }, 404);
      }

      if (existing[0].userId !== user!.id) {
        return c.json({ error: "Unauthorized" }, 403);
      }

      await db
        .update(nfts)
        .set(data)
        .where(eq(nfts.id, id));

      const updated = await db
        .select()
        .from(nfts)
        .where(eq(nfts.id, id))
        .limit(1);

      return c.json({ nft: updated[0] });
    }
  )
  .delete("/:id", async (c) => {
    const db = c.get("db");
    const user = c.get("user");
    const id = c.req.param("id");

    const existing = await db
      .select()
      .from(nfts)
      .where(eq(nfts.id, id))
      .limit(1);

    if (existing.length === 0) {
      return c.json({ error: "NFT not found" }, 404);
    }

    if (existing[0].userId !== user!.id) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    await db.delete(nfts).where(eq(nfts.id, id));

    return c.json({ success: true });
  })
  .post("/generate-tips", async (c) => {
    try {
      const { title, description } = await c.req.json();
      
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
        prompt: `Generate monetization tips for an NFT with the title "${title}" and description: "${description}". Provide 3-5 practical tips for monetizing this NFT.`,
      });

      return c.json({ tips: result.text });
    } catch (error) {
      console.error("Tips generation error:", error);
      return c.json({ error: "Failed to generate tips" }, 500);
    }
  });
