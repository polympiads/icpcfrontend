import tailwindcss from "@tailwindcss/vite";
import { lucideImportOptimizer } from "lucide-vite-plugin";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid(), lucideImportOptimizer(), tailwindcss()],

  server: {
    host: true,
    strictPort: true,
    port: 80,

    watch: {
      usePolling: true,
    },
  },
});
