/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Исключаем проблемные директории из trace для избежания рекурсии
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/**',
        'node_modules/webpack/**',
        'node_modules/.cache/**',
        '.next/**',
        '.git/**',
        '.vercel/**',
        'prisma/migrations/**',
        'scripts/**',
        '.github/**',
      ],
    },
  },
}

module.exports = nextConfig

