import axios from 'axios';
import { getToken, clearAuth, type AuthResponse } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена в запросы
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ошибок авторизации
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Публичные эндпоинты не требуют авторизации
      const publicEndpoints = ['/dog-breeds'];
      const isPublicEndpoint = publicEndpoints.some((endpoint) => 
        error.config?.url?.includes(endpoint)
      );
      
      if (!isPublicEndpoint) {
        // Токен истек или невалиден - очищаем авторизацию
        clearAuth();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Типы для API - Регистрация и аутентификация
export interface RegisterShelterDto {
  name: string;
  email: string;
  password: string; // минимум 6 символов
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
  logoUrl?: string;
}

export interface RegisterPrivatePersonDto {
  firstName: string;
  email: string;
  password: string; // минимум 6 символов
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface LoginDto {
  email: string;
  password: string;
  userType: 'shelter' | 'private_person';
}

// Типы для создания/обновления (без пароля)
export interface CreateShelterDto {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
}

export interface UpdateShelterDto {
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
}

export interface CreatePrivatePersonDto {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface UpdatePrivatePersonDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface CreateDogDto {
  name: string;
  breed?: string;
  breedId?: string;
  age?: number; // 0-30
  description?: string;
  imageUrl?: string;
  shelterId?: string;
  privatePersonId?: string;
}

export interface UpdateDogDto {
  name?: string;
  breed?: string;
  breedId?: string;
  age?: number;
  description?: string;
  imageUrl?: string;
  status?: 'active' | 'completed' | 'archived';
  shelterId?: string;
  privatePersonId?: string;
}

export interface CreateDogStoryDto {
  dogId: string;
  content: string;
  title?: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface UpdateDogStoryDto {
  title?: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface CreateDogPhotoDto {
  dogId: string;
  imageUrl: string;
  caption?: string;
  location?: string;
}

export interface UpdateDogPhotoDto {
  imageUrl?: string;
  caption?: string;
  location?: string;
}

export interface CreateDogHistoryDto {
  dogId: string;
  title: string;
  description: string;
  eventDate?: string; // ISO date-time string
}

export interface UpdateDogHistoryDto {
  title?: string;
  description?: string;
  eventDate?: string; // ISO date-time string
}

// API функции для аутентификации
export const authApi = {
  registerShelter: async (data: RegisterShelterDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register/shelter', data);
    return response.data;
  },
  registerPrivatePerson: async (data: RegisterPrivatePersonDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register/private-person', data);
    return response.data;
  },
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

// API функции для шелтеров
export const sheltersApi = {
  create: async (data: CreateShelterDto) => {
    const response = await apiClient.post('/shelters', data);
    return response.data;
  },
  findAll: async () => {
    const response = await apiClient.get('/shelters');
    return response.data;
  },
  findOne: async (id: string) => {
    const response = await apiClient.get(`/shelters/${id}`);
    return response.data;
  },
  update: async (id: string, data: UpdateShelterDto) => {
    const response = await apiClient.patch(`/shelters/${id}`, data);
    return response.data;
  },
  remove: async (id: string) => {
    const response = await apiClient.delete(`/shelters/${id}`);
    return response.data;
  },
};

// API функции для частных лиц
export const privatePersonsApi = {
  create: async (data: CreatePrivatePersonDto) => {
    const response = await apiClient.post('/private-persons', data);
    return response.data;
  },
  findAll: async () => {
    const response = await apiClient.get('/private-persons');
    return response.data;
  },
  findOne: async (id: string) => {
    const response = await apiClient.get(`/private-persons/${id}`);
    return response.data;
  },
  update: async (id: string, data: UpdatePrivatePersonDto) => {
    const response = await apiClient.patch(`/private-persons/${id}`, data);
    return response.data;
  },
  remove: async (id: string) => {
    const response = await apiClient.delete(`/private-persons/${id}`);
    return response.data;
  },
};

// API функции для собак
export const dogsApi = {
  create: async (data: CreateDogDto) => {
    const response = await apiClient.post('/dogs', data);
    return response.data;
  },
  findAll: async () => {
    const response = await apiClient.get('/dogs');
    return response.data;
  },
  findOne: async (id: string) => {
    const response = await apiClient.get(`/dogs/${id}`);
    return response.data;
  },
  update: async (id: string, data: UpdateDogDto) => {
    const response = await apiClient.patch(`/dogs/${id}`, data);
    return response.data;
  },
  remove: async (id: string) => {
    const response = await apiClient.delete(`/dogs/${id}`);
    return response.data;
  },
};

// API функции для сторис
export const dogStoriesApi = {
  create: async (data: CreateDogStoryDto) => {
    const response = await apiClient.post('/dog-stories', data);
    return response.data;
  },
  findAll: async () => {
    const response = await apiClient.get('/dog-stories');
    return response.data;
  },
  findByDogId: async (dogId: string) => {
    const response = await apiClient.get(`/dog-stories/dog/${dogId}`);
    return response.data;
  },
  findOne: async (id: string) => {
    const response = await apiClient.get(`/dog-stories/${id}`);
    return response.data;
  },
  update: async (id: string, data: UpdateDogStoryDto) => {
    const response = await apiClient.patch(`/dog-stories/${id}`, data);
    return response.data;
  },
  remove: async (id: string) => {
    const response = await apiClient.delete(`/dog-stories/${id}`);
    return response.data;
  },
};

// API функции для фотографий
export const dogPhotosApi = {
  create: async (data: CreateDogPhotoDto) => {
    const response = await apiClient.post('/dog-photos', data);
    return response.data;
  },
  findAll: async () => {
    const response = await apiClient.get('/dog-photos');
    return response.data;
  },
  findByDogId: async (dogId: string) => {
    const response = await apiClient.get(`/dog-photos/dog/${dogId}`);
    return response.data;
  },
  findOne: async (id: string) => {
    const response = await apiClient.get(`/dog-photos/${id}`);
    return response.data;
  },
  update: async (id: string, data: UpdateDogPhotoDto) => {
    const response = await apiClient.patch(`/dog-photos/${id}`, data);
    return response.data;
  },
  remove: async (id: string) => {
    const response = await apiClient.delete(`/dog-photos/${id}`);
    return response.data;
  },
  getLikesCount: async (id: string) => {
    const response = await apiClient.get(`/dog-photos/${id}/likes-count`);
    return response.data;
  },
  getCommentsCount: async (id: string) => {
    const response = await apiClient.get(`/dog-photos/${id}/comments-count`);
    return response.data;
  },
};

// API функции для истории
export const dogHistoryApi = {
  create: async (data: CreateDogHistoryDto) => {
    const response = await apiClient.post('/dog-history', data);
    return response.data;
  },
  findAll: async () => {
    const response = await apiClient.get('/dog-history');
    return response.data;
  },
  findByDogId: async (dogId: string) => {
    const response = await apiClient.get(`/dog-history/dog/${dogId}`);
    return response.data;
  },
  findOne: async (id: string) => {
    const response = await apiClient.get(`/dog-history/${id}`);
    return response.data;
  },
  update: async (id: string, data: UpdateDogHistoryDto) => {
    const response = await apiClient.patch(`/dog-history/${id}`, data);
    return response.data;
  },
  remove: async (id: string) => {
    const response = await apiClient.delete(`/dog-history/${id}`);
    return response.data;
  },
};

// Типы для донатов
export interface CreateDonationDto {
  dogId: string;
  amount: number; // minimum 0.01
  donorName?: string;
  donorEmail?: string;
  message?: string;
  isAnonymous?: boolean;
}

// Типы для целей
export interface CreateGoalDto {
  dogId: string;
  title: string;
  description?: string;
  targetAmount: number; // minimum 0.01
  deadline?: string; // ISO date-time string
}

export interface UpdateGoalDto {
  title?: string;
  description?: string;
  targetAmount?: number;
  currentAmount?: number;
  status?: 'active' | 'completed' | 'cancelled';
  deadline?: string;
}

// Типы для подписок
export interface CreateSubscriptionDto {
  dogId: string;
  title: string;
  description?: string;
  amount: number; // minimum 0.01
  isExclusive?: boolean;
  maxSubscribers?: number; // minimum 1
}

export interface UpdateSubscriptionDto {
  title?: string;
  description?: string;
  amount?: number;
  isExclusive?: boolean;
  maxSubscribers?: number;
  currentSubscribers?: number;
  status?: 'active' | 'completed' | 'cancelled';
}

// API функции для донатов
export const donationsApi = {
  create: async (data: CreateDonationDto) => {
    const response = await apiClient.post('/donations', data);
    return response.data;
  },
  getTotalAmount: async () => {
    try {
      const response = await apiClient.get('/donations/total');
      return response.data;
    } catch (error) {
      return { total: 0 };
    }
  },
  findAll: async () => {
    const response = await apiClient.get('/donations');
    return response.data;
  },
  findByDogId: async (dogId: string) => {
    const response = await apiClient.get(`/donations/dog/${dogId}`);
    return response.data;
  },
  getTotalAmountByDogId: async (dogId: string) => {
    try {
      const response = await apiClient.get(`/donations/dog/${dogId}/total`);
      return response.data;
    } catch (error) {
      return { total: 0 };
    }
  },
};

// API функции для целей
export const goalsApi = {
  create: async (data: CreateGoalDto) => {
    const response = await apiClient.post('/goals', data);
    return response.data;
  },
  findAll: async () => {
    const response = await apiClient.get('/goals');
    return response.data;
  },
  findByDogId: async (dogId: string) => {
    const response = await apiClient.get(`/goals/dog/${dogId}`);
    return response.data;
  },
  findOne: async (id: string) => {
    const response = await apiClient.get(`/goals/${id}`);
    return response.data;
  },
  update: async (id: string, data: UpdateGoalDto) => {
    const response = await apiClient.patch(`/goals/${id}`, data);
    return response.data;
  },
  remove: async (id: string) => {
    const response = await apiClient.delete(`/goals/${id}`);
    return response.data;
  },
};

// Типы для лайков фотографий
export interface CreatePhotoLikeDto {
  photoId: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
}

// Типы для комментариев к фотографиям
export interface CreatePhotoCommentDto {
  photoId: string;
  content: string; // minLength: 1
  userId?: string;
  userName?: string;
  userEmail?: string;
  parentId?: string; // для ответов
}

export interface UpdatePhotoCommentDto {
  content: string; // minLength: 1
}

// API функции для подписок
export const subscriptionsApi = {
  create: async (data: CreateSubscriptionDto) => {
    const response = await apiClient.post('/subscriptions', data);
    return response.data;
  },
  findAll: async () => {
    const response = await apiClient.get('/subscriptions');
    return response.data;
  },
  findByDogId: async (dogId: string) => {
    const response = await apiClient.get(`/subscriptions/dog/${dogId}`);
    return response.data;
  },
  findOne: async (id: string) => {
    const response = await apiClient.get(`/subscriptions/${id}`);
    return response.data;
  },
  update: async (id: string, data: UpdateSubscriptionDto) => {
    const response = await apiClient.patch(`/subscriptions/${id}`, data);
    return response.data;
  },
  remove: async (id: string) => {
    const response = await apiClient.delete(`/subscriptions/${id}`);
    return response.data;
  },
};

// API функции для лайков фотографий
export const photoLikesApi = {
  create: async (data: CreatePhotoLikeDto) => {
    const response = await apiClient.post('/photo-likes', data);
    return response.data;
  },
  findByPhotoId: async (photoId: string) => {
    const response = await apiClient.get(`/photo-likes/photo/${photoId}`);
    return response.data;
  },
  remove: async (photoId: string, userId: string) => {
    const response = await apiClient.delete(`/photo-likes/photo/${photoId}`, {
      params: { userId },
    });
    return response.data;
  },
  getLikesCount: async (photoId: string) => {
    const response = await apiClient.get(`/photo-likes/photo/${photoId}/count`);
    return response.data;
  },
  checkIfLiked: async (photoId: string, userId: string) => {
    const response = await apiClient.get(`/photo-likes/photo/${photoId}/check`, {
      params: { userId },
    });
    return response.data;
  },
};

// API функции для комментариев к фотографиям
export const photoCommentsApi = {
  create: async (data: CreatePhotoCommentDto) => {
    const response = await apiClient.post('/photo-comments', data);
    return response.data;
  },
  findAll: async () => {
    const response = await apiClient.get('/photo-comments');
    return response.data;
  },
  findByPhotoId: async (photoId: string, includeReplies: boolean = true) => {
    const response = await apiClient.get(`/photo-comments/photo/${photoId}`, {
      params: { includeReplies: String(includeReplies) },
    });
    return response.data;
  },
  findByParentId: async (parentId: string) => {
    const response = await apiClient.get(`/photo-comments/parent/${parentId}`);
    return response.data;
  },
  getCommentsCount: async (photoId: string) => {
    const response = await apiClient.get(`/photo-comments/photo/${photoId}/count`);
    return response.data;
  },
  findOne: async (id: string) => {
    const response = await apiClient.get(`/photo-comments/${id}`);
    return response.data;
  },
  update: async (id: string, data: UpdatePhotoCommentDto) => {
    const response = await apiClient.patch(`/photo-comments/${id}`, data);
    return response.data;
  },
  remove: async (id: string) => {
    const response = await apiClient.delete(`/photo-comments/${id}`);
    return response.data;
  },
};

// Типы для пород собак
export interface DogBreedResponseDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  language: 'ru' | 'en';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// API функции для пород собак
export const dogBreedsApi = {
  findAll: async (lang?: 'ru' | 'en') => {
    const response = await apiClient.get<DogBreedResponseDto[]>('/dog-breeds', {
      params: lang ? { lang } : undefined,
    });
    return response.data;
  },
  findOne: async (id: string, lang?: 'ru' | 'en') => {
    const response = await apiClient.get<DogBreedResponseDto>(`/dog-breeds/${id}`, {
      params: lang ? { lang } : undefined,
    });
    return response.data;
  },
  findByCode: async (code: string, lang?: 'ru' | 'en') => {
    const response = await apiClient.get<DogBreedResponseDto>(`/dog-breeds/code/${code}`, {
      params: lang ? { lang } : undefined,
    });
    return response.data;
  },
};

