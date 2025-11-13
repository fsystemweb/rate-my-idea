import path from "path";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import serverless from "serverless-http";
import { connectDB } from "./db";
import * as ideasRoutes from "./routes/ideas";
import * as feedbackRoutes from "./routes/feedback";

if (!process.env.DEV) {
  const envPath = path.resolve(process.cwd(), "../../.env");
  dotenv.config({ path: envPath });
}else{
  dotenv.config({ path: path.resolve(process.cwd(), ".env") });
}

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  let dbReady = false;
  app.use(async (req, res, next) => {
    if (!dbReady) {
      try {
        await connectDB();
        dbReady = true;
        console.log("Database connected");
      } catch (e) {
        console.warn("DB connection failed", e);
      }
    }
    next();
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

  return app;
}

// Default export for Vercel
export default serverless(createApp());
