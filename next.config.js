/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Исключаем только проблемные директории, но НЕ node_modules
  // так как Next.js нужен доступ к зависимостям во время выполнения
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        '.next',
        '.git',
        '.vercel',
        'prisma/migrations',
        'scripts',
        '.github',
        'data/dog-breeds.json',
      ],
    },
  },
}

module.exports = nextConfig

