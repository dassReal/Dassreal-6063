import { Hono } from "hono";
import type { HonoContext } from "../types";
import { adminRoutes } from "./admin-routes";
import { aiRoutes } from "./ai-routes";
import { authRoutes } from "./auth-routes";
import { nftRoutes } from "./nft-routes";
import { materialRoutes } from "./material-routes";
import { ideaRoutes } from "./idea-routes";
import { groupRoutes } from "./group-routes";
import { workshopRoutes } from "./workshop-routes";

export const apiRoutes = new Hono<HonoContext>()
  .route("/admin", adminRoutes)
  .route("/ai", aiRoutes)
  .route("/auth", authRoutes)
  .route("/nfts", nftRoutes)
  .route("/materials", materialRoutes)
  .route("/ideas", ideaRoutes)
  .route("/groups", groupRoutes)
  .route("/workshops", workshopRoutes);