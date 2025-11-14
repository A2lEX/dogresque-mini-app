/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Исключаем проблемные директории из trace для избежания рекурсии на Vercel
  // Используем простые паттерны без ** чтобы избежать проблем с micromatch
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        'node_modules',
        '.next',
        '.git',
        '.vercel',
        'prisma',
        'scripts',
        '.github',
        'data',
      ],
    },
  },
}

module.exports = nextConfig

