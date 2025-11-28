import { createRoot } from "react-dom/client";
import { App } from "./App";
import * as Sentry from "@sentry/react";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;


Sentry.init({
  dsn: SENTRY_DSN,
  sendDefaultPii: true
});
createRoot(document.getElementById("root")!).render(<App />);
