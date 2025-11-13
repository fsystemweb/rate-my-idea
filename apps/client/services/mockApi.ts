import { mockIdeas, mockFeedback } from "@/mocks/data";
import {
  type CreateIdeaPayload,
  type FeedbackPayload,
  type DashboardData,
} from "./api";

// In-memory storage for mock data
let ideasStore = [...mockIdeas];
let feedbackStore = [...mockFeedback];
const creatorTokenMap: Record<string, string> = {
  "idea-1": "demo-token-123",
};

function generateToken(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockApi = {
  async createIdea(payload: CreateIdeaPayload) {
    await delay();

    const newId = `idea-${Date.now()}`;
    const creatorToken = generateToken();

    const newIdea = {
      id: newId,
      title: payload.title,
      description: payload.description,
      avgRating: 0,
      responseCount: 0,
      createdAt: new Date().toLocaleDateString(),
      isPrivate: payload.isPrivate,
      createdBy: payload.createdBy || "Anonymous",
      status: "active" as const,
    };

    ideasStore.push(newIdea);
    creatorTokenMap[newId] = creatorToken;

    return {
      id: newId,
      title: newIdea.title,
      description: newIdea.description,
      creatorToken,
      isPrivate: newIdea.isPrivate,
    };
  },

  async getPublicIdeas(page = 1) {
    await delay();

    const limit = 10;
    const start = (page - 1) * limit;
    const paginatedIdeas = ideasStore.slice(start, start + limit);

    return {
      ideas: paginatedIdeas,
      pagination: {
        page,
        limit,
        total: ideasStore.length,
        hasMore: start + limit < ideasStore.length,
      },
    };
  },

  async getIdeaDetail(id: string) {
    await delay();

    const idea = ideasStore.find((i) => i.id === id);
    if (!idea) {
      throw new Error("Idea not found");
    }

    return idea;
  },

  async updateIdea(
    id: string,
    creatorToken: string,
    updates: Partial<CreateIdeaPayload>,
  ) {
    await delay();

    if (creatorTokenMap[id] !== creatorToken) {
      throw new Error("Unauthorized");
    }

    const idea = ideasStore.find((i) => i.id === id);
    if (!idea) {
      throw new Error("Idea not found");
    }

    const updated = {
      ...idea,
      ...updates,
      id: idea.id,
      createdAt: idea.createdAt,
      status: idea.status,
    };

    const index = ideasStore.findIndex((i) => i.id === id);
    ideasStore[index] = updated;

    return updated;
  },

  async deleteIdea(id: string, creatorToken: string) {
    await delay();

    if (creatorTokenMap[id] !== creatorToken) {
      throw new Error("Unauthorized");
    }

    ideasStore = ideasStore.filter((i) => i.id !== id);
    feedbackStore = feedbackStore.filter((f) => f.ideaId !== id);
    delete creatorTokenMap[id];

    return {
      success: true,
      message: "Idea deleted successfully",
    };
  },

  async submitFeedback(ideaId: string, payload: FeedbackPayload) {
    await delay();

    const idea = ideasStore.find((i) => i.id === ideaId);
    if (!idea) {
      throw new Error("Idea not found");
    }

    const newFeedback = {
      id: `feedback-${Date.now()}`,
      ideaId,
      rating: payload.rating,
      feedback: payload.feedback,
      sentiment: analyzeSentiment(payload.feedback || "") as
        | "positive"
        | "neutral"
        | "negative",
      createdAt: new Date().toLocaleDateString(),
    };

    feedbackStore.push(newFeedback);

    // Update idea stats
    const ideaFeedback = feedbackStore.filter((f) => f.ideaId === ideaId);
    const avgRating =
      ideaFeedback.reduce((sum, f) => sum + f.rating, 0) / ideaFeedback.length;

    const ideaIndex = ideasStore.findIndex((i) => i.id === ideaId);
    if (ideaIndex !== -1) {
      ideasStore[ideaIndex] = {
        ...ideasStore[ideaIndex],
        avgRating: Math.round(avgRating * 10) / 10,
        responseCount: ideaFeedback.length,
      };
    }

    return {
      id: newFeedback.id,
      ideaId,
      rating: newFeedback.rating,
      feedback: newFeedback.feedback,
      sentiment: newFeedback.sentiment,
      createdAt: newFeedback.createdAt,
    };
  },

  async getFeedback(ideaId: string) {
    await delay();

    const feedback = feedbackStore.filter((f) => f.ideaId === ideaId);

    return {
      feedback: feedback.map((f) => ({
        id: f.id,
        rating: f.rating,
        feedback: f.feedback,
        sentiment: f.sentiment,
        createdAt: f.createdAt,
      })),
    };
  },

  async getDashboard(
    ideaId: string,
    creatorToken: string,
  ): Promise<DashboardData> {
    await delay();

    if (creatorTokenMap[ideaId] !== creatorToken) {
      throw new Error("Unauthorized");
    }

    const idea = ideasStore.find((i) => i.id === ideaId);
    if (!idea) {
      throw new Error("Idea not found");
    }

    const ideaFeedback = feedbackStore.filter((f) => f.ideaId === ideaId);

    // Calculate rating distribution
    const ratingDistribution = Array.from({ length: 10 }, (_, i) => {
      const rating = i + 1;
      const count = ideaFeedback.filter((f) => f.rating === rating).length;
      return { _id: rating, count };
    }).filter((item) => item.count > 0);

    // Calculate sentiment breakdown
    const sentimentBreakdown = ["positive", "neutral", "negative"].map(
      (sentiment) => ({
        _id: sentiment,
        count: ideaFeedback.filter((f) => f.sentiment === sentiment).length,
      }),
    );

    // Get suggestions (feedback with text)
    const suggestions = ideaFeedback
      .filter((f) => f.feedback)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 10)
      .map((f) => ({
        text: f.feedback!,
        rating: f.rating,
        createdAt: f.createdAt,
      }));

    // Calculate time series data
    const feedbackByDate: Record<string, number> = {};
    ideaFeedback.forEach((f) => {
      const date = f.createdAt;
      feedbackByDate[date] = (feedbackByDate[date] || 0) + 1;
    });

    const feedbackTimeSeries = Object.entries(feedbackByDate)
      .map(([date, count]) => ({
        _id: date,
        count,
      }))
      .sort((a, b) => new Date(a._id).getTime() - new Date(b._id).getTime());

    return {
      idea: {
        id: idea.id,
        title: idea.title,
        description: idea.description,
        status: idea.status,
        createdAt: idea.createdAt,
        createdBy: idea.createdBy,
        isPrivate: idea.isPrivate,
      },
      analytics: {
        totalFeedback: ideaFeedback.length,
        avgRating:
          ideaFeedback.length > 0
            ? Math.round(
                (ideaFeedback.reduce((sum, f) => sum + f.rating, 0) /
                  ideaFeedback.length) *
                  10,
              ) / 10
            : 0,
        ratingDistribution,
        sentimentBreakdown,
        suggestions,
        feedbackTimeSeries,
      },
      feedback: ideaFeedback.map((f) => ({
        id: f.id,
        rating: f.rating,
        feedback: f.feedback,
        sentiment: f.sentiment,
        createdAt: f.createdAt,
      })),
    };
  },
};

function analyzeSentiment(text: string): string {
  const positiveWords = [
    "great",
    "amazing",
    "excellent",
    "love",
    "awesome",
    "wonderful",
    "perfect",
    "best",
    "brilliant",
    "fantastic",
  ];
  const negativeWords = [
    "bad",
    "awful",
    "terrible",
    "hate",
    "worst",
    "horrible",
    "poor",
    "disappointing",
    "useless",
    "waste",
  ];

  const lowerText = text.toLowerCase();

  let positiveCount = 0;
  let negativeCount = 0;

  positiveWords.forEach((word) => {
    if (lowerText.includes(word)) positiveCount++;
  });

  negativeWords.forEach((word) => {
    if (lowerText.includes(word)) negativeCount++;
  });

  if (positiveCount > negativeCount) {
    return "positive";
  } else if (negativeCount > positiveCount) {
    return "negative";
  }

  return "neutral";
}