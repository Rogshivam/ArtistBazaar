import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import ErrorBoundary from "./lib/ErrorBoundary.tsx";
import App from "./App.tsx";
import "./index.css";

const root = createRoot(document.getElementById("root")!);
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
if (!clientId) {
  console.error("VITE_GOOGLE_CLIENT_ID is not set");
}
root.render(
  <StrictMode>
      <ErrorBoundary >
        <App />
      </ErrorBoundary>
  </StrictMode>
);