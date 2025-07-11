import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { htmlPrerender } from "vite-plugin-html-prerender";
import { blogPosts } from "./src/data/blogData";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    htmlPrerender({
      staticDir: path.join(__dirname, "dist"),
      routes: [
        "/",
        "/blog",
        "/terms-of-service",
        "/privacy-policy",
        ...blogPosts.map((post) => `/blog/${post.slug}`),
      ],
      selector: "#root",
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
