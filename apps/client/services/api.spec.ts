import { describe, it, expect, beforeEach, vi } from "vitest";
import { api } from "./api";

// Mock global fetch
global.fetch = vi.fn();

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

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse,
      } as Response);

      const result = await api.createIdea(payload);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/ideas"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
      );
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

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse,
      } as Response);

      const result = await api.createIdea(payload);

      expect(result.isPrivate).toBe(true);
      expect(global.fetch).toHaveBeenCalled();
    });

    it("should throw error on API failure", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: "Failed to create idea" }),
      } as Response);

      await expect(
        api.createIdea({
          title: "Test",
          description: "Test",
          isPrivate: false,
        }),
      ).rejects.toThrow("Failed to create idea");
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

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      const result = await api.getPublicIdeas(1);

      expect(result.ideas).toHaveLength(1);
      expect(result.pagination.hasMore).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/ideas?page=1"),
      );
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

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      const result = await api.getPublicIdeas();

      expect(result.ideas).toHaveLength(0);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/ideas?page=1"),
      );
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

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockIdea,
      } as Response);

      const result = await api.getIdeaDetail("123");

      expect(result).toEqual(mockIdea);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/ideas/123"),
      );
    });

    it("should handle not found error", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: "Idea not found" }),
      } as Response);

      await expect(api.getIdeaDetail("invalid-id")).rejects.toThrow(
        "Idea not found",
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

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      const result = await api.updateIdea("123", "creator-token", updates);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/ideas/123?creatorToken=creator-token"),
        expect.objectContaining({
          method: "PUT",
        }),
      );
    });
  });

  describe("deleteIdea", () => {
    it("should delete an idea", async () => {
      const mockResponse = {
        success: true,
        message: "Idea deleted successfully",
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      const result = await api.deleteIdea("123", "creator-token");

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/ideas/123?creatorToken=creator-token"),
        expect.objectContaining({
          method: "DELETE",
        }),
      );
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

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse,
      } as Response);

      const result = await api.submitFeedback("idea-123", payload);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/ideas/idea-123/feedback"),
        expect.objectContaining({
          method: "POST",
        }),
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

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse,
      } as Response);

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
            sentiment: "positive",
            createdAt: "2024-01-01",
          },
          {
            id: "feedback-2",
            rating: 3,
            feedback: "Average",
            sentiment: "neutral",
            createdAt: "2024-01-02",
          },
        ],
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      const result = await api.getFeedback("idea-123");

      expect(result.feedback).toHaveLength(2);
      expect(result.feedback[0].sentiment).toBe("positive");
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/ideas/idea-123/feedback"),
      );
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

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      const result = await api.getDashboard("idea-123", "creator-token");

      expect(result.idea.id).toBe("idea-123");
      expect(result.analytics.totalFeedback).toBe(42);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          "/api/ideas/idea-123/dashboard?creatorToken=creator-token",
        ),
      );
    });
  });
});
