import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Split heavy vendors into dedicated chunks so the initial bundle stays small
    // and rolldown does not emit a ">500 kB" chunk-size warning.
    rollupOptions: {
      output: {
        // rolldown requires a function form here (object form is rejected).
        // Firebase is split into its three sub-SDKs because the combined
        // bundle exceeds the 500 kB chunk warning threshold.
        manualChunks(id) {
          const norm = id.replace(/\\/g, "/");
          if (!norm.includes("/node_modules/")) return undefined;

          if (
            norm.includes("/node_modules/react/") ||
            norm.includes("/node_modules/react-dom/") ||
            norm.includes("/node_modules/scheduler/")
          ) {
            return "react";
          }

          if (
            norm.includes("/node_modules/firebase/") ||
            norm.includes("/node_modules/@firebase/")
          ) {
            if (norm.includes("firestore")) return "firebase-firestore";
            if (norm.includes("auth")) return "firebase-auth";
            return "firebase-core";
          }

          return undefined;
        },
      },
    },
  },
})
