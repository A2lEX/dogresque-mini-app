'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { authApi } from '@/lib/api';
import { saveAuth } from '@/lib/auth';
import { useTranslation } from '@/hooks/useTranslation';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  userType?: string;
  general?: string;
}

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [userType, setUserType] = useState<'shelter' | 'private'>('private');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('register.errors.nameRequired');
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t('register.errors.nameMin');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('register.errors.emailRequired');
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t('register.errors.emailInvalid');
    }

    if (!formData.password) {
      newErrors.password = t('register.errors.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('register.errors.passwordMin');
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('register.errors.confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('register.errors.passwordMismatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      let authResponse;
      
      if (userType === 'shelter') {
        const submitData = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        };
        authResponse = await authApi.registerShelter(submitData);
      } else {
        // Для частного лица нужно разделить имя на firstName и lastName
        const nameParts = formData.name.trim().split(/\s+/);
        const firstName = nameParts[0] || formData.name.trim();
        const lastName = nameParts.slice(1).join(' ') || '';
        
        const submitData = {
          firstName: firstName,
          lastName: lastName || undefined,
          email: formData.email.trim(),
          password: formData.password,
        };
        authResponse = await authApi.registerPrivatePerson(submitData);
      }

      // Сохраняем токен и данные пользователя
      saveAuth(authResponse);

      // Успешная регистрация - перенаправляем на главную
      router.push('/');
    } catch (error: any) {
      setErrors({
        general: error.response?.data?.message || t('register.errors.general'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Очищаем ошибку для поля при вводе
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50">
      <Header />
      
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-purple-600 px-8 py-10 text-center">
              <div className="text-6xl mb-4">🐕</div>
              <h1 className="text-3xl font-bold text-white mb-2">{t('register.title')}</h1>
              <p className="text-primary-100">{t('register.subtitle')}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* User Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {t('register.accountType')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUserType('private')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      userType === 'private'
                        ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">👤</div>
                    <div className="font-semibold">{t('register.privatePerson')}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('shelter')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      userType === 'shelter'
                        ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">🏠</div>
                    <div className="font-semibold">{t('register.shelter')}</div>
                  </button>
                </div>
              </div>

              {/* General Error */}
              {errors.general && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <p className="text-red-700 text-sm">{errors.general}</p>
                </div>
              )}

              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  {userType === 'shelter' ? t('register.shelterName') : t('register.name')} *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 ${
                    errors.name
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:border-primary-500 focus:ring-primary-200'
                  }`}
                  placeholder={userType === 'shelter' ? t('register.shelterNamePlaceholder') : t('register.namePlaceholder')}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span> {errors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('register.email')} *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:border-primary-500 focus:ring-primary-200'
                  }`}
                  placeholder={t('register.emailPlaceholder')}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span> {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('register.password')} *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 pr-12 ${
                      errors.password
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-200 focus:border-primary-500 focus:ring-primary-200'
                    }`}
                    placeholder={t('register.passwordPlaceholder')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span> {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('register.confirmPassword')} *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 pr-12 ${
                      errors.confirmPassword
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-200 focus:border-primary-500 focus:ring-primary-200'
                    }`}
                    placeholder={t('register.confirmPasswordPlaceholder')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span> {errors.confirmPassword}
                  </p>
                )}
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
                    {t('register.submitting')}
                  </span>
                ) : (
                  t('register.submit')
                )}
              </button>

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className="text-gray-600">
                  {t('register.alreadyHaveAccount')}{' '}
                  <Link href="/login" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                    {t('register.login')}
                  </Link>
                </p>
              </div>

              {/* Info Text */}
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  {t('register.info')}
                </p>
              </div>
            </form>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('register.terms')}{' '}
              <Link href="/terms" className="text-primary-600 hover:underline">
                {t('register.termsLink')}
              </Link>{' '}
              {t('register.and')}{' '}
              <Link href="/privacy" className="text-primary-600 hover:underline">
                {t('register.privacyLink')}
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
