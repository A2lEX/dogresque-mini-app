'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import {
  authApi,
  privatePersonsApi,
  sheltersApi,
  type UpdatePrivatePersonDto,
  type UpdateShelterDto,
} from '@/lib/api'
import {
  getUser,
  updateStoredUser,
  logout,
} from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'

interface MessageState {
  type: 'success' | 'error'
  text: string
}

type ProfileType = 'private_person' | 'shelter'

type PrivateForm = {
  firstName: string
  lastName: string
  email: string
  phone: string
  avatarUrl?: string
}

type ShelterForm = {
  name: string
  description: string
  address: string
  phone: string
  email: string
  website: string
  logoUrl?: string
}

const defaultPrivateForm: PrivateForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  avatarUrl: undefined,
}

const defaultShelterForm: ShelterForm = {
  name: '',
  description: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  logoUrl: undefined,
}

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') {
        resolve(result)
      } else {
        reject(new Error('Failed to read file'))
      }
    }
    reader.onerror = () => reject(new Error('File read error'))
    reader.readAsDataURL(file)
  })
}

export default function ProfilePage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<MessageState | null>(null)
  const [profileType, setProfileType] = useState<ProfileType | null>(null)
  const [profileId, setProfileId] = useState<string>('')
  const [privateForm, setPrivateForm] = useState<PrivateForm>(defaultPrivateForm)
  const [shelterForm, setShelterForm] = useState<ShelterForm>(defaultShelterForm)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [logoPreview, setLogoPreview] = useState<string>('')

  useEffect(() => {
    const initialiseProfile = async () => {
      try {
        const storedUser = getUser()
        if (!storedUser) {
          router.push('/login')
          return
        }

        const type: ProfileType = storedUser.role === 'shelter' ? 'shelter' : 'private_person'
        setProfileType(type)
        setProfileId(storedUser.id)

        const me = await authApi.getMe()
        const userId = me?.id ?? storedUser.id
        const resolvedType: ProfileType = me?.role === 'shelter' ? 'shelter' : type
        setProfileType(resolvedType)
        setProfileId(userId)

        if (resolvedType === 'private_person') {
          const profile = await privatePersonsApi.findOne(userId)
          setPrivateForm({
            firstName: profile?.firstName ?? '',
            lastName: profile?.lastName ?? '',
            email: profile?.email ?? '',
            phone: profile?.phone ?? '',
            avatarUrl: profile?.avatarUrl ?? undefined,
          })
          if (profile?.avatarUrl) {
            setAvatarPreview(profile.avatarUrl)
          }
          updateStoredUser({
            firstName: profile?.firstName,
            lastName: profile?.lastName,
            email: profile?.email,
          })
        } else {
          const profile = await sheltersApi.findOne(userId)
          setShelterForm({
            name: profile?.name ?? '',
            description: profile?.description ?? '',
            address: profile?.address ?? '',
            phone: profile?.phone ?? '',
            email: profile?.email ?? '',
            website: profile?.website ?? '',
            logoUrl: profile?.logoUrl ?? undefined,
          })
          if (profile?.logoUrl) {
            setLogoPreview(profile.logoUrl)
          }
          updateStoredUser({
            firstName: profile?.name,
            lastName: '',
            email: profile?.email,
          })
        }
      } catch (error: any) {
        setMessage({ type: 'error', text: error.response?.data?.message || t('profile.errors.loadError') })
        if (error.response?.status === 401) {
          logout()
          router.push('/login')
        }
      } finally {
        setLoading(false)
      }
    }

    initialiseProfile()
  }, [router])

  const handlePrivateChange = (field: keyof PrivateForm, value: string) => {
    setPrivateForm((prev) => ({ ...prev, [field]: value }))
    setMessage(null)
  }

  const handleShelterChange = (field: keyof ShelterForm, value: string) => {
    setShelterForm((prev) => ({ ...prev, [field]: value }))
    setMessage(null)
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: t('profile.errors.loadError') })
      return
    }
    
    // Проверка размера файла (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: t('profile.errors.loadError') })
      return
    }
    
    try {
      const dataUrl = await convertFileToBase64(file)
      setPrivateForm((prev) => ({ ...prev, avatarUrl: dataUrl }))
      setAvatarPreview(dataUrl)
      setMessage(null)
    } catch (error) {
      setMessage({ type: 'error', text: t('profile.errors.loadError') })
    }
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: t('profile.errors.loadError') })
      return
    }
    
    // Проверка размера файла (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: t('profile.errors.loadError') })
      return
    }
    
    try {
      const dataUrl = await convertFileToBase64(file)
      setShelterForm((prev) => ({ ...prev, logoUrl: dataUrl }))
      setLogoPreview(dataUrl)
      setMessage(null)
    } catch (error) {
      setMessage({ type: 'error', text: t('profile.errors.loadError') })
    }
  }

  const handleAvatarUrlChange = (url: string) => {
    setPrivateForm((prev) => ({ ...prev, avatarUrl: url }))
    setAvatarPreview(url)
    setMessage(null)
  }

  const handleLogoUrlChange = (url: string) => {
    setShelterForm((prev) => ({ ...prev, logoUrl: url }))
    setLogoPreview(url)
    setMessage(null)
  }

  const validateEmail = (email: string) => {
    if (!email) return true
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handlePrivateSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!privateForm.firstName.trim()) {
      setMessage({ type: 'error', text: t('profile.errors.firstNameRequired') })
      return
    }

    if (privateForm.email && !validateEmail(privateForm.email.trim())) {
      setMessage({ type: 'error', text: t('profile.errors.emailInvalid') })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const payload: UpdatePrivatePersonDto = {
        firstName: privateForm.firstName.trim() || undefined,
        lastName: privateForm.lastName.trim() || undefined,
        email: privateForm.email.trim() || undefined,
        phone: privateForm.phone.trim() || undefined,
        avatarUrl: privateForm.avatarUrl?.trim() || undefined,
      }

      const updated = await privatePersonsApi.update(profileId, payload)

      setPrivateForm({
        firstName: updated?.firstName ?? privateForm.firstName,
        lastName: updated?.lastName ?? privateForm.lastName,
        email: updated?.email ?? privateForm.email,
        phone: updated?.phone ?? privateForm.phone,
        avatarUrl: updated?.avatarUrl ?? privateForm.avatarUrl,
      })
      if (updated?.avatarUrl) {
        setAvatarPreview(updated.avatarUrl)
      }

      updateStoredUser({
        firstName: updated?.firstName,
        lastName: updated?.lastName,
        email: updated?.email,
      })

      setMessage({ type: 'success', text: t('profile.success') })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || t('profile.errors.saveError') })
    } finally {
      setSaving(false)
    }
  }

  const handleShelterSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!shelterForm.name.trim()) {
      setMessage({ type: 'error', text: t('profile.errors.shelterNameRequired') })
      return
    }

    if (shelterForm.email && !validateEmail(shelterForm.email.trim())) {
      setMessage({ type: 'error', text: t('profile.errors.emailInvalid') })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const payload: UpdateShelterDto = {
        name: shelterForm.name.trim() || undefined,
        description: shelterForm.description.trim() || undefined,
        address: shelterForm.address.trim() || undefined,
        phone: shelterForm.phone.trim() || undefined,
        email: shelterForm.email.trim() || undefined,
        website: shelterForm.website.trim() || undefined,
        logoUrl: shelterForm.logoUrl?.trim() || undefined,
      }

      const updated = await sheltersApi.update(profileId, payload)

      setShelterForm({
        name: updated?.name ?? shelterForm.name,
        description: updated?.description ?? shelterForm.description,
        address: updated?.address ?? shelterForm.address,
        phone: updated?.phone ?? shelterForm.phone,
        email: updated?.email ?? shelterForm.email,
        website: updated?.website ?? shelterForm.website,
        logoUrl: updated?.logoUrl ?? shelterForm.logoUrl,
      })
      if (updated?.logoUrl) {
        setLogoPreview(updated.logoUrl)
      }

      updateStoredUser({
        firstName: updated?.name,
        lastName: '',
        email: updated?.email,
      })

      setMessage({ type: 'success', text: t('profile.success') })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || t('profile.errors.saveError') })
    } finally {
      setSaving(false)
    }
  }

  const renderAvatarSection = () => (
    <div className="flex flex-col items-center text-center bg-white rounded-2xl shadow-lg p-8">
      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center overflow-hidden mb-4 border-4 border-white shadow-lg">
        {avatarPreview ? (
          <img src={avatarPreview} alt="Аватар" className="w-full h-full object-cover" onError={() => setAvatarPreview('')} />
        ) : (
          <span className="text-4xl">🐾</span>
        )}
      </div>
      <div className="w-full space-y-3">
        <label className="cursor-pointer w-full px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-center font-semibold">
          {t('profile.uploadAvatar')}
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </label>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">{t('profile.or')}</span>
          </div>
        </div>
        <label className="block text-sm font-semibold text-gray-700 text-left">
          {t('profile.privatePerson.avatar')}
        </label>
        <input
          type="url"
          value={privateForm.avatarUrl && !privateForm.avatarUrl.startsWith('data:') ? privateForm.avatarUrl : ''}
          onChange={(e) => handleAvatarUrlChange(e.target.value)}
          placeholder={t('profile.privatePerson.avatarUrlPlaceholder')}
          className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-primary-200 transition-all text-sm"
        />
        {avatarPreview && (
          <button
            type="button"
            onClick={() => {
              setAvatarPreview('')
              setPrivateForm((prev) => ({ ...prev, avatarUrl: undefined }))
            }}
            className="w-full px-4 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            {t('profile.deleteAvatar')}
          </button>
        )}
      </div>
      <p className="mt-4 text-xs text-gray-500">
        {t('profile.uploadHint')}
      </p>
    </div>
  )

  const renderLogoSection = () => (
    <div className="flex flex-col items-center text-center bg-white rounded-2xl shadow-lg p-8">
      <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center overflow-hidden mb-4 border-4 border-white shadow-lg">
        {logoPreview ? (
          <img src={logoPreview} alt="Логотип" className="w-full h-full object-cover" onError={() => setLogoPreview('')} />
        ) : (
          <span className="text-4xl">🏠</span>
        )}
      </div>
      <div className="w-full space-y-3">
        <label className="cursor-pointer w-full px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-center font-semibold">
          {t('profile.uploadLogo')}
          <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
        </label>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">{t('profile.or')}</span>
          </div>
        </div>
        <label className="block text-sm font-semibold text-gray-700 text-left">
          {t('profile.shelter.logo')}
        </label>
        <input
          type="url"
          value={shelterForm.logoUrl && !shelterForm.logoUrl.startsWith('data:') ? shelterForm.logoUrl : ''}
          onChange={(e) => handleLogoUrlChange(e.target.value)}
          placeholder={t('profile.shelter.logoUrlPlaceholder')}
          className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-primary-200 transition-all text-sm"
        />
        {logoPreview && (
          <button
            type="button"
            onClick={() => {
              setLogoPreview('')
              setShelterForm((prev) => ({ ...prev, logoUrl: undefined }))
            }}
            className="w-full px-4 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            {t('profile.deleteLogo')}
          </button>
        )}
      </div>
      <p className="mt-4 text-xs text-gray-500">
        {t('profile.uploadHint')}
      </p>
    </div>
  )

  const renderPrivateForm = () => (
    <form onSubmit={handlePrivateSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('profile.privatePerson.firstName')} *
        </label>
        <input
          type="text"
          value={privateForm.firstName}
          onChange={(e) => handlePrivateChange('firstName', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-primary-200 transition-all"
          placeholder={t('profile.privatePerson.firstNamePlaceholder')}
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('profile.privatePerson.lastName')}
        </label>
        <input
          type="text"
          value={privateForm.lastName}
          onChange={(e) => handlePrivateChange('lastName', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-primary-200 transition-all"
          placeholder={t('profile.privatePerson.lastNamePlaceholder')}
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('profile.privatePerson.email')}
        </label>
        <input
          type="email"
          value={privateForm.email}
          onChange={(e) => handlePrivateChange('email', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-primary-200 transition-all"
          placeholder={t('profile.privatePerson.emailPlaceholder')}
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('profile.privatePerson.phone')}
        </label>
        <input
          type="tel"
          value={privateForm.phone}
          onChange={(e) => handlePrivateChange('phone', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-primary-200 transition-all"
          placeholder={t('profile.privatePerson.phonePlaceholder')}
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="w-full py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-primary-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {saving ? t('profile.saving') : t('profile.save')}
      </button>
    </form>
  )

  const renderShelterForm = () => (
    <form onSubmit={handleShelterSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('profile.shelter.name')} *
        </label>
        <input
          type="text"
          value={shelterForm.name}
          onChange={(e) => handleShelterChange('name', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-primary-200 transition-all"
          placeholder={t('profile.shelter.namePlaceholder')}
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('profile.shelter.description')}
        </label>
        <textarea
          value={shelterForm.description}
          onChange={(e) => handleShelterChange('description', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-primary-200 transition-all min-h-[120px]"
          placeholder={t('profile.shelter.descriptionPlaceholder')}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('profile.shelter.address')}
          </label>
          <input
            type="text"
            value={shelterForm.address}
            onChange={(e) => handleShelterChange('address', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-primary-200 transition-all"
            placeholder={t('profile.shelter.addressPlaceholder')}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('profile.shelter.phone')}
          </label>
          <input
            type="tel"
            value={shelterForm.phone}
            onChange={(e) => handleShelterChange('phone', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-primary-200 transition-all"
            placeholder={t('profile.shelter.phonePlaceholder')}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('profile.shelter.email')}
          </label>
          <input
            type="email"
            value={shelterForm.email}
            onChange={(e) => handleShelterChange('email', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-primary-200 transition-all"
            placeholder={t('profile.shelter.emailPlaceholder')}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('profile.shelter.website')}
          </label>
          <input
            type="url"
            value={shelterForm.website}
            onChange={(e) => handleShelterChange('website', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-primary-200 transition-all"
            placeholder={t('profile.shelter.websitePlaceholder')}
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="w-full py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-primary-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {saving ? t('profile.saving') : t('profile.save')}
      </button>
    </form>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
        ) : profileType ? (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 text-center">{t('profile.title')}</h1>
              <p className="text-center text-gray-600 mt-3">
                {t('profile.subtitle')}
              </p>
            </div>

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

            {profileType === 'private_person' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">{renderAvatarSection()}</div>
                <div className="lg:col-span-2">{renderPrivateForm()}</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">{renderLogoSection()}</div>
                <div className="lg:col-span-2">{renderShelterForm()}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-600">{t('profile.userTypeError')}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-6 py-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
            >
              {t('profile.backToHome')}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

