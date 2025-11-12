import "dotenv/config";
import express from "express";
import cors from "cors";
import serverless from "serverless-http";
import { connectDB, closeDB } from "./db";
import * as ideasRoutes from "./routes/ideas";
import * as feedbackRoutes from "./routes/feedback";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize database on first request
  let dbInitialized = false;
  let dbInitError = false;
  app.use(async (req, res, next) => {
    if (!dbInitialized && !dbInitError) {
      try {
        await connectDB();
        dbInitialized = true;
      } catch (error) {
        const errMsg =
          error && (error as Error).message
            ? (error as Error).message
            : String(error);
        console.warn(
          "Database connection failed - using mock data mode:",
          errMsg
        );
        dbInitError = true;
      }
    }
    next();
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });


  // Ideas routes
  app.post("/api/ideas", ideasRoutes.createIdea);
  app.get("/api/ideas", ideasRoutes.getPublicIdeas);
  app.get("/api/ideas/:id", ideasRoutes.getIdeaDetail);
  app.put("/api/ideas/:id", ideasRoutes.updateIdea);
  app.delete("/api/ideas/:id", ideasRoutes.deleteIdea);

  // Feedback routes
  app.post("/api/ideas/:ideaId/feedback", feedbackRoutes.submitFeedback);
  app.get("/api/ideas/:ideaId/dashboard", feedbackRoutes.getIdeaDashboard);
  app.get("/api/ideas/:ideaId/feedback", feedbackRoutes.getFeedback);

  // Cleanup on shutdown
  process.on("SIGINT", async () => {
    await closeDB();
    process.exit(0);
  });

  return app;
}

const app = createServer();

// Only run server in development
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`API server running on port ${port}`);
    console.log(`API: http://localhost:${port}/api`);
  });

  // Graceful shutdown
  process.on("SIGTERM", () => process.exit(0));
  process.on("SIGINT", () => process.exit(0));
}

// === VERCEL: Export serverless handler ===
export default serverless(app);