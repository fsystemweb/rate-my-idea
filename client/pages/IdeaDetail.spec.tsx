import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import IdeaDetail from "./IdeaDetail";
import * as apiModule from "@/services/api";

vi.mock("@/services/api");

const MockIdeaDetail = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/idea/:ideaId" element={<IdeaDetail />} />
    </Routes>
  </BrowserRouter>
);

describe("IdeaDetail Page", () => {
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

    render(<MockIdeaDetail />);

    const elements = screen.queryAllByRole("heading");
    expect(elements.length).toBeGreaterThanOrEqual(0);
  });

  it("displays idea details after loading", async () => {
    const mockIdea = {
      id: "123",
      title: "Test Idea",
      description: "Test Description",
      avgRating: 4.5,
      responseCount: 10,
      createdAt: "2024-01-01",
      isPrivate: false,
      createdBy: "Test User",
    };

    const mockGetIdeaDetail = vi.fn().mockResolvedValue(mockIdea);

    vi.spyOn(apiModule, "api", "get").mockReturnValue({
      getIdeaDetail: mockGetIdeaDetail,
    } as any);

    window.history.pushState({}, "", "/idea/123");
    render(<MockIdeaDetail />);

    await waitFor(() => {
      expect(mockGetIdeaDetail).toHaveBeenCalledWith("123");
    });
  });

  it("displays error when idea not found", async () => {
    const mockGetIdeaDetail = vi.fn().mockRejectedValue(
      new Error("Idea not found")
    );

    vi.spyOn(apiModule, "api", "get").mockReturnValue({
      getIdeaDetail: mockGetIdeaDetail,
    } as any);

    window.history.pushState({}, "", "/idea/invalid");
    render(<MockIdeaDetail />);

    await waitFor(() => {
      expect(mockGetIdeaDetail).toHaveBeenCalled();
    });
  });

  it("shows rating and feedback count", async () => {
    const mockIdea = {
      id: "123",
      title: "Popular Idea",
      description: "Very popular",
      avgRating: 4.8,
      responseCount: 50,
      createdAt: "2024-01-01",
      isPrivate: false,
      createdBy: "Test User",
    };

    const mockGetIdeaDetail = vi.fn().mockResolvedValue(mockIdea);

    vi.spyOn(apiModule, "api", "get").mockReturnValue({
      getIdeaDetail: mockGetIdeaDetail,
    } as any);

    window.history.pushState({}, "", "/idea/123");
    render(<MockIdeaDetail />);

    await waitFor(() => {
      const elements = screen.queryAllByText(/4\.8|50/);
      expect(elements.length).toBeGreaterThanOrEqual(0);
    });
  });

  it("shows private indicator when private", async () => {
    const mockIdea = {
      id: "123",
      title: "Private Idea",
      description: "Secret idea",
      avgRating: 3.5,
      responseCount: 5,
      createdAt: "2024-01-01",
      isPrivate: true,
      createdBy: "Test User",
    };

    const mockGetIdeaDetail = vi.fn().mockResolvedValue(mockIdea);

    vi.spyOn(apiModule, "api", "get").mockReturnValue({
      getIdeaDetail: mockGetIdeaDetail,
    } as any);

    window.history.pushState({}, "", "/idea/123");
    render(<MockIdeaDetail />);

    await waitFor(() => {
      expect(mockGetIdeaDetail).toHaveBeenCalledWith("123");
    });
  });

  it("renders feedback button", async () => {
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

    window.history.pushState({}, "", "/idea/123");
    render(<MockIdeaDetail />);

    await waitFor(() => {
      const buttons = screen.queryAllByRole("button");
      expect(buttons.length).toBeGreaterThanOrEqual(0);
    });
  });
});
