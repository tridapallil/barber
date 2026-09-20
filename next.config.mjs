import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Gera um servidor autocontido em .next/standalone — é o que o Dockerfile usa.
  output: 'standalone',
  // Este projeto não tem ESLint próprio; sem isso o build pega a config de uma pasta acima.
  eslint: { ignoreDuringBuilds: true },
  outputFileTracingRoot: raiz,
};

export default nextConfig;
