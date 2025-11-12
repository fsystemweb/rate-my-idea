import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Star, MessageCircle, CalendarIcon } from "lucide-react";
import { api, type Idea } from "@/services/api";

export default function Index() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  {
    /* eslint-disable-next-line */
  }
  const [error, setError] = useState<string | null>(null); // TODO: Fix this
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await api.getPublicIdeas(page);
      setIdeas((prev) => [...prev, ...result.ideas]);
      setHasMore(result.pagination.hasMore);
      setPage((prev) => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ideas");
      console.error("Error loading ideas:", err);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore]);

  useEffect(() => {
    loadMore();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Header />

      {/* Hero Section */}
      <div className="container max-w-7xl mx-auto px-4 py-12 md:py-24">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Share Your Ideas
            </span>
            <br />
            <span className="text-foreground">Get Honest Feedback</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Collect anonymous feedback on your ideas, products, and events. Get
            real insights without bias.
          </p>
          <Link
            to="/create"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:shadow-2xl hover:shadow-primary/30 transition-all transform hover:scale-105"
          >
            Create Your First Idea
          </Link>
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="container max-w-7xl mx-auto px-4 pb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">Trending Ideas</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map((idea) => (
            <Link
              key={idea.id}
              to={`/idea/${idea.id}`}
              className="group block p-6 rounded-xl bg-card border border-border hover:border-primary hover:shadow-xl transition-all duration-200 h-full"
            >
              <div className="flex flex-col h-full">
                <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {idea.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 flex-grow line-clamp-3">
                  {idea.description}
                </p>

                <div className="space-y-4 pt-4 border-t border-border">
                  {/* Rating */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(idea.avgRating / 2)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold">
                        {idea.avgRating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">/10</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MessageCircle className="w-4 h-4" />
                      <span>{idea.responseCount} feedback</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{idea.createdAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Infinite Scroll Trigger */}
        <div
          ref={observerTarget}
          className="flex justify-center items-center py-12"
        >
          {isLoading && (
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
            </div>
          )}
          {!hasMore && ideas.length > 0 && (
            <p className="text-muted-foreground">No more ideas to load</p>
          )}
        </div>
      </div>
    </div>
  );
}
