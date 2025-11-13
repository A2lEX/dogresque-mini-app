// Утилиты для работы с JWT токенами

const TOKEN_KEY = 'dogresque_access_token'
const USER_KEY = 'dogresque_user'
export const AUTH_CHANGE_EVENT = 'dogresque-auth-changed'

export interface User {
  id: string
  firstName?: string
  lastName?: string
  email: string
  role: string
  createdAt?: string
}

export interface AuthResponse {
  access_token: string
  user: User
}

const dispatchAuthChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
  }
}

// Сохранение токена и пользователя
export const saveAuth = (authData: AuthResponse): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, authData.access_token)
    localStorage.setItem(USER_KEY, JSON.stringify(authData.user))
    dispatchAuthChange()
  }
}

// Получение токена
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY)
  }
  return null
}

// Получение пользователя
export const getUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem(USER_KEY)
    if (userStr) {
      try {
        return JSON.parse(userStr)
      } catch {
        return null
      }
    }
  }
  return null
}

// Обновление информации о пользователе в localStorage
export const updateStoredUser = (updates: Partial<User>): void => {
  if (typeof window === 'undefined') {
    return
  }

  const currentUser = getUser()
  if (!currentUser) {
    return
  }

  const updatedUser: User = {
    ...currentUser,
    ...updates,
  }

  localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
  dispatchAuthChange()
}

// Проверка авторизации
export const isAuthenticated = (): boolean => {
  return getToken() !== null
}

// Выход
export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    dispatchAuthChange()
  }
}

// Очистка токена и пользователя
export const clearAuth = (): void => {
  logout()
}

