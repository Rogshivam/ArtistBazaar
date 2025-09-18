import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ErrorBoundary from "./lib/ErrorBoundary.tsx";
import App from "./App.tsx";
import "./index.css";

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </GoogleOAuthProvider>
  </StrictMode>
);