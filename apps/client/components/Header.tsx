import { Link } from "react-router-dom";
import { Lightbulb } from "lucide-react";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="bg-primary rounded-lg p-2">
              <Lightbulb className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-primary">Rate My Idea</span>
          </Link>
          <Link
            to="/create"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/25 transition-all"
          >
            Create Idea
          </Link>
        </div>
      </div>
    </header>
  );
};
