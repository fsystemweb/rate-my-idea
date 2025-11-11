import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB, closeDB } from "./db";
import { handleDemo } from "./routes/demo";
import * as ideasRoutes from "./routes/ideas";
import * as feedbackRoutes from "./routes/feedback";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize database on first request (optional in dev)
  let dbInitialized = false;
  let dbInitError = false;
  app.use(async (req, res, next) => {
    if (!dbInitialized && !dbInitError) {
      try {
        await connectDB();
        dbInitialized = true;
      } catch (error) {
        const errMsg = error && (error as Error).message ? (error as Error).message : String(error);
        console.warn("Database connection failed - using mock data mode:", errMsg);
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

  app.get("/api/demo", handleDemo);

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
