import { Db, ObjectId } from "mongodb";

export interface Feedback {
  _id?: ObjectId;
  ideaId: ObjectId;
  rating: number;
  feedback?: string;
  createdAt: Date;
  sentiment?: "positive" | "neutral" | "negative";
}

export class FeedbackModel {
  constructor(private db: Db) {}

  async create(feedback: Omit<Feedback, "_id">) {
    const collection = this.db.collection<Feedback>("feedback");
    const result = await collection.insertOne(feedback);
    return { _id: result.insertedId, ...feedback };
  }

  async findByIdeaId(ideaId: ObjectId) {
    const collection = this.db.collection<Feedback>("feedback");
    return collection.find({ ideaId }).sort({ createdAt: -1 }).toArray();
  }

  async getStatsByIdeaId(ideaId: ObjectId) {
    const collection = this.db.collection<Feedback>("feedback");

    const stats = await collection
      .aggregate([
        { $match: { ideaId } },
        {
          $facet: {
            avgRating: [
              { $group: { _id: null, avg: { $avg: "$rating" } } },
            ],
            ratingDistribution: [
              {
                $group: {
                  _id: "$rating",
                  count: { $sum: 1 },
                },
              },
              { $sort: { _id: 1 } },
            ],
            sentimentBreakdown: [
              {
                $group: {
                  _id: "$sentiment",
                  count: { $sum: 1 },
                },
              },
            ],
            totalCount: [
              { $group: { _id: null, count: { $sum: 1 } } },
            ],
            suggestions: [
              { $match: { feedback: { $exists: true, $ne: null } } },
              { $sort: { createdAt: -1 } },
              { $limit: 10 },
              {
                $project: {
                  feedback: 1,
                  rating: 1,
                  createdAt: 1,
                },
              },
            ],
          },
        },
      ])
      .toArray();

    return stats[0] || {};
  }

  async getTimeSeriesData(ideaId: ObjectId) {
    const collection = this.db.collection<Feedback>("feedback");

    return collection
      .aggregate([
        { $match: { ideaId } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();
  }

  async delete(id: ObjectId) {
    const collection = this.db.collection<Feedback>("feedback");
    const result = await collection.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async deleteByIdeaId(ideaId: ObjectId) {
    const collection = this.db.collection<Feedback>("feedback");
    const result = await collection.deleteMany({ ideaId });
    return result.deletedCount;
  }

  async createIndexes() {
    const collection = this.db.collection<Feedback>("feedback");
    await collection.createIndex({ ideaId: 1 });
    await collection.createIndex({ createdAt: -1 });
  }
}
