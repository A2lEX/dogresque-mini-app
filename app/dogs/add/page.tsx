'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import BreedAutocomplete from '@/components/BreedAutocomplete';
import { dogsApi, authApi } from '@/lib/api';
import { getUser } from '@/lib/auth';
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

export default function AddDogPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    breedId: '',
    age: '',
    description: '',
    imageUrl: '',
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userRole, setUserRole] = useState<'shelter' | 'private_person' | null>(null);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = getUser();
        if (!storedUser) {
          router.push('/login');
          return;
        }

        const me = await authApi.getMe();
        const role = me?.role || storedUser.role;
        const id = me?.id || storedUser.id;

        if (role === 'shelter' || role === 'private_person') {
          setUserRole(role);
          setUserId(id);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        router.push('/login');
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, [router]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: t('addDog.errors.general') });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: t('addDog.errors.general') });
      return;
    }

    try {
      const dataUrl = await convertFileToBase64(file);
      setFormData((prev) => ({ ...prev, imageUrl: dataUrl }));
      setImagePreview(dataUrl);
      setMessage(null);
    } catch (error) {
      setMessage({ type: 'error', text: t('addDog.errors.general') });
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData((prev) => ({ ...prev, imageUrl: url }));
    setImagePreview(url);
    setMessage(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: t('addDog.errors.nameRequired') });
      return false;
    }

    if (!formData.breedId) {
      setMessage({ type: 'error', text: t('addDog.errors.breedRequired') || 'Пожалуйста, выберите породу из списка' });
      return false;
    }

    if (formData.age && (Number(formData.age) < 0 || Number(formData.age) > 30)) {
      setMessage({ type: 'error', text: t('addDog.errors.ageInvalid') });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const submitData: any = {
        name: formData.name.trim(),
      };

      // Обязательно используем breedId если он есть, иначе не отправляем породу
      if (formData.breedId) {
        submitData.breedId = formData.breedId;
      }
      // Не отправляем произвольный текст breed, только если выбран breedId
      if (formData.age) submitData.age = Number(formData.age);
      if (formData.description.trim()) submitData.description = formData.description.trim();
      if (formData.imageUrl.trim()) submitData.imageUrl = formData.imageUrl.trim();

      // Автоматически добавляем ID пользователя в зависимости от роли
      if (userRole === 'shelter') {
        submitData.shelterId = userId;
      } else if (userRole === 'private_person') {
        submitData.privatePersonId = userId;
      }

      await dogsApi.create(submitData);
      setMessage({ type: 'success', text: t('addDog.success') });

      // Очищаем форму после успешного добавления
      setTimeout(() => {
        setFormData({
          name: '',
          breed: '',
          breedId: '',
          age: '',
          description: '',
          imageUrl: '',
        });
        setImagePreview('');
        router.push('/');
      }, 2000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || t('addDog.errors.general'),
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
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
        <Link href="/" className="inline-block mb-6 text-primary-600 hover:text-primary-700 font-medium">
          {t('common.back')}
        </Link>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 px-8 py-10 text-center">
            <div className="text-6xl mb-4">🐕</div>
            <h1 className="text-3xl font-bold text-white mb-2">{t('addDog.title')}</h1>
            <p className="text-primary-100">{t('addDog.subtitle')}</p>
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

            {/* Image Upload Section */}
            <div className="flex flex-col items-center text-center bg-gradient-to-br from-primary-50 to-purple-50 rounded-2xl p-8 border-2 border-dashed border-primary-200">
              <div className="w-48 h-48 rounded-2xl bg-white flex items-center justify-center overflow-hidden mb-4 border-4 border-white shadow-lg">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Dog preview"
                    className="w-full h-full object-cover"
                    onError={() => setImagePreview('')}
                  />
                ) : (
                  <span className="text-8xl opacity-30">🐕</span>
                )}
              </div>
              <div className="w-full space-y-3">
                <label className="cursor-pointer w-full px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-center font-semibold">
                  {t('addDog.uploadImage')}
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
                  {t('addDog.imageUrl')}
                </label>
                <input
                  type="url"
                  value={formData.imageUrl && !formData.imageUrl.startsWith('data:') ? formData.imageUrl : ''}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  placeholder={t('addDog.imageUrlPlaceholder')}
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
                    {t('addDog.deleteImage')}
                  </button>
                )}
              </div>
              <p className="mt-4 text-xs text-gray-500">{t('addDog.uploadHint')}</p>
            </div>

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('addDog.name')} *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-primary-200 transition-all"
                placeholder={t('addDog.namePlaceholder')}
              />
            </div>

            {/* Breed and Age Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="breed" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('addDog.breed')} *
                </label>
                <BreedAutocomplete
                  value={formData.breed}
                  breedId={formData.breedId}
                  onChange={(breed, breedId) => {
                    setFormData((prev) => ({ ...prev, breed, breedId: breedId || '' }));
                    setMessage(null);
                  }}
                  placeholder={t('addDog.breedPlaceholder') || 'Начните вводить название породы...'}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-primary-200 transition-all"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Выберите породу из списка</p>
              </div>
              <div>
                <label htmlFor="age" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('addDog.age')}
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="0"
                  max="30"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-primary-200 transition-all"
                  placeholder={t('addDog.agePlaceholder')}
                />
              </div>
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('addDog.description')}
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-primary-200 transition-all resize-none"
                placeholder={t('addDog.descriptionPlaceholder')}
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
                  {t('addDog.submitting')}
                </span>
              ) : (
                t('addDog.submit')
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
