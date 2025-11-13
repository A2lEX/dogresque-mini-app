'use client'

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.svg" 
                alt="patrons.dog" 
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                patrons.dog
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="https://t.me/dogresque" target="_blank" rel="noopener noreferrer" 
                 className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-600 transition-colors">
                💬
              </a>
              <a href="https://vk.com/dogresque" target="_blank" rel="noopener noreferrer"
                 className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-600 transition-colors">
                👥
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">{t('footer.navigation')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  {t('footer.home')}
                </Link>
              </li>
              <li>
                <Link href="/dogs" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  {t('footer.dogs')}
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  {t('footer.register')}
                </Link>
              </li>
              <li>
                <Link href="/donations" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  {t('footer.donations')}
                </Link>
              </li>
              <li>
                <Link href="/goals" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  {t('footer.goals')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Add Content */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">{t('footer.add')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dogs/add" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  {t('footer.addDog')}
                </Link>
              </li>
              <li>
                <Link href="/dogs/photos/add" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  {t('footer.addPhoto')}
                </Link>
              </li>
              <li>
                <Link href="/dogs/stories/add" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  {t('footer.addStory')}
                </Link>
              </li>
              <li>
                <Link href="/dogs/history/add" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  {t('footer.addHistory')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">{t('footer.contacts')}</h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:info@patrons.dog" className="flex items-center space-x-2 text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  <span>📧</span>
                  <span>info@patrons.dog</span>
                </a>
              </li>
              <li>
                <a href="tel:+79991234567" className="flex items-center space-x-2 text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  <span>📞</span>
                  <span>+7 (999) 123-45-67</span>
                </a>
              </li>
              <li>
                <a href="https://t.me/dogresque" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center space-x-2 text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  <span>💬</span>
                  <span>Telegram</span>
                </a>
              </li>
              <li>
                <a href="https://vk.com/dogresque" target="_blank" rel="noopener noreferrer"
                   className="flex items-center space-x-2 text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  <span>👥</span>
                  <span>ВКонтакте</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 text-sm">
              &copy; {currentYear} patrons.dog. {t('footer.rights')}
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <Link href="/privacy" className="text-gray-500 hover:text-primary-400 transition-colors">
                Политика конфиденциальности
              </Link>
              <span className="text-gray-700">•</span>
              <Link href="/terms" className="text-gray-500 hover:text-primary-400 transition-colors">
                Условия использования
              </Link>
              <span className="text-gray-700">•</span>
              <Link href="/about" className="text-gray-500 hover:text-primary-400 transition-colors">
                О проекте
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
