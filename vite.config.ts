import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  // Deployed to GitHub Pages at https://<owner>.github.io/latin-app/
  base: '/latin-app/',
  plugins: [react(), tailwindcss()],
});
