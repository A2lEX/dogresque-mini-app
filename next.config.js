/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Отключаем outputFileTracing для избежания проблем с рекурсией на Vercel
  experimental: {
    outputFileTracingRoot: process.cwd(),
  },
  // Используем более простой подход к trace
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Исключаем проблемные директории из серверного бандла
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/.next/**', '**/.git/**', '**/.vercel/**', '**/node_modules/**'],
      }
    }
    return config
  },
}

module.exports = nextConfig

