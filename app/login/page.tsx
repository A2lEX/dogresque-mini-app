'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { authApi } from '@/lib/api';
import { saveAuth } from '@/lib/auth';
import { useTranslation } from '@/hooks/useTranslation';

export default function LoginPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'private_person' as 'shelter' | 'private_person',
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [searchParams]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string; general?: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = t('login.errors.emailRequired');
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t('login.errors.emailInvalid');
    }

    if (!formData.password) {
      newErrors.password = t('login.errors.passwordRequired');
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const authResponse = await authApi.login({
        email: formData.email.trim(),
        password: formData.password,
        userType: formData.userType,
      });
      
      // Сохраняем токен и данные пользователя
      saveAuth(authResponse);
      
      // Успешный вход - перенаправляем на главную или ЛК
      router.push('/');
    } catch (error: any) {
      setErrors({
        general: error.response?.data?.message || t('login.errors.general'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50">
      <Header />
      
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Success Message */}
          {showSuccess && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg animate-fade-in">
              <p className="text-green-700 font-semibold flex items-center gap-2">
                <span>✅</span> {t('login.registrationSuccess')}
              </p>
            </div>
          )}

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-purple-600 px-8 py-10 text-center">
              <div className="text-6xl mb-4">🔐</div>
              <h1 className="text-3xl font-bold text-white mb-2">{t('login.title')}</h1>
              <p className="text-primary-100">{t('login.subtitle')}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* General Error */}
              {errors.general && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <p className="text-red-700 text-sm">{errors.general}</p>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('login.email')} *
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
                  placeholder={t('login.emailPlaceholder')}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span> {errors.email}
                  </p>
                )}
              </div>

              {/* User Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {t('login.accountType')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, userType: 'private_person' }))}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.userType === 'private_person'
                        ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">👤</div>
                    <div className="font-semibold">{t('login.privatePerson')}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, userType: 'shelter' }))}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.userType === 'shelter'
                        ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">🏠</div>
                    <div className="font-semibold">{t('login.shelter')}</div>
                  </button>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('login.password')} *
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
                    placeholder={t('login.passwordPlaceholder')}
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

              {/* Forgot Password */}
              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  {t('login.forgotPassword')}
                </Link>
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
                    {t('login.submitting')}
                  </span>
                ) : (
                  t('login.submit')
                )}
              </button>

              {/* Register Link */}
              <div className="text-center pt-4">
                <p className="text-gray-600">
                  {t('login.noAccount')}{' '}
                  <Link href="/register" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                    {t('login.register')}
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
