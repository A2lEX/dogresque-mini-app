'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';
import { dogsApi } from '@/lib/api';
import { useTranslation } from '@/hooks/useTranslation';

interface Dog {
  id: string;
  name: string;
  breed?: string;
  age?: number;
  description?: string;
  imageUrl?: string;
}

export default function DogsPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [filteredDogs, setFilteredDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDogs();
  }, []);

  useEffect(() => {
    const query = searchParams.get('search') || '';
    setSearchQuery(query);
  }, [searchParams]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = dogs.filter(dog =>
        dog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dog.breed?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dog.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDogs(filtered);
    } else {
      setFilteredDogs(dogs);
    }
  }, [searchQuery, dogs]);

  const loadDogs = async () => {
    try {
      setLoading(true);
      const data = await dogsApi.findAll();
      const dogsArray = Array.isArray(data) ? data : [];
      setDogs(dogsArray);
      setFilteredDogs(dogsArray);
    } catch (error) {
      console.error('Ошибка загрузки собак:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    router.push(`/dogs?${params.toString()}`, { scroll: false });
  };

  const getAgeText = (age: number) => {
    if (age === 1) return t('common.year') || 'год';
    if (age < 5) return t('common.years2') || 'года';
    return t('common.years') || 'лет';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {t('nav.dogs')}
              </h1>
              <p className="text-gray-600">
                {filteredDogs.length > 0 
                  ? `${filteredDogs.length} ${filteredDogs.length === 1 ? 'собака' : filteredDogs.length < 5 ? 'собаки' : 'собак'}`
                  : t('dogs.noDogs')}
              </p>
            </div>
            <Link
              href="/dogs/add"
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {t('footer.addDog') || '+ Добавить собаку'}
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={t('nav.search')}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-primary-200 transition-all text-lg bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
        ) : (
          <>
            {/* Empty State */}
            {filteredDogs.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
                <div className="text-8xl mb-4">🐕</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {searchQuery ? t('dogs.noResults') : t('dogs.noDogs')}
                </h2>
                <p className="text-gray-600 mb-6">
                  {searchQuery 
                    ? t('dogs.tryDifferentSearch')
                    : t('dogs.addFirstDog')}
                </p>
                {!searchQuery && (
                  <Link
                    href="/dogs/add"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {t('footer.addDog') || '+ Добавить собаку'}
                  </Link>
                )}
              </div>
            ) : (
              /* Dogs Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDogs.map((dog, index) => (
                  <Link
                    key={dog.id}
                    href={`/dogs/${dog.id}`}
                    className="group"
                  >
                    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                      {/* Image */}
                      <div className="relative h-64 bg-gradient-to-br from-primary-100 to-purple-100 overflow-hidden">
                        {dog.imageUrl ? (
                          <img
                            src={dog.imageUrl}
                            alt={dog.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              if (target.nextElementSibling) {
                                (target.nextElementSibling as HTMLElement).style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div className={`absolute inset-0 flex items-center justify-center text-8xl ${dog.imageUrl ? 'hidden' : ''}`}>
                          🐕
                        </div>
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {/* Info */}
                      <div className="p-5">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                          {dog.name}
                        </h3>
                        <div className="space-y-1">
                          {dog.breed && (
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <span className="text-primary-500">🐾</span>
                              {dog.breed}
                            </p>
                          )}
                          {dog.age !== undefined && (
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <span className="text-primary-500">🎂</span>
                              {dog.age} {getAgeText(dog.age)}
                            </p>
                          )}
                        </div>
                        {dog.description && (
                          <p className="mt-3 text-sm text-gray-500 line-clamp-2">
                            {dog.description}
                          </p>
                        )}
                        {/* View Button */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <span className="text-primary-600 font-semibold text-sm group-hover:text-primary-700">
                            {t('common.viewMore')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

