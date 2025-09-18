import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "superdev-tagger"; // ⬅️ named import

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
    host: "::",
    port: 5173,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(), // ⬅️ use it here
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
