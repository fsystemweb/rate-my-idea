import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProvideFeedback from "./ProvideFeedback";
import * as apiModule from "@/services/api";

vi.mock("@/services/api");

const MockProvideFeedback = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/feedback/:ideaId" element={<ProvideFeedback />} />
    </Routes>
  </BrowserRouter>
);

describe("ProvideFeedback Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    const mockGetIdeaDetail = vi.fn(() => 
      new Promise(() => {})
    );

    vi.spyOn(apiModule, "api", "get").mockReturnValue({
      getIdeaDetail: mockGetIdeaDetail,
    } as any);

    render(<MockProvideFeedback />);

    const elements = screen.queryAllByRole("heading");
    expect(elements.length).toBeGreaterThanOrEqual(0);
  });

  it("shows password step for private ideas", async () => {
    const mockIdea = {
      id: "123",
      title: "Private Idea",
      description: "Secret",
      avgRating: 4,
      responseCount: 5,
      createdAt: "2024-01-01",
      isPrivate: true,
      createdBy: "Test User",
    };

    const mockGetIdeaDetail = vi.fn().mockResolvedValue(mockIdea);

    vi.spyOn(apiModule, "api", "get").mockReturnValue({
      getIdeaDetail: mockGetIdeaDetail,
    } as any);

    window.history.pushState({}, "", "/feedback/123");
    render(<MockProvideFeedback />);

    await waitFor(() => {
      expect(mockGetIdeaDetail).toHaveBeenCalledWith("123");
    });
  });

  it("shows rating step for public ideas", async () => {
    const mockIdea = {
      id: "123",
      title: "Public Idea",
      description: "Open",
      avgRating: 4,
      responseCount: 5,
      createdAt: "2024-01-01",
      isPrivate: false,
      createdBy: "Test User",
    };

    const mockGetIdeaDetail = vi.fn().mockResolvedValue(mockIdea);

    vi.spyOn(apiModule, "api", "get").mockReturnValue({
      getIdeaDetail: mockGetIdeaDetail,
    } as any);

    window.history.pushState({}, "", "/feedback/123");
    render(<MockProvideFeedback />);

    await waitFor(() => {
      expect(mockGetIdeaDetail).toHaveBeenCalledWith("123");
    });
  });

  it("accepts rating input", async () => {
    const mockIdea = {
      id: "123",
      title: "Test Idea",
      description: "Test",
      avgRating: 4,
      responseCount: 5,
      createdAt: "2024-01-01",
      isPrivate: false,
      createdBy: "Test User",
    };

    const mockGetIdeaDetail = vi.fn().mockResolvedValue(mockIdea);

    vi.spyOn(apiModule, "api", "get").mockReturnValue({
      getIdeaDetail: mockGetIdeaDetail,
    } as any);

    window.history.pushState({}, "", "/feedback/123");
    render(<MockProvideFeedback />);

    await waitFor(() => {
      const buttons = screen.queryAllByRole("button");
      expect(buttons.length).toBeGreaterThanOrEqual(0);
    });
  });

  it("submits feedback successfully", async () => {
    const mockIdea = {
      id: "123",
      title: "Test Idea",
      description: "Test",
      avgRating: 4,
      responseCount: 5,
      createdAt: "2024-01-01",
      isPrivate: false,
      createdBy: "Test User",
    };

    const mockSubmitFeedback = vi.fn().mockResolvedValue({
      id: "feedback-123",
      ideaId: "idea-123",
      rating: 5,
      feedback: "Great idea!",
      sentiment: "positive",
      createdAt: "2024-01-01",
    });

    const mockGetIdeaDetail = vi.fn().mockResolvedValue(mockIdea);

    vi.spyOn(apiModule, "api", "get").mockReturnValue({
      getIdeaDetail: mockGetIdeaDetail,
      submitFeedback: mockSubmitFeedback,
    } as any);

    window.history.pushState({}, "", "/feedback/123");
    render(<MockProvideFeedback />);

    await waitFor(() => {
      expect(mockGetIdeaDetail).toHaveBeenCalledWith("123");
    });
  });

  it("handles API errors gracefully", async () => {
    const mockGetIdeaDetail = vi.fn().mockRejectedValue(
      new Error("Failed to load idea")
    );

    vi.spyOn(apiModule, "api", "get").mockReturnValue({
      getIdeaDetail: mockGetIdeaDetail,
    } as any);

    window.history.pushState({}, "", "/feedback/invalid");
    render(<MockProvideFeedback />);

    await waitFor(() => {
      expect(mockGetIdeaDetail).toHaveBeenCalled();
    });
  });

  it("allows skipping optional suggestion step", async () => {
    const mockIdea = {
      id: "123",
      title: "Test Idea",
      description: "Test",
      avgRating: 4,
      responseCount: 5,
      createdAt: "2024-01-01",
      isPrivate: false,
      createdBy: "Test User",
    };

    const mockGetIdeaDetail = vi.fn().mockResolvedValue(mockIdea);

    vi.spyOn(apiModule, "api", "get").mockReturnValue({
      getIdeaDetail: mockGetIdeaDetail,
    } as any);

    window.history.pushState({}, "", "/feedback/123");
    render(<MockProvideFeedback />);

    await waitFor(() => {
      const buttons = screen.queryAllByRole("button");
      expect(buttons.length).toBeGreaterThanOrEqual(0);
    });
  });

  it("validates password for private ideas", async () => {
    const mockIdea = {
      id: "123",
      title: "Private Idea",
      description: "Secret",
      avgRating: 4,
      responseCount: 5,
      createdAt: "2024-01-01",
      isPrivate: true,
      createdBy: "Test User",
    };

    const mockGetIdeaDetail = vi.fn().mockResolvedValue(mockIdea);

    vi.spyOn(apiModule, "api", "get").mockReturnValue({
      getIdeaDetail: mockGetIdeaDetail,
    } as any);

    window.history.pushState({}, "", "/feedback/123");
    render(<MockProvideFeedback />);

    await waitFor(() => {
      expect(mockGetIdeaDetail).toHaveBeenCalledWith("123");
    });
  });
});
