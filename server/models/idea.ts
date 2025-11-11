import { Db, ObjectId } from "mongodb";

export interface Idea {
  _id?: ObjectId;
  title: string;
  description: string;
  createdAt: Date;
  isPrivate: boolean;
  password?: string;
  creatorToken: string;
  responseCount: number;
  avgRating: number;
  status: "active" | "archived";
  createdBy: string;
}

export class IdeaModel {
  constructor(private db: Db) {}

  async create(idea: Omit<Idea, "_id">) {
    const collection = this.db.collection<Idea>("ideas");
    const result = await collection.insertOne(idea);
    return { _id: result.insertedId, ...idea };
  }

  async findById(id: ObjectId) {
    const collection = this.db.collection<Idea>("ideas");
    return collection.findOne({ _id: id });
  }

  async findByCreatorToken(token: string) {
    const collection = this.db.collection<Idea>("ideas");
    return collection.findOne({ creatorToken: token });
  }

  async getPaginatedPublic(page: number, limit: number = 10) {
    const collection = this.db.collection<Idea>("ideas");
    const skip = (page - 1) * limit;

    const ideas = await collection
      .find({ isPrivate: false, status: "active" })
      .sort({ createdAt: -1, responseCount: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await collection.countDocuments({
      isPrivate: false,
      status: "active",
    });

    return {
      ideas,
      total,
      page,
      limit,
      hasMore: skip + limit < total,
    };
  }

  async updateResponseCount(ideaId: ObjectId, newCount: number) {
    const collection = this.db.collection<Idea>("ideas");
    await collection.updateOne(
      { _id: ideaId },
      { $set: { responseCount: newCount } }
    );
  }

  async updateAvgRating(ideaId: ObjectId, newAvg: number) {
    const collection = this.db.collection<Idea>("ideas");
    await collection.updateOne(
      { _id: ideaId },
      { $set: { avgRating: newAvg } }
    );
  }

  async update(id: ObjectId, updates: Partial<Idea>) {
    const collection = this.db.collection<Idea>("ideas");
    const result = await collection.updateOne({ _id: id }, { $set: updates });
    return result.modifiedCount > 0;
  }

  async delete(id: ObjectId) {
    const collection = this.db.collection<Idea>("ideas");
    const result = await collection.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async createIndexes() {
    const collection = this.db.collection<Idea>("ideas");
    await collection.createIndex({ createdAt: -1 });
    await collection.createIndex({ isPrivate: 1 });
    await collection.createIndex({ responseCount: -1 });
    await collection.createIndex({ creatorToken: 1 });
  }
}
