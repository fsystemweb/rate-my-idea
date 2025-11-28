export interface Idea {
  id: string;
  title: string;
  description: string;
  avgRating: number;
  responseCount: number;
  createdAt: string;
  isPrivate: boolean;
  createdBy?: string;
}

export interface CreateIdeaPayload {
  title: string;
  description: string;
  isPrivate: boolean;
  password?: string;
  createdBy?: string;
  status?: string;
}

export interface FeedbackPayload {
  rating: number;
  feedback?: string;
  password?: string;
}

export interface DashboardData {
  idea: {
    id: string;
    title: string;
    description: string;
    status: string;
    createdAt: string;
    createdBy: string;
    isPrivate: boolean;
  };
  analytics: {
    totalFeedback: number;
    avgRating: number;
    ratingDistribution: Array<{ _id: number; count: number }>;
    sentimentBreakdown: Array<{ _id: string; count: number }>;
    suggestions: Array<{
      text: string;
      rating: number;
      createdAt: string;
    }>;
    feedbackTimeSeries: Array<{
      _id: string;
      count: number;
    }>;
  };
  feedback: Array<{
    id: string;
    rating: number;
    feedback?: string;
    sentiment: string;
    createdAt: string;
  }>;
}

const API_BASE = import.meta.env.VITE_API_URL;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `API Error: ${response.status}`);
  }
  return response.json();
}

export const api = {
  // Ideas
  async createIdea(payload: CreateIdeaPayload) {
    const response = await fetch(`${API_BASE}/ideas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<{
      id: string;
      title: string;
      description: string;
      creatorToken: string;
      isPrivate: boolean;
    }>(response);
  },

  async getPublicIdeas(page = 1) {
    const response = await fetch(
      `${API_BASE}/ideas?page=${page}&status=active`,
    );
    return handleResponse<{
      ideas: Idea[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        hasMore: boolean;
      };
    }>(response);
  },

  async getIdeaDetail(id: string) {
    const response = await fetch(`${API_BASE}/ideas/${id}`);
    return handleResponse<Idea>(response);
  },

  async updateIdea(
    id: string,
    creatorToken: string,
    updates: Partial<CreateIdeaPayload>,
  ) {
    const response = await fetch(
      `${API_BASE}/ideas/${id}?creatorToken=${creatorToken}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      },
    );
    return handleResponse<Idea>(response);
  },

  async deleteIdea(id: string, creatorToken: string) {
    const response = await fetch(
      `${API_BASE}/ideas/${id}?creatorToken=${creatorToken}`,
      {
        method: "DELETE",
      },
    );
    return handleResponse<{ success: boolean; message: string }>(response);
  },

  // Feedback
  async submitFeedback(ideaId: string, payload: FeedbackPayload) {
    const response = await fetch(`${API_BASE}/ideas/${ideaId}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<{
      id: string;
      ideaId: string;
      rating: number;
      feedback?: string;
      sentiment: string;
      createdAt: string;
    }>(response);
  },

  async getFeedback(ideaId: string) {
    const response = await fetch(`${API_BASE}/ideas/${ideaId}/feedback`);
    return handleResponse<{
      feedback: Array<{
        id: string;
        rating: number;
        feedback?: string;
        sentiment: string;
        createdAt: string;
      }>;
    }>(response);
  },

  // Dashboard
  async getDashboard(ideaId: string, creatorToken: string) {
    const response = await fetch(
      `${API_BASE}/ideas/${ideaId}/dashboard?creatorToken=${creatorToken}`,
    );
    return handleResponse<DashboardData>(response);
  },
};
