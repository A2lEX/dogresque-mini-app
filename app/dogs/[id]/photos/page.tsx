'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { dogsApi, dogPhotosApi } from '@/lib/api';
import { useTranslation } from '@/hooks/useTranslation';

interface Dog {
  id: string;
  name: string;
  breed?: string;
  imageUrl?: string;
}

interface Photo {
  id: string;
  dogId: string;
  imageUrl: string;
  caption?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function DogPhotosPage() {
  const { t } = useTranslation();
  const params = useParams();
  const id = params?.id as string;

  const [dog, setDog] = useState<Dog | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    if (id) {
      loadDog();
      loadPhotos();
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

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const data = await dogPhotosApi.findByDogId(id);
      setPhotos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading photos:', error);
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
              {error || t('photos.notFound')}
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href={`/dogs/${id}`}
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('photos.back')}
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
          <h2 className="text-2xl font-bold text-gray-900">{t('photos.title')}</h2>
          <p className="text-gray-600 mt-2">
            {t('photos.gallery').replace('{name}', dog.name)}
          </p>
        </div>

        {/* Add Photo Button */}
        <div className="mb-6">
          <Link
            href={`/dogs/photos/add?dogId=${id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('photos.addPhoto')}
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
            {photos.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
                <div className="text-8xl mb-4">📸</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('photos.noPhotos')}</h3>
                <p className="text-gray-600 mb-6">
                  {t('photos.beFirst').replace('{name}', dog.name)}
                </p>
                <Link
                  href={`/dogs/photos/add?dogId=${id}`}
                  className="inline-block px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  {t('photos.addFirst')}
                </Link>
              </div>
            ) : (
              /* Photos Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-2"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    {/* Image */}
                    <div className="relative h-64 bg-gradient-to-br from-primary-100 to-purple-100 overflow-hidden">
                      <img
                        src={photo.imageUrl}
                        alt={photo.caption || 'Фотография'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          if (target.nextElementSibling) {
                            (target.nextElementSibling as HTMLElement).style.display = 'flex';
                          }
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>

                    {/* Info */}
                    {(photo.caption || photo.location) && (
                      <div className="p-4">
                        {photo.caption && (
                          <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                            {photo.caption}
                          </p>
                        )}
                        {photo.location && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {photo.location}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Photo Modal */}
        {selectedPhoto && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <div
              className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-colors shadow-lg"
              >
                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Image */}
              <div className="relative bg-black">
                <img
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.caption || 'Фотография'}
                  className="w-full h-auto max-h-[70vh] object-contain mx-auto"
                />
              </div>

              {/* Info */}
              <div className="p-6">
                {selectedPhoto.caption && (
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedPhoto.caption}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {selectedPhoto.location && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {selectedPhoto.location}
                    </span>
                  )}
                  {selectedPhoto.createdAt && (
                    <span>{formatDate(selectedPhoto.createdAt)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

