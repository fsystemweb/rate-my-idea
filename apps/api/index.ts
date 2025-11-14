import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import serverless from "serverless-http";
import { connectDB } from "./db";
import * as ideasRoutes from "./routes/ideas";
import * as feedbackRoutes from "./routes/feedback";

// Create __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load from monorepo root .env
const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

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

  app.post("/api/ideas", ideasRoutes.createIdea);
  app.get("/api/ideas", ideasRoutes.getPublicIdeas);
  app.get("/api/ideas/:id", ideasRoutes.getIdeaDetail);
  app.put("/api/ideas/:id", ideasRoutes.updateIdea);
  app.delete("/api/ideas/:id", ideasRoutes.deleteIdea);

  app.post("/api/ideas/:ideaId/feedback", feedbackRoutes.submitFeedback);
  app.get("/api/ideas/:ideaId/dashboard", feedbackRoutes.getIdeaDashboard);
  app.get("/api/ideas/:ideaId/feedback", feedbackRoutes.getFeedback);

  return app;
}

const app = createApp();

export default serverless(app);

if (process.env.DEV) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}