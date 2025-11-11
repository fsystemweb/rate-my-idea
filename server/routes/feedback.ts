import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db";
import { IdeaModel } from "../models/idea";
import { FeedbackModel } from "../models/feedback";
import { verifyPassword, analyzeSentiment } from "../utils/auth";

export const submitFeedback: RequestHandler = async (req, res) => {
  try {
    const { ideaId } = req.params;
    const { rating, feedback, password } = req.body;

    if (!ObjectId.isValid(ideaId)) {
      res.status(400).json({ error: "Invalid idea ID" });
      return;
    }

    if (!rating || rating < 1 || rating > 10) {
      res.status(400).json({ error: "Rating must be between 1 and 10" });
      return;
    }

    const db = getDB();
    const ideaModel = new IdeaModel(db);
    const feedbackModel = new FeedbackModel(db);

    const idea = await ideaModel.findById(new ObjectId(ideaId));

    if (!idea) {
      res.status(404).json({ error: "Idea not found" });
      return;
    }

    // Check password if idea is private
    if (idea.isPrivate) {
      if (!password) {
        res.status(401).json({ error: "Password required for private idea" });
        return;
      }
      const isPasswordValid = await verifyPassword(password, idea.password!);
      if (!isPasswordValid) {
        res.status(403).json({ error: "Invalid password" });
        return;
      }
    }

    // Analyze sentiment if feedback provided
    const sentiment = feedback
      ? analyzeSentiment(feedback)
      : ("neutral" as const);

    // Create feedback
    const newFeedback = await feedbackModel.create({
      ideaId: new ObjectId(ideaId),
      rating,
      feedback,
      createdAt: new Date(),
      sentiment,
    });

    // Get updated stats
    const stats = await feedbackModel.getStatsByIdeaId(new ObjectId(ideaId));
    const avgRating = stats.avgRating?.[0]?.avg || 0;
    const responseCount = stats.totalCount?.[0]?.count || 1;

    // Update idea with new stats
    await ideaModel.updateResponseCount(new ObjectId(ideaId), responseCount);
    await ideaModel.updateAvgRating(new ObjectId(ideaId), avgRating);

    res.status(201).json({
      id: newFeedback._id,
      ideaId,
      rating,
      feedback,
      sentiment,
      createdAt: newFeedback.createdAt,
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
};

export const getIdeaDashboard: RequestHandler = async (req, res) => {
  try {
    const { ideaId } = req.params;
    const { creatorToken } = req.query;

    if (!ObjectId.isValid(ideaId)) {
      res.status(400).json({ error: "Invalid idea ID" });
      return;
    }

    const db = getDB();
    const ideaModel = new IdeaModel(db);
    const feedbackModel = new FeedbackModel(db);

    const idea = await ideaModel.findById(new ObjectId(ideaId));

    if (!idea) {
      res.status(404).json({ error: "Idea not found" });
      return;
    }

    // Verify creator token
    if (idea.creatorToken !== creatorToken) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    // Get feedback stats
    const stats = await feedbackModel.getStatsByIdeaId(new ObjectId(ideaId));
    const timeSeriesData = await feedbackModel.getTimeSeriesData(
      new ObjectId(ideaId)
    );

    // Get all feedback
    const allFeedback = await feedbackModel.findByIdeaId(new ObjectId(ideaId));

    res.json({
      idea: {
        id: idea._id,
        title: idea.title,
        description: idea.description,
        status: idea.status,
        createdAt: idea.createdAt,
        createdBy: idea.createdBy,
        isPrivate: idea.isPrivate,
      },
      analytics: {
        totalFeedback: stats.totalCount?.[0]?.count || 0,
        avgRating: stats.avgRating?.[0]?.avg || 0,
        ratingDistribution: stats.ratingDistribution || [],
        sentimentBreakdown: stats.sentimentBreakdown || [],
        suggestions: (stats.suggestions || []).map((s: any) => ({
          text: s.feedback,
          rating: s.rating,
          createdAt: s.createdAt,
        })),
        feedbackTimeSeries: timeSeriesData || [],
      },
      feedback: allFeedback.map((f) => ({
        id: f._id,
        rating: f.rating,
        feedback: f.feedback,
        sentiment: f.sentiment,
        createdAt: f.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error getting dashboard:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};

export const getFeedback: RequestHandler = async (req, res) => {
  try {
    const { ideaId } = req.params;

    if (!ObjectId.isValid(ideaId)) {
      res.status(400).json({ error: "Invalid idea ID" });
      return;
    }

    const db = getDB();
    const feedbackModel = new FeedbackModel(db);

    const feedback = await feedbackModel.findByIdeaId(new ObjectId(ideaId));

    res.json({
      feedback: feedback.map((f) => ({
        id: f._id,
        rating: f.rating,
        feedback: f.feedback,
        sentiment: f.sentiment,
        createdAt: f.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error getting feedback:", error);
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
};
