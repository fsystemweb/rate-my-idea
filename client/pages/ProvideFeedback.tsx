import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Lock, ArrowRight } from "lucide-react";
import { api, type Idea } from "@/services/api";

type Step = "password" | "rating" | "suggestion" | "complete";

export default function ProvideFeedback() {
  const { ideaId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("rating");
  const [idea, setIdea] = useState<Idea | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [rating, setRating] = useState(5);
  const [suggestion, setSuggestion] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        // If idea is private, start with password step; otherwise rating step
        setStep(ideaData.isPrivate ? "password" : "rating");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load idea");
      } finally {
        setIsLoading(false);
      }
    };

    loadIdea();
  }, [ideaId]);

  const handlePasswordSubmit = () => {
    if (!password.trim()) {
      setPasswordError("Please enter the password");
      return;
    }
    setPasswordError("");
    setStep("rating");
  };

  const handleSubmitFeedback = async () => {
    if (!ideaId) return;

    setIsSubmitting(true);
    try {
      await api.submitFeedback(ideaId, {
        rating,
        feedback: suggestion || undefined,
        password: idea?.isPrivate ? password : undefined,
      });
      setSubmitted(true);
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit feedback");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <Header />
        <div className="container max-w-2xl mx-auto px-4 py-12 flex items-center justify-center min-h-[600px]">
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !idea) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <Header />
        <div className="container max-w-2xl mx-auto px-4 py-12">
          <div className="p-6 rounded-lg bg-destructive/10 border border-destructive/30 text-center">
            <p className="text-destructive font-semibold mb-4">{error}</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Header />

      <div className="container max-w-2xl mx-auto px-4 py-12">
        {/* Password Step */}
        {step === "password" && isPrivateIdea && (
          <div className="max-w-md mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center mb-2">
              This Idea is Private
            </h1>
            <p className="text-center text-muted-foreground mb-8">
              Enter the password to provide feedback
            </p>

            <div className="space-y-4">
              <div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError("");
                  }}
                  placeholder="Enter password"
                  className={`w-full px-4 py-3 rounded-lg border-2 bg-card focus:outline-none transition-all ${
                    passwordError
                      ? "border-destructive focus:ring-2 focus:ring-destructive"
                      : "border-border focus:border-primary focus:ring-2 focus:ring-primary"
                  }`}
                />
                {passwordError && (
                  <p className="text-sm text-destructive mt-2">{passwordError}</p>
                )}
              </div>

              <button
                onClick={handlePasswordSubmit}
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate("/")}
                className="w-full px-4 py-3 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* Rating Step */}
        {step === "rating" && !submitted && (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center">
              How would you rate this idea?
            </h1>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-semibold text-muted-foreground">
                  Not Good
                </span>
                <span className="text-3xl font-bold text-primary">{rating}</span>
                <span className="text-sm font-semibold text-muted-foreground">
                  Excellent
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="10"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full h-3 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-primary [&::-webkit-slider-thumb]:to-secondary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gradient-to-r [&::-moz-range-thumb]:from-primary [&::-moz-range-thumb]:to-secondary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:border-0"
              />

              {/* Visual rating display */}
              <div className="mt-8 flex gap-2 justify-center">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-12 rounded-full transition-all ${
                      i < rating
                        ? "bg-gradient-to-t from-primary to-secondary"
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("password")}
                className="flex-1 px-4 py-3 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep("suggestion")}
                className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Suggestion Step */}
        {step === "suggestion" && !submitted && (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-2 text-center">
              Any suggestions or additional thoughts?
            </h1>
            <p className="text-center text-muted-foreground mb-8">
              (Optional - this helps the creator improve their idea)
            </p>

            <textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="Share your thoughts, suggestions, or concerns..."
              rows={8}
              className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none mb-6"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setStep("rating")}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </div>
        )}

        {/* Complete Step */}
        {submitted && (
          <div className="max-w-md mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground flex items-center justify-center animate-pulse">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-2">Thank You!</h1>
            <p className="text-muted-foreground mb-8">
              Your feedback has been recorded. You'll be redirected to the home
              page.
            </p>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Rating: <span className="font-bold text-foreground">{rating}/10</span>
              </p>
              {suggestion && (
                <p className="text-sm text-muted-foreground">
                  Suggestion recorded: <span className="font-semibold">{suggestion.substring(0, 50)}...</span>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
