import { MongoClient, Db } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDB(): Promise<Db> {
  if (db) {
    return db;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db();
    console.log("Connected to MongoDB");

    // Create indexes
    await db.collection("ideas").createIndex({ createdAt: -1 });
    await db.collection("ideas").createIndex({ isPrivate: 1 });
    await db.collection("ideas").createIndex({ responseCount: -1 });
    await db.collection("ideas").createIndex({ creatorToken: 1 });
    await db.collection("feedback").createIndex({ ideaId: 1 });
    await db.collection("feedback").createIndex({ createdAt: -1 });

    return db;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export function getDB(): Db {
  if (!db) {
    throw new Error("Database not connected. Call connectDB first.");
  }
  return db;
}

export async function closeDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("Disconnected from MongoDB");
  }
}
