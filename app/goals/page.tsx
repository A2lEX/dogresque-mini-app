'use client';

import Header from '@/components/Header';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

export default function GoalsPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/" className="inline-block mb-6 text-primary-600 hover:text-primary-700 font-medium">
          {t('goals.back')}
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('goals.title')}</h1>
        <p className="text-gray-600 text-lg">
          {t('goals.comingSoon')}
        </p>
      </main>
    </div>
  );
}

