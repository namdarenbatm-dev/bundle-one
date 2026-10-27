import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

// base نسبی: برنامه هم در ریشه دامنه و هم در مسیر مخزن (مثل /bundle-6/) درست کار می‌کند.
const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

// فهرست فایل‌های Build را داخل sw.js می‌نویسد و شناسه نسخه را برای پاک‌سازی کش قدیمی تغییر می‌دهد.
const swPlugin = () => ({
  name: 'sw-precache',
  apply: 'build',
  closeBundle() {
    const dist = 'dist';
    const files = walk(dist)
      .map((p) => relative(dist, p).split('\\').join('/'))
      .filter((f) => f !== 'sw.js' && !f.endsWith('.map'));
    const list = ['./', ...files];
    const swPath = join(dist, 'sw.js');
    const src = readFileSync(swPath, 'utf8')
      .replace('__PRECACHE__', JSON.stringify(list))
      .replace('__BUILD_ID__', Date.now().toString(36));
    writeFileSync(swPath, src);
  },
});

export default defineConfig({
  base: './',
  plugins: [react(), swPlugin()],
  build: { outDir: 'dist', assetsDir: 'static', sourcemap: false },
});
