// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import express from "express";
import type { Express } from "express";
import type { Server } from "http";
import { createIdeaSubmissionLimiter } from "../middleware/rate-limit";

function listen(app: Express): Promise<Server> {
  return new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => resolve(server));
  });
}

function close(server: Server): Promise<void> {
  return new Promise((resolve) => server.close(() => resolve()));
}

function post(url: string, body: unknown, headers: Record<string, string> = {}): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body ?? {}),
  });
}

function withTrustProxy(app: Express): Express {
  app.use(express.json());
  app.set("trust proxy", 1);
  return app;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("createIdeaSubmissionLimiter", () => {
  it("rejects requests beyond the configured per-IP limit with a 429", async () => {
    vi.stubEnv("IDEA_SUBMISSION_LIMIT", "2");
    vi.stubEnv("IDEA_SUBMISSION_WINDOW_MINUTES", "60");

    const app = withTrustProxy(express());
    app.post("/api/ideas", createIdeaSubmissionLimiter(), (_req, res) => res.json({ ok: true }));

    const server = await listen(app);
    try {
      const url = `http://127.0.0.1:${(server.address() as { port: number }).port}/api/ideas`;
      const client = { "x-forwarded-for": "203.0.113.7" };

      expect((await post(url, {}, client)).status).toBe(200);
      expect((await post(url, {}, client)).status).toBe(200);

      const blocked = await post(url, {}, client);
      expect(blocked.status).toBe(429);
      expect((await blocked.json()).error).toMatch(/Too many ideas submitted/i);
      // Rate-limit responses should tell the client when to retry.
      expect(Number(blocked.headers.get("retry-after"))).toBeGreaterThan(0);

      // A different IP is not affected by another client's budget.
      const otherClient = await post(url, {}, { "x-forwarded-for": "203.0.113.8" });
      expect(otherClient.status).toBe(200);

      // The same client is still blocked within the window.
      const stillBlocked = await post(url, {}, client);
      expect(stillBlocked.status).toBe(429);
    } finally {
      await close(server);
    }
  });

  it("exposes standard rate-limit headers on allowed requests", async () => {
    vi.stubEnv("IDEA_SUBMISSION_LIMIT", "5");
    vi.stubEnv("IDEA_SUBMISSION_WINDOW_MINUTES", "60");

    const app = withTrustProxy(express());
    app.post("/api/ideas", createIdeaSubmissionLimiter(), (_req, res) => res.json({ ok: true }));

    const server = await listen(app);
    try {
      const url = `http://127.0.0.1:${(server.address() as { port: number }).port}/api/ideas`;
      const first = await post(url, {}, { "x-forwarded-for": "198.51.100.9" });
      expect(first.status).toBe(200);
      expect(first.headers.get("ratelimit-remaining")).toBe("4");
      expect(first.headers.get("ratelimit-limit")).toBe("5");
    } finally {
      await close(server);
    }
  });
});
