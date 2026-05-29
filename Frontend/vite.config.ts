import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

// ESM-safe __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    chunkSizeWarningLimit: 1000, // only warning threshold (safe)

    rollupOptions: {
      output: {
        // IMPORTANT: DO NOT manually split vendor chunks
        // Vite handles this safely itself

        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name?.split(".").pop();
          if (ext === "css") return "assets/[name]-[hash].css";
          return "assets/[name]-[hash][extname]";
        },

        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
  },
});