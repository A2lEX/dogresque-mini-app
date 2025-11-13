'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { dogsApi, donationsApi } from '@/lib/api';
import { useTranslation } from '@/hooks/useTranslation';

interface Dog {
  id: string;
  name: string;
  breed?: string;
  age?: number;
  description?: string;
  imageUrl?: string;
  status?: string;
  shelterId?: string;
  privatePersonId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function DogDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [dog, setDog] = useState<Dog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [donationAmount, setDonationAmount] = useState(0);

  useEffect(() => {
    if (id) {
      loadDog();
      loadDonationAmount();
    }
  }, [id]);

  const loadDog = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dogsApi.findOne(id);
      setDog(data);
    } catch (error: any) {
      console.error('Error loading dog:', error);
      if (error.response?.status === 404) {
        setError('Собака не найдена');
      } else {
        setError('Ошибка загрузки данных');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadDonationAmount = async () => {
    try {
      const data = await donationsApi.getTotalAmountByDogId(id);
      setDonationAmount(data?.total || 0);
    } catch (error) {
      console.error('Error loading donation amount:', error);
    }
  };

  const getAgeText = (age: number) => {
    if (age === 1) return t('common.year') || 'год';
    if (age < 5) return t('common.years2') || 'года';
    return t('common.years') || 'лет';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50">
        <Header />
        <main className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </main>
      </div>
    );
  }

  if (error || !dog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
            <div className="text-8xl mb-4">😢</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error || t('dogDetail.notFound')}
            </h2>
            <p className="text-gray-600 mb-6">
              {error || t('dogDetail.notFoundDescription')}
            </p>
            <Link
              href="/dogs"
              className="inline-block px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              {t('common.back')}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/dogs"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('dogDetail.back')}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Section */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="relative h-96 bg-gradient-to-br from-primary-100 to-purple-100">
                {dog.imageUrl ? (
                  <img
                    src={dog.imageUrl}
                    alt={dog.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      if (target.nextElementSibling) {
                        (target.nextElementSibling as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div className={`absolute inset-0 flex items-center justify-center text-9xl ${dog.imageUrl ? 'hidden' : ''}`}>
                  🐕
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{dog.name}</h1>
                  {dog.breed && (
                    <p className="text-xl text-primary-600 font-semibold mb-4">🐾 {dog.breed}</p>
                  )}
                </div>
                {dog.status && (
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    dog.status === 'active' ? 'bg-green-100 text-green-700' :
                    dog.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {dog.status === 'active' ? t('dogDetail.status.active') : dog.status === 'completed' ? t('dogDetail.status.completed') : t('dogDetail.status.archived')}
                  </span>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {dog.age !== undefined && (
                    <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-xl">
                      <div className="text-3xl">🎂</div>
                      <div>
                        <p className="text-sm text-gray-600">{t('dogDetail.age')}</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {dog.age} {getAgeText(dog.age)}
                        </p>
                      </div>
                    </div>
                  )}
                  {donationAmount > 0 && (
                    <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                      <div className="text-3xl">💰</div>
                      <div>
                        <p className="text-sm text-gray-600">{t('dogDetail.donated')}</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {donationAmount.toLocaleString('ru-RU')} ₽
                        </p>
                      </div>
                    </div>
                  )}
              </div>

              {/* Description */}
              {dog.description && (
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('dogDetail.about')}</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {dog.description}
                  </p>
                </div>
              )}

              {/* Dates */}
              {(dog.createdAt || dog.updatedAt) && (
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    {dog.createdAt && (
                      <span>Добавлена: {formatDate(dog.createdAt)}</span>
                    )}
                    {dog.updatedAt && dog.updatedAt !== dog.createdAt && (
                      <span>Обновлена: {formatDate(dog.updatedAt)}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Donate Card */}
            <div className="bg-gradient-to-br from-primary-600 to-purple-600 rounded-3xl shadow-xl p-6 text-white">
              <h3 className="text-2xl font-bold mb-4">{t('dogDetail.helpDog')}</h3>
              <p className="mb-6 text-primary-100">
                {t('dogDetail.helpDescription').replace('{name}', dog.name)}
              </p>
              <Link
                href={`/donations?dogId=${dog.id}`}
                className="block w-full text-center px-6 py-3 bg-white text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {t('nav.donations')}
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{t('dogDetail.actions')}</h3>
              <div className="space-y-3">
                <Link
                  href={`/goals?dogId=${dog.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary-50 transition-colors group"
                >
                  <span className="text-2xl">🎯</span>
                  <span className="font-medium text-gray-700 group-hover:text-primary-600">
                    {t('nav.goals') || 'Цели'}
                  </span>
                </Link>
                <Link
                  href={`/dogs/${dog.id}/photos`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary-50 transition-colors group"
                >
                  <span className="text-2xl">📸</span>
                  <span className="font-medium text-gray-700 group-hover:text-primary-600">
                    Фотографии
                  </span>
                </Link>
                <Link
                  href={`/dogs/${dog.id}/stories`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary-50 transition-colors group"
                >
                  <span className="text-2xl">📖</span>
                  <span className="font-medium text-gray-700 group-hover:text-primary-600">
                    Истории
                  </span>
                </Link>
                <Link
                  href={`/dogs/${dog.id}/history`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary-50 transition-colors group"
                >
                  <span className="text-2xl">📅</span>
                  <span className="font-medium text-gray-700 group-hover:text-primary-600">
                    История
                  </span>
                </Link>
              </div>
            </div>

            {/* Share Card */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{t('dogDetail.shareTitle')}</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: dog.name,
                        text: dog.description || `Познакомьтесь с ${dog.name}!`,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Ссылка скопирована!');
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-primary-50 text-primary-600 rounded-xl font-medium hover:bg-primary-100 transition-colors"
                >
                  📤 {t('dogDetail.share')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

