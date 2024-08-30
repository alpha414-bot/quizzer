import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: "skala-u3",
      project: "quizzer",
    }),
  ],
  assetsInclude: "**/*.psd",
  resolve: {
    alias: {
      "@": "/src",
    },
  },

  build: {
    sourcemap: true,
  },
});
