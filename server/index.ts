import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import path from "path";
import fs from "fs";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// Register Stripe webhook BEFORE express.json()
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];
    if (!signature) return res.status(400).json({ error: "Missing signature" });
    try {
      const { WebhookHandlers } = await import("./webhookHandlers");
      const sig = Array.isArray(signature) ? signature[0] : signature;
      await WebhookHandlers.processWebhook(req.body as Buffer, sig);
      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error("Webhook error:", error.message);
      res.status(400).json({ error: "Webhook processing error" });
    }
  }
);

app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } }));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const p = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (p.startsWith("/api")) {
      let logLine = `${req.method} ${p} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      log(logLine);
    }
  });
  next();
});

(async () => {
  // Initialize Stripe schema in background (non-blocking)
  (async () => {
    try {
      const { runMigrations } = await import("stripe-replit-sync");
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) throw new Error("DATABASE_URL required");
      await runMigrations({ databaseUrl });
      log("Stripe schema ready", "stripe");

      const { getStripeSync } = await import("./stripeClient");
      const stripeSync = await getStripeSync();

      const domains = process.env.REPLIT_DOMAINS?.split(",")[0];
      if (domains) {
        const webhookUrl = `https://${domains}/api/stripe/webhook`;
        await stripeSync.findOrCreateManagedWebhook(webhookUrl);
        log(`Webhook configured: ${webhookUrl}`, "stripe");
      }

      stripeSync.syncBackfill().then(() => log("Stripe data synced", "stripe")).catch((e: any) => log(`Stripe backfill error: ${e.message}`, "stripe"));
    } catch (e: any) {
      log(`Stripe init warning: ${e.message}`, "stripe");
    }
  })();

  await registerRoutes(httpServer, app);

  app.get("/project.zip", (req, res) => {
    const paths = [
      path.resolve(process.cwd(), "client", "public", "project.zip"),
      path.resolve(process.cwd(), "dist", "public", "project.zip")
    ];
    for (const p of paths) {
      if (fs.existsSync(p)) return res.download(p, "instantsettlement-ai-mvp.zip");
    }
    res.status(404).send("File not found");
  });

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Internal Server Error:", err);
    if (res.headersSent) return next(err);
    return res.status(status).json({ message });
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
    log(`serving on port ${port}`);
  });
})();
