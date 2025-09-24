import tailwindcss from '@tailwindcss/vite'
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Proxy /socket.io requests to our NestJS server
      "/socket.io": {
        target: "http://localhost:3000", // Your NestJS server address
        ws: true, // Important for websockets
      },
    },
  },
  resolve: {
    alias: {
      "@shared": "../shared",
    },
  },
});
