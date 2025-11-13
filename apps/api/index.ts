import dotenv from "dotenv";
import path from "path";
const rootEnv = path.resolve(process.cwd(), "..", "..", ".env");
dotenv.config({ path: rootEnv });
dotenv.config();
import express from "express";
import cors from "cors";
import { connectDB } from "./db";
import * as ideasRoutes from "./routes/ideas";
import * as feedbackRoutes from "./routes/feedback";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Lazy DB init
  let dbReady = false;
  app.use(async (req, res, next) => {
    if (!dbReady) {
      try {
        await connectDB();
        dbReady = true;
        console.log("Database connected");
      } catch (e) {
        console.warn("DB connection failed");
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

// === VERCEL HANDLER (only exported) ===
let _handler: any;

async function vercelHandler(req: any, res: any) {
  if (!_handler) {
    const app = createApp();
    const { default: sls } = await import("serverless-http");
    _handler = sls(app);
  }
  return _handler(req, res);
}

export default vercelHandler;
