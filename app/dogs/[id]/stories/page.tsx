'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { dogsApi, dogStoriesApi } from '@/lib/api';
import { useTranslation } from '@/hooks/useTranslation';

interface Dog {
  id: string;
  name: string;
  breed?: string;
  imageUrl?: string;
}

interface Story {
  id: string;
  dogId: string;
  title?: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function DogStoriesPage() {
  const { t } = useTranslation();
  const params = useParams();
  const id = params?.id as string;

  const [dog, setDog] = useState<Dog | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadDog();
      loadStories();
    }
  }, [id]);

  const loadDog = async () => {
    try {
      const data = await dogsApi.findOne(id);
      setDog(data);
    } catch (error: any) {
      console.error('Error loading dog:', error);
      if (error.response?.status === 404) {
        setError('Собака не найдена');
      }
    }
  };

  const loadStories = async () => {
    try {
      setLoading(true);
      const data = await dogStoriesApi.findByDogId(id);
      setStories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (error || !dog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
            <div className="text-8xl mb-4">😢</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error || t('stories.notFound')}
            </h2>
            <Link
              href="/dogs"
              className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href={`/dogs/${id}`}
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('stories.back')}
        </Link>

        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            {dog.imageUrl && (
              <img
                src={dog.imageUrl}
                alt={dog.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{dog.name}</h1>
              {dog.breed && <p className="text-lg text-primary-600">🐾 {dog.breed}</p>}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{t('stories.title')}</h2>
          <p className="text-gray-600 mt-2">
            {t('stories.followLife').replace('{name}', dog.name)}
          </p>
        </div>

        {/* Add Story Button */}
        <div className="mb-6">
          <Link
            href={`/dogs/stories/add?dogId=${id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('stories.addStory')}
          </Link>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
        ) : (
          <>
            {/* Empty State */}
            {stories.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
                <div className="text-8xl mb-4">📖</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('stories.noStories')}</h3>
                <p className="text-gray-600 mb-6">
                  {t('stories.beFirst').replace('{name}', dog.name)}
                </p>
                <Link
                  href={`/dogs/stories/add?dogId=${id}`}
                  className="inline-block px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  {t('stories.addFirst')}
                </Link>
              </div>
            ) : (
              /* Stories List */
              <div className="space-y-6">
                {stories.map((story) => (
                  <article
                    key={story.id}
                    className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                  >
                    {/* Image/Video */}
                    {story.imageUrl && (
                      <div className="relative h-64 bg-gradient-to-br from-primary-100 to-purple-100 overflow-hidden">
                        <img
                          src={story.imageUrl}
                          alt={story.title || 'История'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    {story.videoUrl && (
                      <div className="relative h-64 bg-black">
                        <video
                          src={story.videoUrl}
                          controls
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-8">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          {story.title && (
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                              {story.title}
                            </h3>
                          )}
                          {story.createdAt && (
                            <p className="text-sm text-gray-500">
                              {formatDate(story.createdAt)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Content Text */}
                      <div className="prose max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {story.content}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

