'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { donationsApi, dogsApi } from '@/lib/api';
import type { CreateDonationDto } from '@/lib/api';

interface Dog {
  id: string;
  name: string;
  breed?: string;
  imageUrl?: string;
}

interface Donation {
  id: string;
  dogId: string;
  amount: number;
  donorName?: string;
  donorEmail?: string;
  message?: string;
  isAnonymous?: boolean;
  createdAt?: string;
}

export default function DonationsPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dogId = searchParams.get('dogId');

  const [dog, setDog] = useState<Dog | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    amount: '',
    donorName: '',
    donorEmail: '',
    message: '',
    isAnonymous: false,
  });

  useEffect(() => {
    if (dogId) {
      loadDog();
      loadDonations();
      loadTotalAmount();
    } else {
      loadAllDonations();
      loadTotalAmount();
    }
  }, [dogId]);

  const loadDog = async () => {
    if (!dogId) return;
    try {
      const data = await dogsApi.findOne(dogId);
      setDog(data);
    } catch (error) {
      console.error('Error loading dog:', error);
    }
  };

  const loadDonations = async () => {
    if (!dogId) return;
    try {
      const data = await donationsApi.findByDogId(dogId);
      setDonations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllDonations = async () => {
    try {
      const data = await donationsApi.findAll();
      setDonations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTotalAmount = async () => {
    try {
      if (dogId) {
        const data = await donationsApi.getTotalAmountByDogId(dogId);
        setTotalAmount(data?.total || 0);
      } else {
        const data = await donationsApi.getTotalAmount();
        setTotalAmount(data?.total || 0);
      }
    } catch (error) {
      console.error('Error loading total amount:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dogId) {
      setMessage({ type: 'error', text: t('donations.errors.needDog') });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount < 0.01) {
      setMessage({ type: 'error', text: t('donations.errors.minAmount') });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const donationData: CreateDonationDto = {
        dogId,
        amount,
        donorName: formData.donorName.trim() || undefined,
        donorEmail: formData.donorEmail.trim() || undefined,
        message: formData.message.trim() || undefined,
        isAnonymous: formData.isAnonymous,
      };

      await donationsApi.create(donationData);
      setMessage({ type: 'success', text: t('donations.success') });

      // Очищаем форму
      setFormData({
        amount: '',
        donorName: '',
        donorEmail: '',
        message: '',
        isAnonymous: false,
      });

      // Обновляем данные
      await Promise.all([loadDonations(), loadTotalAmount()]);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || t('donations.errors.general'),
      });
    } finally {
      setSubmitting(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href={dogId ? `/dogs/${dogId}` : '/'}
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('donations.back')}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {t('donations.title')}
              </h1>
              {dog ? (
                <div className="flex items-center gap-4 mt-4">
                  {dog.imageUrl && (
                    <img
                      src={dog.imageUrl}
                      alt={dog.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{dog.name}</p>
                    {dog.breed && <p className="text-sm text-gray-600">{dog.breed}</p>}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 mt-2">
                  {t('donations.supportFriends')}
                </p>
              )}
            </div>

            {/* Total Amount */}
            {totalAmount > 0 && (
              <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-3xl shadow-xl p-8 text-white">
                <p className="text-lg mb-2">{t('donations.totalRaised')}</p>
                <p className="text-5xl font-bold">{totalAmount.toLocaleString('ru-RU')} ₽</p>
              </div>
            )}

            {/* Donations List */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('donations.recentDonations')}</h2>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                </div>
              ) : donations.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">{t('donations.noDonations')}</p>
                  <p className="text-sm mt-2">{t('donations.beFirst')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {donations.slice(0, 10).map((donation) => (
                    <div
                      key={donation.id}
                      className="flex items-start justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">💝</span>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {donation.isAnonymous ? t('donations.anonymousDonor') : donation.donorName || t('donations.anonymousDonor')}
                            </p>
                            {donation.createdAt && (
                              <p className="text-sm text-gray-500">{formatDate(donation.createdAt)}</p>
                            )}
                          </div>
                        </div>
                        {donation.message && (
                          <p className="text-gray-700 ml-11 italic">"{donation.message}"</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-600">
                          {donation.amount.toLocaleString('ru-RU')} ₽
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Donation Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-8 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('donations.makeDonation')}</h2>

              {!dogId && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <p className="text-sm text-yellow-800">
                    {t('donations.needDog')}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
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

                <div>
                  <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('donations.amount')} *
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    required
                    min="0.01"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder={t('donations.amountPlaceholder')}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-primary-200 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="donorName" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('donations.yourName')}
                  </label>
                  <input
                    type="text"
                    id="donorName"
                    name="donorName"
                    value={formData.donorName}
                    onChange={handleChange}
                    placeholder={t('donations.namePlaceholder')}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-primary-200 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="donorEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('donations.email')}
                  </label>
                  <input
                    type="email"
                    id="donorEmail"
                    name="donorEmail"
                    value={formData.donorEmail}
                    onChange={handleChange}
                    placeholder={t('donations.emailPlaceholder')}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-primary-200 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('donations.message')}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={3}
                    placeholder={t('donations.messagePlaceholder')}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-primary-200 transition-all resize-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isAnonymous"
                    name="isAnonymous"
                    checked={formData.isAnonymous}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="isAnonymous" className="text-sm text-gray-700">
                    {t('donations.anonymous')}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !dogId}
                  className="w-full py-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-primary-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('donations.submitting')}
                    </span>
                  ) : (
                    t('donations.submit')
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

