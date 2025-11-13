'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, logout, isAuthenticated, AUTH_CHANGE_EVENT } from '@/lib/auth';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Header() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [auth, setAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthState = () => {
      setAuth(isAuthenticated());
      setUser(getUser());
    };

    checkAuthState();

    const handleAuthChange = () => {
      checkAuthState();
    };

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange as EventListener);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dogs?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    setAuth(false);
    setUser(null);
    setIsMenuOpen(false);
    router.push('/');
  };

  const userName = user
    ? user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.email
    : null;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <img 
              src="/logo.svg" 
              alt="patrons.dog" 
              className="h-10 w-10 transition-transform group-hover:scale-110 object-contain"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              patrons.dog
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/dogs"
              className="px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors"
            >
              {t('nav.dogs')}
            </Link>
            {!auth && (
              <>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors"
                >
                  {t('nav.register')}
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors"
                >
                  {t('nav.login')}
                </Link>
              </>
            )}
            <Link
              href="/donations"
              className="px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors"
            >
              {t('nav.donations')}
            </Link>
            <Link
              href="/goals"
              className="px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors"
            >
              {t('nav.goals')}
            </Link>
            {auth && (
              <Link
                href="/profile"
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors"
              >
                {t('nav.profile')}
              </Link>
            )}
            <LanguageSwitcher />
          </nav>

          {/* User Info & Search */}
          <div className="hidden lg:flex items-center space-x-4 flex-1 max-w-md mx-8">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative flex-1">
              <input
                type="text"
                placeholder={t('nav.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            </form>

            {/* User Menu */}
            {auth && userName && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-700">{userName}</div>
                  <div className="text-xs text-gray-500">{user.role === 'private_person' ? t('roles.privatePerson') : t('roles.shelter')}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  {t('nav.logout')}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-2">
              <Link
                href="/dogs"
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.dogs')}
              </Link>
              {!auth && (
                <>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.register')}
                  </Link>
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.login')}
                  </Link>
                </>
              )}
              <Link
                href="/donations"
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.donations')}
              </Link>
              <Link
                href="/goals"
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.goals')}
              </Link>
              {auth && (
                <>
                  <Link
                    href="/profile"
                    className="px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.profile')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 font-medium text-left"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              )}
              <div className="px-4">
                <LanguageSwitcher />
              </div>
              <form onSubmit={handleSearch} className="px-4 pt-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('nav.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                </div>
              </form>
              {auth && userName && (
                <div className="px-4 py-2 text-sm text-gray-600">
                  <div className="font-semibold">{userName}</div>
                  <div className="text-xs">{user.role === 'private_person' ? t('roles.privatePerson') : t('roles.shelter')}</div>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
