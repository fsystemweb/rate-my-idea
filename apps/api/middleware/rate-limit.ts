import type { RequestHandler } from "express";
import { rateLimit, HOUR, MINUTE } from "express-rate-limit";

/**
 * Builds the per-IP rate limiter for anonymous idea submissions (POST /api/ideas).
 *
 * Counters live in process memory only: the product is anonymous by design and
 * IP addresses are never persisted or logged.
 *
 * Caveats worth knowing:
 * - When the API runs as multiple serverless instances, each instance counts
 *   separately; the limit is therefore a best-effort per-instance cap rather
 *   than a global one.
 * - Requires `app.set("trust proxy", ...)` for `req.ip` to be the real client
 *   IP behind the ALB / API Gateway hop.
 *
 * Limits are configurable via environment variables:
 * - `IDEA_SUBMISSION_LIMIT` — max submissions per IP per window (default 10)
 * - `IDEA_SUBMISSION_WINDOW_MINUTES` — window length in minutes (default 60)
 */
export function createIdeaSubmissionLimiter(): RequestHandler {
  const limit = positiveInt(process.env.IDEA_SUBMISSION_LIMIT, 10);
  const windowMinutes = positiveInt(process.env.IDEA_SUBMISSION_WINDOW_MINUTES, 60);
  const windowMs = Math.min(windowMinutes, 24 * 60) * MINUTE; // cap at one day

  return rateLimit({
    windowMs,
    limit,
    message: {
      error: `Too many ideas submitted. Please try again in about ${windowMinutes} minute(s).`,
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

/** Reads a strictly positive integer from an environment variable. */
function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = value === undefined ? NaN : Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
