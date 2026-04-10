import { resolve } from "node:path";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@zuam\/shared$/,
        replacement: resolve(__dirname, "../shared/src/index.ts")
      },
      {
        find: /^@zuam\/shared\/(.*)$/,
        replacement: resolve(__dirname, "../shared/src/$1")
      }
    ]
  },
  server: {
    port: 3000
  },
  plugins: [tanstackStart(), react()]
});
