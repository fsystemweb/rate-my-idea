import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Copy, Check, Trash2, Archive } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api, type DashboardData } from "@/services/api";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";

export default function Dashboard() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!token) {
        setError("Invalid dashboard token");
        setIsLoading(false);
        return;
      }

      try {
        const ideaId = new URLSearchParams(window.location.search).get("id");
        if (!ideaId) {
          setError(
            "Please provide both idea ID and creator token to view the dashboard",
          );
          setIsLoading(false);
          return;
        }

        const dashboardData = await api.getDashboard(ideaId, token);
        setData(dashboardData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [token]);

  const handleDelete = async () => {
    if (!data?.idea?.id) return;

    try {
      await api.deleteIdea(data.idea.id, token!);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete idea");
    }
  };

  const handleArchive = async () => {
    if (!data?.idea?.id) return;

    try {
      // Update the idea status to 'archived'
      await api.updateIdea(data.idea.id, token!, { status: "archived" });

      // Update local state
      setData((prev) =>
        prev
          ? {
              ...prev,
              idea: { ...prev.idea, status: "archived" },
            }
          : null,
      );

      setShowArchiveConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to archive idea");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen ">
        <Header />
        <div className="container max-w-7xl mx-auto px-4 py-12 flex items-center justify-center min-h-[600px]">
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen ">
        <Header />
        <div className="container max-w-7xl mx-auto px-4 py-12">
          <div className="p-6 rounded-lg bg-destructive/10 border border-destructive/30 text-center">
            <p className="text-destructive font-semibold mb-4">
              {error || "Failed to load dashboard"}
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

  const idea = data.idea;
  const analytics = data.analytics;
  const ratingData = analytics.ratingDistribution.map(
    (item: { _id: number; count: number }) => ({
      rating: item._id?.toString() || "0",
      count: item.count,
    }),
  );
  // prettier-ignore
  {/* eslint-disable-next-line */ }
  const sentimentData = analytics.sentimentBreakdown.map((item: any) => ({
    // TODO: Fix this
    name:
      item._id === "positive"
        ? "Positive"
        : item._id === "negative"
          ? "Negative"
          : "Neutral",
    value: item.count,
    fill:
      item._id === "positive"
        ? "#10b981"
        : item._id === "negative"
          ? "#ef4444"
          : "#6b7280",
  }));
  // prettier-ignore
  {/* eslint-disable-next-line */ }
  const timeSeriesData = analytics.feedbackTimeSeries.map((item: any) => ({
    // TODO: Fix this
    date: new Date(item._id).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    feedback: item.count,
  }));

  const shareableLink = `${window.location.origin}/idea/${idea.id}`;

  return (
    <div className="min-h-screen ">
      <Header />

      <div className="container max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{idea.title}</h1>
            <p className="text-muted-foreground">{idea.description}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => copyToClipboard(shareableLink)}
              className="px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </button>
            <button
              onClick={() => setShowArchiveConfirm(true)}
              className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors flex items-center gap-2"
            >
              <Archive className="w-4 h-4" />
              Archive
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Average Rating */}
          <div className="p-8 rounded-xl bg-card border border-border">
            <p className="text-sm text-muted-foreground font-semibold mb-2">
              Average Rating
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-primary">
                {analytics.avgRating.toFixed(1)}
              </span>
              <span className="text-xl text-muted-foreground">/10</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Based on {analytics.totalFeedback} ratings
            </p>
          </div>

          {/* Total Feedback */}
          <div className="p-8 rounded-xl bg-card border border-border">
            <p className="text-sm text-muted-foreground font-semibold mb-2">
              Total Feedback
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-secondary">
                {analytics.totalFeedback}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Responses received
            </p>
          </div>

          {/* Status */}
          <div className="p-8 rounded-xl bg-card border border-border">
            <p className="text-sm text-muted-foreground font-semibold mb-2">
              Status
            </p>
            <div className="inline-flex items-center gap-2 text-2xl font-bold">
              {idea.status === "archived" ? (
                <div className="w-3 h-3 rounded-full bg-muted-foreground" />
              ) : (
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              )}
              <span className="capitalize">{idea.status}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Created {new Date(idea.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Rating Distribution */}
          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="text-lg font-bold mb-4">Rating Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ratingData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="url(#gradient)"
                  radius={[8, 8, 0, 0]}
                />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={1}
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(var(--secondary))"
                      stopOpacity={1}
                    />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Sentiment Breakdown */}
          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="text-lg font-bold mb-4">Sentiment Breakdown</h3>
            <div className="flex items-center justify-center h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 text-sm">
              {sentimentData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Over Time */}
          <div className="lg:col-span-2 p-6 rounded-xl bg-card border border-border">
            <h3 className="text-lg font-bold mb-4">Feedback Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="feedback"
                  stroke="url(#lineGradient)"
                  dot={{
                    fill: "hsl(var(--primary))",
                    r: 5,
                  }}
                  strokeWidth={3}
                />
                <defs>
                  <linearGradient
                    id="lineGradient"
                    x1="0"
                    y1="0"
                    x2="100%"
                    y2="0"
                  >
                    <stop
                      offset="0%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={1}
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(var(--secondary))"
                      stopOpacity={1}
                    />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Suggestions */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <h3 className="text-lg font-bold mb-6">Suggestions & Feedback</h3>
          <div className="space-y-4">
            {analytics.suggestions.length > 0 ? (
              analytics.suggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-muted/30 border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium flex-1">{suggestion.text}</p>
                    <span className="text-sm font-semibold text-primary ml-4">
                      {suggestion.rating}/10
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(suggestion.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No suggestions yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Archive Confirmation Modal */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border p-6 max-w-sm">
            <h2 className="text-xl font-bold mb-2">Archive Idea?</h2>
            <p className="text-muted-foreground mb-6">
              This will hide the idea from public view but keep all data intact.
              You can unarchive it later if needed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowArchiveConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleArchive}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border p-6 max-w-sm">
            <h2 className="text-xl font-bold mb-2">Delete Idea?</h2>
            <p className="text-muted-foreground mb-6">
              This action cannot be undone. All feedback and data will be
              permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
