import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db";
import { IdeaModel } from "../../models/idea";
import { FeedbackModel } from "../../models/feedback";
import {
  generateCreatorToken,
  hashPassword,
  verifyPassword,
} from "../utils/auth";

export const createIdea: RequestHandler = async (req, res) => {
  try {
    const { title, description, isPrivate, password, createdBy } = req.body;

    if (!title || !description) {
      res.status(400).json({ error: "Title and description are required" });
      return;
    }

    const db = getDB();
    const ideaModel = new IdeaModel(db);

    const creatorToken = generateCreatorToken();
    const hashedPassword = isPrivate ? await hashPassword(password) : undefined;

    const idea = await ideaModel.create({
      title,
      description,
      createdAt: new Date(),
      isPrivate,
      password: hashedPassword,
      creatorToken,
      responseCount: 0,
      avgRating: 0,
      status: "active",
      createdBy: createdBy || "Anonymous",
    });

    res.status(201).json({
      id: idea._id,
      ...idea,
      password: undefined,
      creatorToken,
    });
  } catch (error) {
    console.error("Error creating idea:", error);
    res.status(500).json({ error: "Failed to create idea" });
  }
};

export const getPublicIdeas: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const db = getDB();
    const ideaModel = new IdeaModel(db);

    const result = await ideaModel.getPaginatedPublic(page);

    res.json({
      ideas: result.ideas.map((idea) => ({
        id: idea._id,
        title: idea.title,
        description: idea.description,
        avgRating: idea.avgRating,
        responseCount: idea.responseCount,
        createdAt: idea.createdAt,
        isPrivate: idea.isPrivate,
      })),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        hasMore: result.hasMore,
      },
    });
  } catch (error) {
    console.error("Error getting ideas:", error);
    res.status(500).json({ error: "Failed to fetch ideas" });
  }
};

export const getIdeaDetail: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.query;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid idea ID" });
      return;
    }

    const db = getDB();
    const ideaModel = new IdeaModel(db);
    const idea = await ideaModel.findById(new ObjectId(id));

    if (!idea) {
      res.status(404).json({ error: "Idea not found" });
      return;
    }

    if (idea.isPrivate && idea.password) {
      if (!password || !(await verifyPassword(password as string, idea.password))) {
        res.status(403).json({ error: "Password required for private idea" });
        return;
      }
    }

    res.json({
      id: idea._id,
      title: idea.title,
      description: idea.description,
      avgRating: idea.avgRating,
      responseCount: idea.responseCount,
      createdAt: idea.createdAt,
      isPrivate: idea.isPrivate,
      createdBy: idea.createdBy,
    });
  } catch (error) {
    console.error("Error getting idea:", error);
    res.status(500).json({ error: "Failed to fetch idea" });
  }
};

export const updateIdea: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { creatorToken, password } = req.query;
    const { title, description, status, createdBy } = req.body;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid idea ID" });
      return;
    }

    const db = getDB();
    const ideaModel = new IdeaModel(db);
    const idea = await ideaModel.findById(new ObjectId(id));

    if (!idea) {
      res.status(404).json({ error: "Idea not found" });
      return;
    }

    if (idea.isPrivate && idea.password) {
      if (!password || !(await verifyPassword(password as string, idea.password))) {
        res.status(403).json({ error: "Password required for private idea" });
        return;
      }
    }

    if (idea.creatorToken !== creatorToken) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (createdBy !== undefined) updates.createdBy = createdBy;

    await ideaModel.update(new ObjectId(id), updates);

    res.json({
      id: idea._id,
      ...idea,
      ...updates,
      password: undefined,
    });
  } catch (error) {
    console.error("Error updating idea:", error);
    res.status(500).json({ error: "Failed to update idea" });
  }
};

export const deleteIdea: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { creatorToken } = req.query;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid idea ID" });
      return;
    }

    const db = getDB();
    const ideaModel = new IdeaModel(db);
    const feedbackModel = new FeedbackModel(db);

    const idea = await ideaModel.findById(new ObjectId(id));

    if (!idea) {
      res.status(404).json({ error: "Idea not found" });
      return;
    }

    if (idea.creatorToken !== creatorToken) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    // Delete all feedback for this idea
    await feedbackModel.deleteByIdeaId(new ObjectId(id));

    // Delete the idea
    await ideaModel.delete(new ObjectId(id));

    res.json({ success: true, message: "Idea deleted successfully" });
  } catch (error) {
    console.error("Error deleting idea:", error);
    res.status(500).json({ error: "Failed to delete idea" });
  }
};
