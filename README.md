# patrons.dog

Next.js приложение для управления донатами собакам.

## Возможности

- ✅ Регистрация пользователей (шелтеров и частных лиц)
- ✅ Добавление собак с полной информацией
- ✅ Добавление фотографий собак
- ✅ Добавление историй о собаках
- ✅ Добавление сторис для собак

## Установка

1. Установите зависимости:
```bash
npm install
```

2. Создайте файл `.env.local` на основе `.env.example`:
```bash
cp .env.example .env.local
```

3. Настройте URL вашего API в `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Запуск

Запустите dev сервер:
```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Структура проекта

```
├── app/
│   ├── page.tsx              # Главная страница
│   ├── layout.tsx            # Основной layout
│   ├── globals.css           # Глобальные стили
│   ├── register/             # Регистрация пользователей
│   └── dogs/
│       ├── add/              # Добавление собаки
│       ├── stories/add/      # Добавление сторис
│       ├── photos/add/      # Добавление фото
│       └── history/add/     # Добавление истории
├── lib/
│   └── api.ts               # API клиент
└── openapi.yaml             # OpenAPI спецификация
```

## API Endpoints

Приложение использует следующие endpoints из OpenAPI спецификации:

- `POST /shelters` - Регистрация шелтера
- `POST /private-persons` - Регистрация частного лица
- `POST /dogs` - Добавление собаки
- `POST /dog-stories` - Добавление сторис
- `POST /dog-photos` - Добавление фотографии
- `POST /dog-history` - Добавление истории

## Технологии

- Next.js 14
- React 18
- TypeScript
- Axios

