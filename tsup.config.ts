import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/app.ts'],
  format: ['cjs'],
  target: 'node18',
  sourcemap: true,
  clean: true,
  noExternal: [
    // Bundle these problematic packages
    'express-fileupload',
    'colors',
  ],
  external: [
    // Keep Node built-ins external
    'fs',
    'path',
    'crypto',
    'os',
    'util',
    'events',
    'stream',
    'http',
    'https',
    'url',
    'querystring',
  ],
});
