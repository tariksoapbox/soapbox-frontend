import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    env: { NEXT_PUBLIC_API_URL: '/api' },
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    // MUI + react-hook-form + jsdom interactions can be slow; keep headroom.
    testTimeout: 15000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // The unit surface: pure logic, contracts, copy, and presentational
      // components. The App-Router bootstrap (app/, providers, theme) is
      // validated by `next build` instead.
      include: [
        'src/components/**/*.{ts,tsx}',
        'src/content/**/*.ts',
        'src/lib/**/*.ts',
        'src/schemas/**/*.ts',
      ],
      // Fixtures and the fetch stand-in are test scaffolding, not app surface.
      exclude: ['**/fixtures.ts', 'src/lib/queries/test-server.ts'],
      thresholds: { lines: 100 },
    },
  },
});
