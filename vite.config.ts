import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },

  vite: {
    server: {
      allowedHosts: ["real-tell-genie-2.onrender.com"],
    },

    preview: {
      allowedHosts: ["real-tell-genie-2.onrender.com"],
    },
  },
});