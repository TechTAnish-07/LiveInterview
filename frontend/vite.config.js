import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["@monaco-editor/react"]
  },
  define: {
    global: "window",
  }
});
