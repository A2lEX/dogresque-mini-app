'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import DogCard from '@/components/DogCard';
import { dogsApi, donationsApi } from '@/lib/api';
import { useTranslation } from '@/hooks/useTranslation';

interface Dog {
  id: string;
  name: string;
  breed?: string;
  age?: number;
  description?: string;
  imageUrl?: string;
}

export default function Home() {
  const { t } = useTranslation();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [randomDog, setRandomDog] = useState<Dog | null>(null);
  const [loading, setLoading] = useState(true);
  const [swipedDogs, setSwipedDogs] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({ totalDogs: 0, totalDonations: 0, helpedDogs: 0 });

  useEffect(() => {
    loadDogs();
    loadStats();
  }, []);

  useEffect(() => {
    if (dogs.length > 0 && !randomDog) {
      const random = dogs[Math.floor(Math.random() * dogs.length)];
      setRandomDog(random);
    }
  }, [dogs, randomDog]);

  const loadDogs = async () => {
    try {
      setLoading(true);
      const data = await dogsApi.findAll();
      const dogsArray = Array.isArray(data) ? data : [];
      const shuffled = [...dogsArray].sort(() => Math.random() - 0.5);
      setDogs(shuffled);
      if (shuffled.length > 0) {
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error loading dogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const [dogsData, donationsData] = await Promise.all([
        dogsApi.findAll(),
        donationsApi.getTotalAmount().catch(() => ({ total: 0 })),
      ]);
      const dogsArray = Array.isArray(dogsData) ? dogsData : [];
      setStats({
        totalDogs: dogsArray.length,
        totalDonations: donationsData?.total || 0,
        helpedDogs: Math.floor(dogsArray.length * 0.3), // Примерная статистика
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (currentIndex >= dogs.length) {
      setCurrentIndex(0);
      setSwipedDogs(new Set());
      return;
    }

    const currentDog = dogs[currentIndex];
    if (currentDog) {
      setSwipedDogs(new Set([...swipedDogs, currentDog.id]));
      if (direction === 'right') {
        console.log('Лайк собаке:', currentDog.name);
      }
    }

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 300);
  };

  const getVisibleDogs = () => {
    const visible: Dog[] = [];
    const unswipedDogs = dogs.filter(dog => !swipedDogs.has(dog.id));
    for (let i = 0; i < 3 && i < unswipedDogs.length; i++) {
      const index = (currentIndex + i) % unswipedDogs.length;
      visible.push(unswipedDogs[index]);
    }
    return visible;
  };

  const visibleDogs = getVisibleDogs();
  const hasMoreDogs = dogs.length > 0 && currentIndex < dogs.length;
  const popularDogs = dogs.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-purple-600 to-primary-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
              {t('home.hero.title')}
            </h1>
            <p className="text-xl sm:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dogs"
                className="px-8 py-4 bg-white text-primary-600 rounded-full font-semibold hover:bg-primary-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                {t('home.hero.findDog')}
              </Link>
              <Link
                href="/register"
                className="px-8 py-4 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-400 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 border-2 border-white/30"
              >
                {t('home.hero.becomeShelter')}
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-primary-50 to-transparent"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl shadow-lg">
              <div className="text-5xl font-bold text-primary-600 mb-2">{stats.totalDogs}+</div>
              <div className="text-gray-600 font-medium">{t('home.statistics.dogsLooking')}</div>
            </div>
            <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg">
              <div className="text-5xl font-bold text-purple-600 mb-2">{stats.helpedDogs}+</div>
              <div className="text-gray-600 font-medium">{t('home.statistics.dogsFound')}</div>
            </div>
            <div className="text-center p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg">
              <div className="text-5xl font-bold text-green-600 mb-2">{stats.totalDonations.toLocaleString()} ₽</div>
              <div className="text-gray-600 font-medium">{t('home.statistics.donationsRaised')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-white to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">{t('home.howItWorks.title')}</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            {t('home.howItWorks.subtitle')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { key: 'step1', icon: t('home.howItWorks.step1.icon'), title: t('home.howItWorks.step1.title'), desc: t('home.howItWorks.step1.description') },
              { key: 'step2', icon: t('home.howItWorks.step2.icon'), title: t('home.howItWorks.step2.title'), desc: t('home.howItWorks.step2.description') },
              { key: 'step3', icon: t('home.howItWorks.step3.icon'), title: t('home.howItWorks.step3.title'), desc: t('home.howItWorks.step3.description') },
            ].map((step, idx) => (
              <div key={step.key} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
                <div className="text-6xl mb-4">{step.icon}</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Random Dog of the Day */}
      {randomDog && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">{t('home.randomDog.title')}</h2>
            <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary-50 to-purple-50 rounded-3xl overflow-hidden shadow-2xl">
              <div className="md:flex">
                <div className="md:w-1/2 h-80 md:h-auto bg-gray-200 flex items-center justify-center">
                  {randomDog.imageUrl ? (
                    <img src={randomDog.imageUrl} alt={randomDog.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-9xl opacity-30">🐕</div>
                  )}
                </div>
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                  <h3 className="text-4xl font-bold mb-3 text-gray-900">{randomDog.name}</h3>
                  {randomDog.breed && (
                    <p className="text-xl text-primary-600 font-semibold mb-2">{randomDog.breed}</p>
                  )}
                  {randomDog.age && (
                    <p className="text-lg text-gray-600 mb-4">
                      {randomDog.age} {randomDog.age === 1 ? t('home.randomDog.years.one') : randomDog.age < 5 ? t('home.randomDog.years.few') : t('home.randomDog.years.many')}
                    </p>
                  )}
                  {randomDog.description && (
                    <p className="text-gray-700 mb-6 leading-relaxed">{randomDog.description}</p>
                  )}
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        const newRandom = dogs[Math.floor(Math.random() * dogs.length)];
                        setRandomDog(newRandom);
                      }}
                      className="px-6 py-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-all font-medium"
                    >
                      {t('home.randomDog.anotherDog')}
                    </button>
                    <Link
                      href={`/dogs/${randomDog.id}`}
                      className="px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-all font-medium"
                    >
                      {t('home.randomDog.learnMore')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Popular Dogs */}
      {popularDogs.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-primary-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">{t('home.popularDogs.title')}</h2>
            <p className="text-center text-gray-600 mb-12">{t('home.popularDogs.subtitle')}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {popularDogs.map((dog) => (
                <Link key={dog.id} href={`/dogs/${dog.id}`} className="group">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
                    <div className="h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
                      {dog.imageUrl ? (
                        <img src={dog.imageUrl} alt={dog.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      ) : (
                        <div className="text-8xl opacity-30">🐕</div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-bold mb-2 text-gray-900">{dog.name}</h3>
                      {dog.breed && <p className="text-primary-600 font-semibold mb-2">{dog.breed}</p>}
                      {dog.age && (
                        <p className="text-gray-600 mb-3">
                          {dog.age} {dog.age === 1 ? t('home.randomDog.years.one') : dog.age < 5 ? t('home.randomDog.years.few') : t('home.randomDog.years.many')}
                        </p>
                      )}
                      {dog.description && (
                        <p className="text-gray-700 line-clamp-2">{dog.description}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link
                href="/dogs"
                className="inline-block px-8 py-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-full font-semibold hover:from-primary-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {t('home.popularDogs.viewAll')}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Swipe Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">{t('home.swipe.title')}</h2>
          <p className="text-center text-gray-600 mb-12">{t('home.swipe.subtitle')}</p>
          
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">{t('home.swipe.loading')}</p>
            </div>
          ) : !hasMoreDogs ? (
            <div className="text-center py-20 bg-gradient-to-br from-primary-50 to-purple-50 rounded-3xl">
              <p className="text-2xl font-semibold mb-4">{t('home.swipe.allViewed')}</p>
              <button
                onClick={() => { setCurrentIndex(0); setSwipedDogs(new Set()); }}
                className="px-8 py-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-full font-semibold hover:from-primary-700 hover:to-purple-700 transition-all shadow-lg"
              >
                {t('home.swipe.startOver')}
              </button>
            </div>
          ) : (
            <div className="max-w-md mx-auto relative" style={{ height: '600px' }}>
              {visibleDogs.map((dog, index) => (
                <DogCard
                  key={dog.id}
                  dog={dog}
                  onSwipe={handleSwipe}
                  isActive={index === 0}
                />
              ))}
              {visibleDogs.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                  <p className="text-gray-600">{t('home.swipe.noDogs')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-gradient-to-b from-white to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">{t('home.successStories.title')}</h2>
          <p className="text-center text-gray-600 mb-12">{t('home.successStories.subtitle')}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Бобик', story: 'Нашел дом через неделю после регистрации! Теперь живет в большой семье с детьми.', owner: 'Семья Ивановых' },
              { name: 'Лада', story: 'Была спасена с улицы, прошла лечение и нашла любящих хозяев.', owner: 'Мария и Петр' },
              { name: 'Рекс', story: 'Пожилой пес нашел заботливую семью, которая дала ему второй шанс.', owner: 'Анна и Сергей' },
            ].map((story, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
                <div className="text-5xl mb-4">🐕</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{story.name}</h3>
                <p className="text-gray-700 mb-4 leading-relaxed">{story.story}</p>
                <p className="text-primary-600 font-semibold">— {story.owner}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-purple-600 to-primary-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">{t('home.cta.title')}</h2>
          <p className="text-xl mb-8 text-primary-100">
            {t('home.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-white text-primary-600 rounded-full font-semibold hover:bg-primary-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              {t('home.cta.register')}
            </Link>
            <Link
              href="/dogs/add"
              className="px-8 py-4 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-400 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 border-2 border-white/30"
            >
              {t('home.cta.addDog')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
