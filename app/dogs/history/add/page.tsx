'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { dogHistoryApi, dogsApi } from '@/lib/api';

export default function AddHistoryPage() {
  const [formData, setFormData] = useState({
    dogId: '',
    content: '',
  });
  const [dogs, setDogs] = useState<any[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const loadDogs = async () => {
      try {
        const dogsData = await dogsApi.findAll();
        setDogs(Array.isArray(dogsData) ? dogsData : []);
      } catch (error) {
        console.error('Ошибка загрузки собак:', error);
      } finally {
        setLoadingData(false);
      }
    };
    loadDogs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const submitData: any = {
        dogId: formData.dogId,
      };

      if (formData.content) submitData.content = formData.content;

      await dogHistoryApi.create(submitData);
      setMessage({ type: 'success', text: 'История успешно добавлена!' });
      setFormData({
        dogId: '',
        content: '',
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Произошла ошибка при добавлении истории',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loadingData) {
    return (
      <div className="container">
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <Link href="/" style={{ display: 'inline-block', marginBottom: '20px', color: '#667eea' }}>
        ← Назад на главную
      </Link>
      <h1>Добавить историю собаки</h1>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="dogId">Выберите собаку *</label>
          <select
            id="dogId"
            name="dogId"
            required
            value={formData.dogId}
            onChange={handleChange}
          >
            <option value="">Выберите собаку</option>
            {dogs.map((dog) => (
              <option key={dog.id} value={dog.id}>
                {dog.name} {dog.breed ? `(${dog.breed})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="content">Содержание истории</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Расскажите историю о собаке: как она попала к вам, что пережила, как изменилась..."
            style={{ minHeight: '200px' }}
          />
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Добавление...' : 'Добавить историю'}
        </button>
      </form>
    </div>
  );
}

