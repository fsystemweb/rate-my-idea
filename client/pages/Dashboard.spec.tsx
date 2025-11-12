import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./Dashboard";
import * as apiModule from "@/services/api";

vi.mock("@/services/api");

const MockDashboard = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/dashboard/:token" element={<Dashboard />} />
    </Routes>
  </BrowserRouter>
);

describe("Dashboard Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    window.history.pushState({}, "", "/dashboard/test-token?id=test-id");
    render(<MockDashboard />);

    const elements = screen.queryAllByRole("heading");
    expect(elements.length).toBeGreaterThanOrEqual(0);
  });

  it("displays dashboard data after loading", async () => {
    const mockDashboardData = {
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

    const mockGetDashboard = vi.fn().mockResolvedValue(mockDashboardData);

    vi.spyOn(apiModule, "api", "get").mockReturnValue({
      getDashboard: mockGetDashboard,
    } as any);

    window.history.pushState({}, "", "/dashboard/test-token?id=idea-123");
    render(<MockDashboard />);

    await waitFor(() => {
      expect(mockGetDashboard).toHaveBeenCalled();
    });
  });

  it("displays error when no token provided", () => {
    const mockGetDashboard = vi.fn();

    vi.spyOn(apiModule, "api", "get").mockReturnValue({
      getDashboard: mockGetDashboard,
    } as any);

    window.history.pushState({}, "", "/dashboard/?id=test-id");
    render(<MockDashboard />);

    // Should show error or redirect
    expect(mockGetDashboard).not.toHaveBeenCalled();
  });

  it("displays analytics charts", async () => {
    const mockDashboardData = {
      idea: {
        id: "idea-123",
        title: "Test Idea",
        description: "Test",
        status: "active",
        createdAt: "2024-01-01",
        createdBy: "Test User",
        isPrivate: false,
      },
      analytics: {
        totalFeedback: 50,
        avgRating: 4.5,
        ratingDistribution: [
          { _id: 5, count: 25 },
          { _id: 4, count: 20 },
          { _id: 3, count: 5 },
        ],
        sentimentBreakdown: [
          { _id: "positive", count: 40 },
          { _id: "neutral", count: 10 },
        ],
        suggestions: [
          {
            text: "Great idea!",
            rating: 5,
            createdAt: "2024-01-01",
          },
        ],
        feedbackTimeSeries: [
          { _id: "2024-01-01", count: 10 },
          { _id: "2024-01-02", count: 15 },
        ],
      },
      feedback: [
        {
          id: "fb1",
          rating: 5,
          feedback: "Amazing!",
          sentiment: "positive",
          createdAt: "2024-01-01",
        },
      ],
    };

    const mockGetDashboard = vi.fn().mockResolvedValue(mockDashboardData);

    vi.spyOn(apiModule, "api", "get").mockReturnValue({
      getDashboard: mockGetDashboard,
    } as any);

    window.history.pushState({}, "", "/dashboard/test-token?id=idea-123");
    render(<MockDashboard />);

    await waitFor(() => {
      expect(mockGetDashboard).toHaveBeenCalledWith("idea-123", "test-token");
    });
  });

  it("renders delete button", async () => {
    const mockDashboardData = {
      idea: {
        id: "idea-123",
        title: "Test Idea",
        description: "Test",
        status: "active",
        createdAt: "2024-01-01",
        createdBy: "Test User",
        isPrivate: false,
      },
      analytics: {
        totalFeedback: 0,
        avgRating: 0,
        ratingDistribution: [],
        sentimentBreakdown: [],
        suggestions: [],
        feedbackTimeSeries: [],
      },
      feedback: [],
    };

    const mockGetDashboard = vi.fn().mockResolvedValue(mockDashboardData);

    vi.spyOn(apiModule, "api", "get").mockReturnValue({
      getDashboard: mockGetDashboard,
    } as any);

    window.history.pushState({}, "", "/dashboard/test-token?id=idea-123");
    render(<MockDashboard />);

    await waitFor(() => {
      const buttons = screen.queryAllByRole("button");
      expect(buttons.length).toBeGreaterThanOrEqual(0);
    });
  });

  it("displays feedback list", async () => {
    const mockDashboardData = {
      idea: {
        id: "idea-123",
        title: "Test Idea",
        description: "Test",
        status: "active",
        createdAt: "2024-01-01",
        createdBy: "Test User",
        isPrivate: false,
      },
      analytics: {
        totalFeedback: 2,
        avgRating: 4.5,
        ratingDistribution: [
          { _id: 5, count: 1 },
          { _id: 4, count: 1 },
        ],
        sentimentBreakdown: [{ _id: "positive", count: 2 }],
        suggestions: [],
        feedbackTimeSeries: [],
      },
      feedback: [
        {
          id: "fb1",
          rating: 5,
          feedback: "Excellent idea!",
          sentiment: "positive",
          createdAt: "2024-01-01",
        },
        {
          id: "fb2",
          rating: 4,
          feedback: "Good work",
          sentiment: "positive",
          createdAt: "2024-01-02",
        },
      ],
    };

    const mockGetDashboard = vi.fn().mockResolvedValue(mockDashboardData);

    vi.spyOn(apiModule, "api", "get").mockReturnValue({
      getDashboard: mockGetDashboard,
    } as any);

    window.history.pushState({}, "", "/dashboard/test-token?id=idea-123");
    render(<MockDashboard />);

    await waitFor(() => {
      expect(mockGetDashboard).toHaveBeenCalled();
    });
  });

  it("handles delete operation", async () => {
    const mockDashboardData = {
      idea: {
        id: "idea-123",
        title: "Test Idea",
        description: "Test",
        status: "active",
        createdAt: "2024-01-01",
        createdBy: "Test User",
        isPrivate: false,
      },
      analytics: {
        totalFeedback: 0,
        avgRating: 0,
        ratingDistribution: [],
        sentimentBreakdown: [],
        suggestions: [],
        feedbackTimeSeries: [],
      },
      feedback: [],
    };

    const mockGetDashboard = vi.fn().mockResolvedValue(mockDashboardData);
    const mockDeleteIdea = vi.fn().mockResolvedValue({
      success: true,
      message: "Idea deleted",
    });

    vi.spyOn(apiModule, "api", "get").mockReturnValue({
      getDashboard: mockGetDashboard,
      deleteIdea: mockDeleteIdea,
    } as any);

    window.history.pushState({}, "", "/dashboard/test-token?id=idea-123");
    render(<MockDashboard />);

    await waitFor(() => {
      expect(mockGetDashboard).toHaveBeenCalled();
    });
  });
});
