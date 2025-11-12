import { describe, it, expect, beforeEach, vi } from "vitest";
import { api } from "./api";
import * as mockApiModule from "./mockApi";

// Mock mockApi
vi.mock("./mockApi", () => ({
  mockApi: {
    createIdea: vi.fn(),
    getPublicIdeas: vi.fn(),
    getIdeaDetail: vi.fn(),
    updateIdea: vi.fn(),
    deleteIdea: vi.fn(),
    submitFeedback: vi.fn(),
    getFeedback: vi.fn(),
    getDashboard: vi.fn(),
  },
}));

describe("api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createIdea", () => {
    it("should create an idea successfully", async () => {
      const payload = {
        title: "Test Idea",
        description: "Test Description",
        isPrivate: false,
        createdBy: "Test User",
      };

      const mockResponse = {
        id: "123",
        title: "Test Idea",
        description: "Test Description",
        creatorToken: "token-123",
        isPrivate: false,
      };

      vi.mocked(mockApiModule.mockApi.createIdea).mockResolvedValueOnce(mockResponse);

      const result = await api.createIdea(payload);

      expect(result).toEqual(mockResponse);
      expect(mockApiModule.mockApi.createIdea).toHaveBeenCalledWith(payload);
    });

    it("should handle private ideas with password", async () => {
      const payload = {
        title: "Private Idea",
        description: "Secret Description",
        isPrivate: true,
        password: "secure-password",
        createdBy: "Test User",
      };

      const mockResponse = {
        id: "456",
        title: "Private Idea",
        description: "Secret Description",
        creatorToken: "token-456",
        isPrivate: true,
      };

      vi.mocked(mockApiModule.mockApi.createIdea).mockResolvedValueOnce(mockResponse);

      const result = await api.createIdea(payload);

      expect(result.isPrivate).toBe(true);
      expect(mockApiModule.mockApi.createIdea).toHaveBeenCalled();
    });

    it("should throw error on API failure", async () => {
      vi.mocked(mockApiModule.mockApi.createIdea).mockRejectedValueOnce(
        new Error("Failed to create idea")
      );

      await expect(api.createIdea({
        title: "Test",
        description: "Test",
        isPrivate: false,
      })).rejects.toThrow("Failed to create idea");
    });
  });

  describe("getPublicIdeas", () => {
    it("should fetch public ideas with pagination", async () => {
      const mockResponse = {
        ideas: [
          {
            id: "1",
            title: "Idea 1",
            description: "Description 1",
            avgRating: 4.5,
            responseCount: 10,
            createdAt: "2024-01-01",
            isPrivate: false,
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 100,
          hasMore: true,
        },
      };

      vi.mocked(mockApiModule.mockApi.getPublicIdeas).mockResolvedValueOnce(mockResponse);

      const result = await api.getPublicIdeas(1);

      expect(result.ideas).toHaveLength(1);
      expect(result.pagination.hasMore).toBe(true);
      expect(mockApiModule.mockApi.getPublicIdeas).toHaveBeenCalledWith(1);
    });

    it("should fetch first page by default", async () => {
      const mockResponse = {
        ideas: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          hasMore: false,
        },
      };

      vi.mocked(mockApiModule.mockApi.getPublicIdeas).mockResolvedValueOnce(mockResponse);

      const result = await api.getPublicIdeas();

      expect(result.ideas).toHaveLength(0);
      expect(mockApiModule.mockApi.getPublicIdeas).toHaveBeenCalled();
    });
  });

  describe("getIdeaDetail", () => {
    it("should fetch idea details by ID", async () => {
      const mockIdea = {
        id: "123",
        title: "Test Idea",
        description: "Test Description",
        avgRating: 4.2,
        responseCount: 5,
        createdAt: "2024-01-01",
        isPrivate: false,
        createdBy: "Test User",
      };

      vi.mocked(mockApiModule.mockApi.getIdeaDetail).mockResolvedValueOnce(mockIdea);

      const result = await api.getIdeaDetail("123");

      expect(result).toEqual(mockIdea);
      expect(mockApiModule.mockApi.getIdeaDetail).toHaveBeenCalledWith("123");
    });

    it("should handle not found error", async () => {
      vi.mocked(mockApiModule.mockApi.getIdeaDetail).mockRejectedValueOnce(
        new Error("Idea not found")
      );

      await expect(api.getIdeaDetail("invalid-id")).rejects.toThrow(
        "Idea not found"
      );
    });
  });

  describe("updateIdea", () => {
    it("should update an idea", async () => {
      const updates = {
        title: "Updated Idea",
        description: "Updated Description",
      };

      const mockResponse = {
        id: "123",
        title: "Updated Idea",
        description: "Updated Description",
        avgRating: 4.2,
        responseCount: 5,
        createdAt: "2024-01-01",
        isPrivate: false,
      };

      vi.mocked(mockApiModule.mockApi.updateIdea).mockResolvedValueOnce(mockResponse);

      const result = await api.updateIdea("123", "creator-token", updates);

      expect(result).toEqual(mockResponse);
      expect(mockApiModule.mockApi.updateIdea).toHaveBeenCalledWith(
        "123",
        "creator-token",
        updates
      );
    });
  });

  describe("deleteIdea", () => {
    it("should delete an idea", async () => {
      const mockResponse = {
        success: true,
        message: "Idea deleted successfully",
      };

      vi.mocked(mockApiModule.mockApi.deleteIdea).mockResolvedValueOnce(mockResponse);

      const result = await api.deleteIdea("123", "creator-token");

      expect(result.success).toBe(true);
      expect(mockApiModule.mockApi.deleteIdea).toHaveBeenCalledWith("123", "creator-token");
    });
  });

  describe("submitFeedback", () => {
    it("should submit feedback successfully", async () => {
      const payload = {
        rating: 5,
        feedback: "Great idea!",
      };

      const mockResponse = {
        id: "feedback-123",
        ideaId: "idea-123",
        rating: 5,
        feedback: "Great idea!",
        sentiment: "positive",
        createdAt: "2024-01-01",
      };

      vi.mocked(mockApiModule.mockApi.submitFeedback).mockResolvedValueOnce(mockResponse);

      const result = await api.submitFeedback("idea-123", payload);

      expect(result).toEqual(mockResponse);
      expect(mockApiModule.mockApi.submitFeedback).toHaveBeenCalledWith(
        "idea-123",
        payload
      );
    });

    it("should submit feedback with password for private ideas", async () => {
      const payload = {
        rating: 4,
        feedback: "Good idea",
        password: "secret-password",
      };

      const mockResponse = {
        id: "feedback-456",
        ideaId: "idea-456",
        rating: 4,
        feedback: "Good idea",
        sentiment: "positive",
        createdAt: "2024-01-01",
      };

      vi.mocked(mockApiModule.mockApi.submitFeedback).mockResolvedValueOnce(mockResponse);

      const result = await api.submitFeedback("idea-456", payload);

      expect(result).toEqual(mockResponse);
    });
  });

  describe("getFeedback", () => {
    it("should fetch feedback for an idea", async () => {
      const mockResponse = {
        feedback: [
          {
            id: "feedback-1",
            rating: 5,
            feedback: "Excellent!",
            sentiment: "positive" as const,
            createdAt: "2024-01-01",
          },
          {
            id: "feedback-2",
            rating: 3,
            feedback: "Average",
            sentiment: "neutral" as const,
            createdAt: "2024-01-02",
          },
        ],
      };

      vi.mocked(mockApiModule.mockApi.getFeedback).mockResolvedValueOnce(mockResponse);

      const result = await api.getFeedback("idea-123");

      expect(result.feedback).toHaveLength(2);
      expect(result.feedback[0].sentiment).toBe("positive");
      expect(mockApiModule.mockApi.getFeedback).toHaveBeenCalledWith("idea-123");
    });
  });

  describe("getDashboard", () => {
    it("should fetch dashboard data", async () => {
      const mockResponse = {
        idea: {
          id: "idea-123",
          title: "Test Idea",
          description: "Test Description",
          status: "active",
          createdAt: "2024-01-01",
          createdBy: "Test User",
          isPrivate: false,
        },
        analytics: {
          totalFeedback: 42,
          avgRating: 4.1,
          ratingDistribution: [
            { _id: 5, count: 20 },
            { _id: 4, count: 15 },
            { _id: 3, count: 5 },
            { _id: 2, count: 2 },
            { _id: 1, count: 0 },
          ],
          sentimentBreakdown: [
            { _id: "positive", count: 25 },
            { _id: "neutral", count: 15 },
            { _id: "negative", count: 2 },
          ],
          suggestions: [],
          feedbackTimeSeries: [],
        },
        feedback: [],
      };

      vi.mocked(mockApiModule.mockApi.getDashboard).mockResolvedValueOnce(mockResponse);

      const result = await api.getDashboard("idea-123", "creator-token");

      expect(result.idea.id).toBe("idea-123");
      expect(result.analytics.totalFeedback).toBe(42);
      expect(mockApiModule.mockApi.getDashboard).toHaveBeenCalledWith(
        "idea-123",
        "creator-token"
      );
    });
  });
});
