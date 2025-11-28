import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Star, MessageCircle, CalendarIcon, Lock, Share2 } from "lucide-react";
import { api, type Idea } from "@/services/api";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";

export default function IdeaDetail() {
  const { ideaId } = useParams();
  const navigate = useNavigate();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadIdea = async () => {
      if (!ideaId) {
        setError("Invalid idea ID");
        setIsLoading(false);
        return;
      }

      try {
        const ideaData = await api.getIdeaDetail(ideaId);
        setIdea(ideaData);
        
        const feedbackData = await api.getFeedback(ideaId);
        setFeedbacks(feedbackData.feedback);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load idea");
      } finally {
        setIsLoading(false);
      }
    };

    loadIdea();
  }, [ideaId]);

  if (isLoading) {
    return (
      <div className="min-h-screen ">
        <Header />
        <div className="container max-w-4xl mx-auto px-4 py-12 flex items-center justify-center min-h-[600px]">
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="min-h-screen ">
        <Header />
        <div className="container max-w-4xl mx-auto px-4 py-12">
          <div className="p-6 rounded-lg bg-destructive/10 border border-destructive/30 text-center">
            <p className="text-destructive font-semibold mb-4">
              {error || "Idea not found"}
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const shareLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="min-h-screen ">
      <Header />

      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="text-muted-foreground hover:text-foreground mb-8 font-medium transition-colors"
        >
          ← Back to Ideas
        </button>

        <article className="bg-card rounded-xl border border-border p-8 md:p-12 mb-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start gap-4 mb-4">
              {idea.isPrivate && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  <Lock className="w-3 h-3" />
                  Private
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {idea.title}
            </h1>

            <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  {idea.createdBy}
                </span>
                <span>•</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                {formatDistanceToNow(new Date(idea.createdAt), {
                  addSuffix: true,
                })}
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                {idea.responseCount} feedback
              </div>
            </div>
          </div>

          {/* Rating Display */}
          <div className="flex items-center gap-6 mb-12 p-6 rounded-lg bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <div className="text-4xl font-bold text-primary">
                  {idea.avgRating}
                </div>
                <div className="text-sm text-muted-foreground">/10</div>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(idea.avgRating / 2)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold mb-1">Average Rating</p>
              <p className="text-sm text-muted-foreground">
                Based on {idea.responseCount} ratings from the community
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="prose prose-sm dark:prose-invert max-w-none mb-12">
            <h2 className="text-2xl font-bold mb-4">About This Idea</h2>
            <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {idea.description}
            </p>
          </div>

          {/* CTA Section */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to={`/feedback/${idea.id}`}
              className="flex-1 px-6 py-4 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold text-center hover:shadow-xl transition-all transform hover:scale-105"
            >
              Rate
            </Link>
            <button
              onClick={shareLink}
              className="px-6 py-4 rounded-lg border border-border text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Copy Link to Share
            </button>
          </div>
        </article>

        {/* Recent Feedback */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Recent Feedback</h2>
          <div className="grid gap-4">
            {feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="p-6 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-sm">
                    A
                  </div>
                  <div>
                    <p className="font-semibold">Anonymous Feedback</p>
                    <p className="text-sm text-muted-foreground">
                      Rated {feedback.rating}/10
                    </p>
                  </div>
                </div>
                <p className="text-foreground">
                  {feedback.feedback || 'No feedback provided'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}