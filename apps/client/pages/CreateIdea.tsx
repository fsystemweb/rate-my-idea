import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Copy, Check, Eye, EyeOff } from "lucide-react";
import { api } from "@/services/api";

type Step = "info" | "type" | "password" | "complete";

export default function CreateIdea() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("info");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [creatorToken, setCreatorToken] = useState("");
  const [ideaId, setIdeaId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNextStep = async () => {
    if (step === "info" && title.trim() && description.trim()) {
      setStep("type");
    } else if (step === "type") {
      if (isPrivate && password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      setIsSubmitting(true);
      setError(null);
      try {
        const result = await api.createIdea({
          title,
          description,
          isPrivate,
          password: isPrivate ? password : undefined,
          createdBy: "Anonymous",
        });

        setIdeaId(result.id);
        setCreatorToken(result.creatorToken);
        setStep("complete");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create idea");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const shareableLink = `${window.location.origin}/idea/${ideaId}`;
  const dashboardLink = `${window.location.origin}/dashboard/${creatorToken}?id=${ideaId}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container max-w-2xl mx-auto px-4 py-12">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {["info", "type", "complete"].map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                    step === s || (step === "password" && s === "type")
                      ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                      : ["info", "type"].includes(step) &&
                          ["info", "type"].indexOf(s) <
                            ["info", "type"].indexOf(step)
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </div>
                {i < 2 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      ["info", "type"].indexOf(step) >
                      ["info", "type"].indexOf(s)
                        ? "bg-primary"
                        : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step: Info */}
        {step === "info" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Tell Us Your Idea</h1>
              <p className="text-muted-foreground">
                Share the details of what you want feedback on
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Idea Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., AI-powered fitness coach"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your idea in detail. What problem does it solve? Who would use it?"
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/")}
                className="flex-1 px-4 py-3 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNextStep}
                disabled={!title.trim() || !description.trim()}
                className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step: Type Selection */}
        {step === "type" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Choose Privacy Level</h1>
              <p className="text-muted-foreground">
                Decide who can provide feedback on your idea
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Public */}
              <button
                onClick={() => {
                  setIsPrivate(false);
                  setPassword("");
                }}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  !isPrivate
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <div className="text-xl font-bold mb-2">Public</div>
                <div className="text-sm text-muted-foreground mb-4">
                  Anyone can view and provide feedback
                </div>
                <div className="text-xs text-primary font-semibold">
                  {!isPrivate && "✓ Selected"}
                </div>
              </button>

              {/* Private */}
              <button
                onClick={() => setIsPrivate(true)}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  isPrivate
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <div className="text-xl font-bold mb-2">Private</div>
                <div className="text-sm text-muted-foreground mb-4">
                  Only people with password can provide feedback
                </div>
                <div className="text-xs text-primary font-semibold">
                  {isPrivate && "✓ Selected"}
                </div>
              </button>
            </div>

            {isPrivate && (
              <div className="animate-in fade-in slide-in-from-bottom-2">
                <label className="block text-sm font-semibold mb-2">
                  Set Password (minimum 6 characters)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="Enter a secure password"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-12"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {error && (
                  <p className="text-sm text-destructive mt-2">{error}</p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep("info")}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                disabled={(isPrivate && password.length < 6) || isSubmitting}
                className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
              >
                {isSubmitting ? "Creating..." : "Create Idea"}
              </button>
            </div>
          </div>
        )}

        {/* Step: Complete */}
        {step === "complete" && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8"
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
              <h1 className="text-3xl font-bold mb-2">Idea Created!</h1>
              <p className="text-muted-foreground">
                Your idea is ready to receive feedback
              </p>
            </div>

            <div className="space-y-4">
              {/* Shareable Link */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Share This Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareableLink}
                    readOnly
                    className="flex-1 px-4 py-3 rounded-lg border border-border bg-card text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(shareableLink)}
                    className="px-4 py-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    {copied ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Dashboard Link */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Your Private Dashboard
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={dashboardLink}
                    readOnly
                    className="flex-1 px-4 py-3 rounded-lg border border-border bg-card text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(dashboardLink)}
                    className="px-4 py-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    {copied ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  Save this link - you'll need it to access your dashboard
                </p>
              </div>

              {/* Idea Details */}
              <div className="p-6 rounded-xl bg-card border border-border">
                <h3 className="font-semibold mb-4">Your Idea</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Title:</span>
                    <p className="font-medium">{title}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Privacy:</span>
                    <p className="font-medium">
                      {isPrivate ? "Private (Password Protected)" : "Public"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/")}
                className="flex-1 px-4 py-3 rounded-lg border border-border text-foreground hover:bg-muted transition-colors font-semibold"
              >
                Back to Home
              </button>
              <button
                onClick={() => {
                  copyToClipboard(dashboardLink);
                }}
                className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold hover:shadow-lg transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
