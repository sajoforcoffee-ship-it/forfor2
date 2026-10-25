import { defineConfig, loadEnv } from 'vite';
import { existsSync, readFileSync } from 'node:fs';
import react from '@vitejs/plugin-react';

function readProjectEnv() {
  const file = '/vercel/share/.env.project';
  if (!existsSync(file)) return {} as Record<string, string>;
  return Object.fromEntries(
    readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .map(line => line.match(/^([A-Z0-9_]+)=(.*)$/))
      .filter((match): match is RegExpMatchArray => Boolean(match))
      .map(([, key, value]) => [key, value.replace(/^['"]|['"]$/g, '')]),
  );
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = { ...readProjectEnv(), ...loadEnv(mode, process.cwd(), ''), ...process.env };
  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(env.VITE_SUPABASE_PUBLISHABLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? env.SUPABASE_PUBLISHABLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? env.SUPABASE_ANON_KEY),
    },
    server: {
      allowedHosts: true,
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});
