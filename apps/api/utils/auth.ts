import crypto from "crypto";
import bcrypt from "bcryptjs";

export function generateCreatorToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function analyzeSentiment(text: string): "positive" | "neutral" | "negative" {
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
