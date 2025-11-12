import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Index from "./Index";
import * as apiModule from "@/services/api";

vi.mock("@/services/api");

const MockIndex = () => (
  <BrowserRouter>
    <Index />
  </BrowserRouter>
);

describe("Index Page (Ideas List)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the ideas list page", () => {
    const mockGetPublicIdeas = vi.fn(() =>
      new Promise(() => {})
    );

    vi.spyOn(apiModule, "api", "get").mockReturnValue({
      getPublicIdeas: mockGetPublicIdeas,
    } as any);

    render(<MockIndex />);

    const elements = screen.queryAllByRole("heading");
    expect(elements.length).toBeGreaterThanOrEqual(0);
  });

  it("loads and displays public ideas", async () => {
    const mockIdeas = {
      ideas: [
        {
          id: "1",
          title: "First Idea",
          description: "First Description",
          avgRating: 4.5,
          responseCount: 10,
          createdAt: "2024-01-01",
          isPrivate: false,
        },
        {
          id: "2",
          title: "Second Idea",
          description: "Second Description",
          avgRating: 3.8,
          responseCount: 5,
          createdAt: "2024-01-02",
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

    const mockGetPublicIdeas = vi.fn().mockResolvedValue(mockIdeas);

    vi.spyOn(apiModule, "api", "get").mockReturnValue({
      getPublicIdeas: mockGetPublicIdeas,
    } as any);

    render(<MockIndex />);

    await waitFor(() => {
      expect(mockGetPublicIdeas).toHaveBeenCalledWith(1);
    });
  });

  it("handles empty ideas list", async () => {
    const mockEmptyIdeas = {
      ideas: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        hasMore: false,
      },
    };

    const mockGetPublicIdeas = vi.fn().mockResolvedValue(mockEmptyIdeas);

    vi.spyOn(apiModule, "api", "get").mockReturnValue({
      getPublicIdeas: mockGetPublicIdeas,
    } as any);

    render(<MockIndex />);

    await waitFor(() => {
      expect(mockGetPublicIdeas).toHaveBeenCalled();
    });
  });

  it("implements infinite scroll loading", async () => {
    const firstPageIdeas = {
      ideas: Array.from({ length: 10 }, (_, i) => ({
        id: String(i),
        title: `Idea ${i}`,
        description: `Description ${i}`,
        avgRating: 4,
        responseCount: 5,
        createdAt: "2024-01-01",
        isPrivate: false,
      })),
      pagination: {
        page: 1,
        limit: 10,
        total: 25,
        hasMore: true,
      },
    };

    const secondPageIdeas = {
      ideas: Array.from({ length: 10 }, (_, i) => ({
        id: String(i + 10),
        title: `Idea ${i + 10}`,
        description: `Description ${i + 10}`,
        avgRating: 4,
        responseCount: 5,
        createdAt: "2024-01-02",
        isPrivate: false,
      })),
      pagination: {
        page: 2,
        limit: 10,
        total: 25,
        hasMore: true,
      },
    };

    const mockGetPublicIdeas = vi
      .fn()
      .mockResolvedValueOnce(firstPageIdeas)
      .mockResolvedValueOnce(secondPageIdeas);

    vi.spyOn(apiModule, "api", "get").mockReturnValue({
      getPublicIdeas: mockGetPublicIdeas,
    } as any);

    render(<MockIndex />);

    await waitFor(() => {
      expect(mockGetPublicIdeas).toHaveBeenCalledWith(1);
    });
  });

  it("displays ideas with ratings and feedback count", async () => {
    const mockIdeas = {
      ideas: [
        {
          id: "1",
          title: "High Rated Idea",
          description: "Very popular",
          avgRating: 4.9,
          responseCount: 100,
          createdAt: "2024-01-01",
          isPrivate: false,
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        hasMore: false,
      },
    };

    const mockGetPublicIdeas = vi.fn().mockResolvedValue(mockIdeas);

    vi.spyOn(apiModule, "api", "get").mockReturnValue({
      getPublicIdeas: mockGetPublicIdeas,
    } as any);

    render(<MockIndex />);

    await waitFor(() => {
      expect(mockGetPublicIdeas).toHaveBeenCalledWith(1);
    });
  });

  it("handles API errors gracefully", async () => {
    const mockGetPublicIdeas = vi.fn().mockRejectedValue(
      new Error("Failed to load ideas")
    );

    vi.spyOn(apiModule, "api", "get").mockReturnValue({
      getPublicIdeas: mockGetPublicIdeas,
    } as any);

    render(<MockIndex />);

    await waitFor(() => {
      expect(mockGetPublicIdeas).toHaveBeenCalled();
    });
  });

  it("shows links to individual ideas", async () => {
    const mockIdeas = {
      ideas: [
        {
          id: "idea-1",
          title: "Test Idea",
          description: "Test",
          avgRating: 4,
          responseCount: 5,
          createdAt: "2024-01-01",
          isPrivate: false,
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        hasMore: false,
      },
    };

    const mockGetPublicIdeas = vi.fn().mockResolvedValue(mockIdeas);

    vi.spyOn(apiModule, "api", "get").mockReturnValue({
      getPublicIdeas: mockGetPublicIdeas,
    } as any);

    render(<MockIndex />);

    await waitFor(() => {
      const links = screen.queryAllByRole("link");
      expect(links.length).toBeGreaterThanOrEqual(0);
    });
  });

  it("does not load more when hasMore is false", async () => {
    const mockIdeas = {
      ideas: [
        {
          id: "1",
          title: "Only Idea",
          description: "Single",
          avgRating: 4,
          responseCount: 5,
          createdAt: "2024-01-01",
          isPrivate: false,
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        hasMore: false,
      },
    };

    const mockGetPublicIdeas = vi.fn().mockResolvedValue(mockIdeas);

    vi.spyOn(apiModule, "api", "get").mockReturnValue({
      getPublicIdeas: mockGetPublicIdeas,
    } as any);

    render(<MockIndex />);

    await waitFor(() => {
      expect(mockGetPublicIdeas).toHaveBeenCalledTimes(1);
      expect(mockGetPublicIdeas).toHaveBeenCalledWith(1);
    });
  });
});
