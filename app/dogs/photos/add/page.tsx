'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { dogPhotosApi, dogsApi } from '@/lib/api';
import { useTranslation } from '@/hooks/useTranslation';

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('File read error'));
    reader.readAsDataURL(file);
  });
};

export default function AddPhotoPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dogIdFromUrl = searchParams.get('dogId');

  const [formData, setFormData] = useState({
    dogId: dogIdFromUrl || '',
    imageUrl: '',
    caption: '',
    location: '',
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [dog, setDog] = useState<any>(null);
  const [dogs, setDogs] = useState<any[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (dogIdFromUrl) {
          const dogData = await dogsApi.findOne(dogIdFromUrl);
          setDog(dogData);
        } else {
          const dogsData = await dogsApi.findAll();
          setDogs(Array.isArray(dogsData) ? dogsData : []);
        }
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, [dogIdFromUrl]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: t('addPhoto.errors.invalidFile') });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: t('addPhoto.errors.fileTooLarge') });
      return;
    }

    try {
      const dataUrl = await convertFileToBase64(file);
      setFormData((prev) => ({ ...prev, imageUrl: dataUrl }));
      setImagePreview(dataUrl);
      setMessage(null);
    } catch (error) {
      setMessage({ type: 'error', text: t('addPhoto.errors.uploadError') });
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData((prev) => ({ ...prev, imageUrl: url }));
    setImagePreview(url);
    setMessage(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.dogId) {
      setMessage({ type: 'error', text: t('addPhoto.errors.dogRequired') });
      return;
    }

    if (!formData.imageUrl.trim()) {
      setMessage({ type: 'error', text: t('addPhoto.errors.imageRequired') });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const submitData = {
        dogId: formData.dogId,
        imageUrl: formData.imageUrl.trim(),
        caption: formData.caption.trim() || undefined,
        location: formData.location.trim() || undefined,
      };

      await dogPhotosApi.create(submitData);
      setMessage({ type: 'success', text: t('addPhoto.success') });

      // Очищаем форму после успешного добавления
      setTimeout(() => {
        setFormData({
          dogId: dogIdFromUrl || '',
          imageUrl: '',
          caption: '',
          location: '',
        });
        setImagePreview('');
        if (dogIdFromUrl) {
          router.push(`/dogs/${dogIdFromUrl}/photos`);
        } else {
          router.push('/dogs');
        }
      }, 2000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || t('addPhoto.errors.general'),
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50">
        <Header />
        <main className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href={dogIdFromUrl ? `/dogs/${dogIdFromUrl}/photos` : '/dogs'}
          className="inline-block mb-6 text-primary-600 hover:text-primary-700 font-medium"
        >
          {t('common.back')}
        </Link>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 px-8 py-10 text-center">
            <div className="text-6xl mb-4">📸</div>
            <h1 className="text-3xl font-bold text-white mb-2">{t('addPhoto.title')}</h1>
            <p className="text-primary-100">{t('addPhoto.subtitle')}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Message */}
            {message && (
              <div
                className={`rounded-xl p-4 border text-sm ${
                  message.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Dog Selection */}
            {!dogIdFromUrl && (
              <div>
                <label htmlFor="dogId" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('addPhoto.selectDog')} *
                </label>
                <select
                  id="dogId"
                  name="dogId"
                  required
                  value={formData.dogId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-primary-200 transition-all"
                >
                  <option value="">{t('addPhoto.selectDogPlaceholder')}</option>
                  {dogs.map((dog) => (
                    <option key={dog.id} value={dog.id}>
                      {dog.name} {dog.breed ? `(${dog.breed})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Dog Info */}
            {dog && (
              <div className="flex items-center gap-4 p-4 bg-primary-50 rounded-xl">
                {dog.imageUrl && (
                  <img
                    src={dog.imageUrl}
                    alt={dog.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold text-gray-900">{dog.name}</p>
                  {dog.breed && <p className="text-sm text-gray-600">{dog.breed}</p>}
                </div>
              </div>
            )}

            {/* Image Upload Section */}
            <div className="flex flex-col items-center text-center bg-gradient-to-br from-primary-50 to-purple-50 rounded-2xl p-8 border-2 border-dashed border-primary-200">
              <div className="w-64 h-64 rounded-2xl bg-white flex items-center justify-center overflow-hidden mb-4 border-4 border-white shadow-lg">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Photo preview"
                    className="w-full h-full object-cover"
                    onError={() => setImagePreview('')}
                  />
                ) : (
                  <span className="text-8xl opacity-30">📸</span>
                )}
              </div>
              <div className="w-full space-y-3">
                <label className="cursor-pointer w-full px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-center font-semibold">
                  {t('addPhoto.uploadImage')}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gradient-to-br from-primary-50 to-purple-50 text-gray-500">{t('addDog.or')}</span>
                  </div>
                </div>
                <label className="block text-sm font-semibold text-gray-700 text-left">
                  {t('addPhoto.imageUrl')}
                </label>
                <input
                  type="url"
                  value={formData.imageUrl && !formData.imageUrl.startsWith('data:') ? formData.imageUrl : ''}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  placeholder={t('addPhoto.imageUrlPlaceholder')}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-primary-200 transition-all text-sm"
                />
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setFormData((prev) => ({ ...prev, imageUrl: '' }));
                    }}
                    className="w-full px-4 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    {t('addPhoto.deleteImage')}
                  </button>
                )}
              </div>
              <p className="mt-4 text-xs text-gray-500">{t('addPhoto.uploadHint')}</p>
            </div>

            {/* Caption */}
            <div>
              <label htmlFor="caption" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('addPhoto.caption')}
              </label>
              <textarea
                id="caption"
                name="caption"
                value={formData.caption}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-primary-200 transition-all resize-none"
                placeholder={t('addPhoto.captionPlaceholder')}
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('addPhoto.location')}
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-primary-200 transition-all"
                placeholder={t('addPhoto.locationPlaceholder')}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-primary-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('addPhoto.submitting')}
                </span>
              ) : (
                t('addPhoto.submit')
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

