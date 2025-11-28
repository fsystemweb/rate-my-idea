import { createRoot } from "react-dom/client";
import { App } from "./App";
import * as Sentry from "@sentry/react";

const SENTRY_URL = import.meta.env.VITE_SENTRY_URL;
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

if (SENTRY_URL && SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_URL + SENTRY_DSN,
    sendDefaultPii: true,
    environment: import.meta.env.MODE,
  });
}

createRoot(document.getElementById("root")!).render(<App />);
