import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const isAnalyze = mode === 'analyze';

  return {
    plugins: [
      tanstackRouter(),
      react(),
      tailwindcss(),
      isAnalyze &&
        visualizer({
          open: true,
          filename: 'dist/stats.html',
          gzipSize: true,
          brotliSize: true,
        }),
    ].filter(Boolean),

    resolve: {
      tsconfigPaths: true, // ← native replacement for vite-tsconfig-paths plugin
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

    test: {
      environment: 'jsdom',
    },
  };
});
