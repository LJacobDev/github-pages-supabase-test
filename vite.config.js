import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: "/github-pages-supabase-test/", // Set this to your repository name
  build: {
    outDir: "dist", // Ensure the output directory matches the GitHub Actions workflow
  },
});
