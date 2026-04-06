import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isAnalyze = mode === 'analyze';

  return {
    plugins: [
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
      tsconfigPaths: true,
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
          manualChunks: id => {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@tanstack/react-router')) {
              return 'tanstack';
            }
            if (
              id.includes('@radix-ui/react-slot') ||
              id.includes('class-variance-authority') ||
              id.includes('clsx') ||
              id.includes('tailwind-merge')
            ) {
              return 'ui-libs';
            }
          },
        },
      },
    },

    test: {
      environment: 'jsdom',
    },
  };
});
