import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { htmlPrerender } from "vite-plugin-html-prerender";
import { blogPosts } from "./src/data/blogData";
import type { ViteDevServer } from "vite";
import type { IncomingMessage, ServerResponse } from "http";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Handle trailing slash redirects in development
    middlewareMode: false,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
    configure: (server: ViteDevServer) => {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const url = req.url;
        // Skip if it's an asset request or already doesn't have trailing slash
        if (!url || url.includes('.') || !url.endsWith('/') || url === '/') {
          return next();
        }
        
        // Redirect trailing slash URLs to non-trailing slash versions
        const redirectUrl = url.slice(0, -1);
        res.writeHead(301, { Location: redirectUrl });
        res.end();
      });
    },
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
        "/stats",
        "/changelog",
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
