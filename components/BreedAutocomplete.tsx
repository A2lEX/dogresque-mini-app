'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { dogBreedsApi, type DogBreedResponseDto } from '@/lib/api';
import { useTranslation } from '@/hooks/useTranslation';

interface BreedAutocompleteProps {
  value: string;
  breedId?: string;
  onChange: (breed: string, breedId?: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export default function BreedAutocomplete({
  value,
  breedId,
  onChange,
  placeholder,
  className = '',
  required = false,
}: BreedAutocompleteProps) {
  const { locale } = useTranslation();
  const [breeds, setBreeds] = useState<DogBreedResponseDto[]>([]);
  const [filteredBreeds, setFilteredBreeds] = useState<DogBreedResponseDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBreed, setSelectedBreed] = useState<DogBreedResponseDto | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Загружаем все породы при монтировании
  const loadBreeds = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dogBreedsApi.findAll(locale);
      console.log('API response:', data);
      if (Array.isArray(data)) {
        console.log('Total breeds from API:', data.length);
        const activeBreeds = data.filter((breed) => breed.isActive);
        console.log('Active breeds:', activeBreeds.length);
        
        // Если активных пород нет, но есть неактивные - используем все породы
        const breedsToUse = activeBreeds.length > 0 ? activeBreeds : data;
        setBreeds(breedsToUse);
        
        console.log('Final breeds count:', breedsToUse.length);
        if (breedsToUse.length === 0) {
          if (data.length === 0) {
            setError('Породы не найдены в базе данных');
          } else {
            setError('Все породы неактивны. Обратитесь к администратору.');
          }
        }
      } else {
        console.error('Invalid API response format:', data);
        setBreeds([]);
        setError('Неверный формат ответа от сервера');
      }
    } catch (error: any) {
      console.error('Error loading breeds:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });
      setBreeds([]);
      
      if (error.response?.status === 404) {
        setError('Эндпоинт не найден. Проверьте, что бэкенд запущен.');
      } else if (error.response?.status === 500) {
        setError('Ошибка сервера. Попробуйте позже.');
      } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        setError('Не удалось подключиться к серверу. Проверьте, что бэкенд запущен на http://localhost:3001');
      } else {
        setError(`Ошибка загрузки: ${error.message || 'Неизвестная ошибка'}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    loadBreeds();
  }, [loadBreeds]);

  // Находим выбранную породу по breedId
  useEffect(() => {
    if (breedId && breeds.length > 0) {
      const breed = breeds.find((b) => b.id === breedId);
      if (breed) {
        setSelectedBreed(breed);
        setSearchTerm('');
      }
    } else if (!breedId) {
      setSelectedBreed(null);
    }
  }, [breedId, breeds]);

  // Фильтруем породы при изменении поискового запроса
  useEffect(() => {
    if (breeds.length === 0) {
      setFilteredBreeds([]);
      return;
    }

    if (!searchTerm.trim()) {
      setFilteredBreeds(breeds.slice(0, 20)); // Показываем первые 20 пород если нет поиска
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = breeds.filter(
      (breed) => breed.name.toLowerCase().includes(term)
    );
    setFilteredBreeds(filtered.slice(0, 10)); // Показываем максимум 10 результатов
  }, [searchTerm, breeds]);

  // Закрываем меню при клике вне компонента
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Если порода не выбрана, очищаем поиск
        if (!selectedBreed) {
          setSearchTerm('');
        }
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside, true);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [isOpen, selectedBreed]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    // Если порода уже выбрана, очищаем её для нового поиска
    if (selectedBreed) {
      setSelectedBreed(null);
      setSearchTerm('');
      onChange('', undefined);
    }
  };

  const handleSelectBreed = useCallback(
    (breed: DogBreedResponseDto) => {
      setSelectedBreed(breed);
      setSearchTerm('');
      onChange(breed.name, breed.id);
      setIsOpen(false);
      inputRef.current?.blur();
    },
    [onChange]
  );

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBreed(null);
    setSearchTerm('');
    onChange('', undefined);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      if (!selectedBreed) {
        setSearchTerm('');
      }
      inputRef.current?.blur();
    } else if (e.key === 'Enter' && filteredBreeds.length === 1) {
      e.preventDefault();
      handleSelectBreed(filteredBreeds[0]);
    }
  };

  const displayValue = selectedBreed ? selectedBreed.name : searchTerm;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={`${className} ${selectedBreed ? 'pr-10' : ''} ${!breedId && required ? 'border-red-300' : ''}`}
          autoComplete="off"
        />
        {selectedBreed && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Очистить выбор"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {!selectedBreed && !isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>
      {isOpen && filteredBreeds.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-60 overflow-auto">
          {filteredBreeds.map((breed) => (
            <button
              key={breed.id}
              type="button"
              onClick={() => handleSelectBreed(breed)}
              className={`w-full text-left px-4 py-3 hover:bg-primary-50 hover:text-primary-700 transition-colors border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-primary-50 ${
                selectedBreed?.id === breed.id ? 'bg-primary-100' : ''
              }`}
            >
              <div className="font-medium">{breed.name}</div>
              {breed.description && (
                <div className="text-sm text-gray-500 mt-1 line-clamp-1">{breed.description}</div>
              )}
            </button>
          ))}
        </div>
      )}
      {isOpen && filteredBreeds.length === 0 && searchTerm.trim() && !isLoading && breeds.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-xl p-4 text-center text-gray-500">
          Порода не найдена
        </div>
      )}
      {isOpen && breeds.length === 0 && !isLoading && error && !searchTerm.trim() && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-red-200 rounded-xl shadow-xl p-4">
          <div className="text-center text-red-600 mb-3">{error}</div>
          <button
            type="button"
            onClick={loadBreeds}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            Попробовать снова
          </button>
        </div>
      )}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
    </div>
  );
}

