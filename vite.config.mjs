import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({ plugins: [vue(),tailwindcss()], css: { postcss: { plugins: [] } }, server: { port: 4175 }, preview: { port: 4175 } });
