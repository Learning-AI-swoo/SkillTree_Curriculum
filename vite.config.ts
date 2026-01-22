import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Replace 'Skilltree-Curriculum' with your actual GitHub repository name
  base: '/SkillTree-Curriculum/', 
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
