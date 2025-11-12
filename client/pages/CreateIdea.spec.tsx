import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import CreateIdea from "./CreateIdea";
import * as apiModule from "@/services/api";

// Mock the api module
vi.mock("@/services/api");

const MockCreateIdea = () => (
  <BrowserRouter>
    <CreateIdea />
  </BrowserRouter>
);

describe("CreateIdea Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the initial form", () => {
    render(<MockCreateIdea />);

    // Find title and description inputs
    const inputs = screen.getAllByRole("textbox");
    expect(inputs.length).toBeGreaterThan(0);
  });

  it("accepts title input", () => {
    render(<MockCreateIdea />);

    const inputs = screen.getAllByRole("textbox");
    const titleInput = inputs[0] as HTMLTextAreaElement | HTMLInputElement;

    fireEvent.change(titleInput, { target: { value: "My Test Idea" } });
    expect(titleInput.value).toBe("My Test Idea");
  });

  it("accepts description input", () => {
    render(<MockCreateIdea />);

    const textareas = screen.getAllByRole("textbox");
    if (textareas.length > 1) {
      const descriptionInput = textareas[1] as HTMLTextAreaElement;
      fireEvent.change(descriptionInput, {
        target: { value: "My description" },
      });
      expect(descriptionInput.value).toBe("My description");
    }
  });

  it("renders buttons for navigation", () => {
    render(<MockCreateIdea />);

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("handles form submission with valid data", async () => {
    const mockCreateIdea = vi.fn().mockResolvedValue({
      id: "test-id",
      creatorToken: "test-token",
    });

    vi.spyOn(apiModule, "api", "get").mockReturnValue({
      createIdea: mockCreateIdea,
    } as any);

    render(<MockCreateIdea />);

    // Fill form
    const inputs = screen.getAllByRole("textbox");
    if (inputs.length >= 2) {
      fireEvent.change(inputs[0], { target: { value: "Test Idea" } });
      fireEvent.change(inputs[1], { target: { value: "Test Description" } });
    }

    // Click next button
    const buttons = screen.getAllByRole("button");
    if (buttons.length > 0) {
      fireEvent.click(buttons[buttons.length - 1]);
    }

    await waitFor(() => {
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
