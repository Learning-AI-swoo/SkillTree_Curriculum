import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Replace 'skilltree-curriculum-mapper' with your actual GitHub repository name
  base: '/skilltree-curriculum-mapper/', 
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
