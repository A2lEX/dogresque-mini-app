# ⚠️ ВАЖНО: НЕ ДОБАВЛЯЙТЕ `.next/types/**/*.ts` В `include`!

## Проблема

Добавление `.next/types/**/*.ts` в `include` в `tsconfig.json` вызывает:
- Конфликт с `exclude: [".next"]`
- Бесконечную рекурсию в micromatch
- Ошибку "Maximum call stack size exceeded" на Vercel

## Правильная конфигурация

```json
{
  "include": [
    "next-env.d.ts",
    "app",
    "components",
    "lib",
    "hooks",
    "contexts"
  ],
  "exclude": [
    "node_modules",
    ".next",  // ← это исключает ВСЮ директорию .next, включая .next/types
    "out",
    "dist",
    "build",
    ".vercel"
  ]
}
```

## Почему это не нужно?

- Next.js автоматически обрабатывает файлы из `.next/types` во время сборки
- Эти файлы генерируются автоматически и не должны быть в `include`
- TypeScript найдет все нужные файлы через указанные директории

## Если IDE добавляет это автоматически

Отключите автозаполнение для `tsconfig.json` или игнорируйте эти предложения.

