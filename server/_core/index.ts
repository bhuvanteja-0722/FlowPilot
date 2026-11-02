import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { publicPlatformScript } from "./publicConfig";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { fetchPayPalSnapshot, isPayPalConfigured } from "../integrations/paypal";
import { generateCashFlowBrief } from "../integrations/ai";

async function startServer() {
  const app = express();
  const server = createServer(app);
  const allowedOrigins = new Set([
    process.env.FLOWPILOT_ALLOWED_ORIGIN,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ].filter((origin): origin is string => Boolean(origin)));
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.has(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
      res.setHeader("Vary", "Origin");
    }
    if (req.method === "OPTIONS") return res.sendStatus(origin && !allowedOrigins.has(origin) ? 403 : 204);
    next();
  });
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "flowpilot-api" }));
  app.get("/api/integrations/status", (_req, res) => res.json({
    paypal: isPayPalConfigured() ? "configured" : "not_configured",
    ai: process.env.OPENAI_API_KEY?.trim() ? "configured" : "not_configured",
  }));
  app.get("/api/paypal/transactions", async (req, res) => {
    const rawDays = Number(req.query.days ?? 7);
    if (!Number.isFinite(rawDays) || rawDays < 1 || rawDays > 31) {
      return res.status(400).json({ error: "Choose a date range from 1 to 31 days." });
    }
    try {
      return res.json(await fetchPayPalSnapshot(rawDays));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load PayPal Sandbox activity.";
      const status = message.includes("not configured") ? 503 : 502;
      return res.status(status).json({ error: message });
    }
  });
  app.post("/api/ai/brief", async (req, res) => {
    const rawDays = Number(req.body?.days ?? 7);
    if (!Number.isFinite(rawDays) || rawDays < 1 || rawDays > 31) {
      return res.status(400).json({ error: "Choose a date range from 1 to 31 days." });
    }
    try {
      const snapshot = await fetchPayPalSnapshot(rawDays);
      const brief = await generateCashFlowBrief(snapshot);
      return res.json({ snapshot, brief });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not generate the AI briefing.";
      const status = message.includes("not configured") ? 503 : 502;
      return res.status(status).json({ error: message });
    }
  });
  app.get("/api/platform/config.js", (_req, res) => {
    res.set("Cache-Control", "no-store").type("application/javascript").send(publicPlatformScript());
  });
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = Number(process.env.PORT || "3000");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT");
  server.on("error", error => { console.error("Server failed:", error.message); process.exit(1); });
  server.listen(port, "0.0.0.0", () => console.log(`Server listening on port ${port}`));
}

startServer().catch(error => { console.error(error); process.exit(1); });
