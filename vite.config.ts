import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isAnalyze = mode === 'analyze';

  return {
    plugins: [
      react(),
      tailwindcss(),
      tsconfigPaths(),
      isAnalyze &&
        visualizer({
          open: true,
          filename: 'dist/stats.html',
          gzipSize: true,
          brotliSize: true,
        }),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@/components': path.resolve(__dirname, './src/components'),
        '@/layouts': path.resolve(__dirname, './src/layouts'),
        '@/ui': path.resolve(__dirname, './src/components/ui'),
        '@/hooks': path.resolve(__dirname, './src/hooks'),
        '@/lib/ui': path.resolve(__dirname, './src/lib/ui'),
        '@/lib/ui/utils': path.resolve(__dirname, './src/lib/ui/utils'),
      },
    },
    build: {
      sourcemap: !isAnalyze,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            tanstack: ['@tanstack/react-router'],
            'ui-libs': [
              '@radix-ui/react-slot',
              'class-variance-authority',
              'clsx',
              'tailwind-merge',
            ],
          },
        },
      },
    },
  };
});
