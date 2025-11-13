'use client';

import { useState, useEffect } from 'react';

interface Dog {
  id: string;
  name: string;
  breed?: string;
  age?: number;
  description?: string;
  imageUrl?: string;
}

interface DogCardProps {
  dog: Dog;
  onSwipe: (direction: 'left' | 'right') => void;
  isActive: boolean;
}

export default function DogCard({ dog, onSwipe, isActive }: DogCardProps) {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isActive) return;
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isActive || !isDragging) return;
    const current = e.touches[0].clientX;
    const diff = current - startX;
    setCurrentX(diff);
    setRotation(diff * 0.1);
  };

  const handleTouchEnd = () => {
    if (!isActive || !isDragging) return;
    const threshold = 100;
    
    if (Math.abs(currentX) > threshold) {
      onSwipe(currentX > 0 ? 'right' : 'left');
    } else {
      setCurrentX(0);
      setRotation(0);
    }
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isActive) return;
    setStartX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isActive || !isDragging) return;
    const diff = e.clientX - startX;
    setCurrentX(diff);
    setRotation(diff * 0.1);
  };

  const handleMouseUp = () => {
    if (!isActive || !isDragging) return;
    const threshold = 100;
    
    if (Math.abs(currentX) > threshold) {
      onSwipe(currentX > 0 ? 'right' : 'left');
    } else {
      setCurrentX(0);
      setRotation(0);
    }
    setIsDragging(false);
  };

  useEffect(() => {
    if (!isDragging) {
      setCurrentX(0);
      setRotation(0);
    }
  }, [isDragging]);

  const cardStyle: React.CSSProperties = {
    transform: `translateX(${currentX}px) rotate(${rotation}deg)`,
    opacity: isActive ? 1 : 0.7,
    zIndex: isActive ? 10 : 1,
  };

  return (
    <div
      className="absolute w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing transition-all"
      style={cardStyle}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="h-[70%] bg-gray-200 flex items-center justify-center overflow-hidden">
        {dog.imageUrl ? (
          <img src={dog.imageUrl} alt={dog.name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-9xl opacity-30">🐕</div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex-1">
          <h2 className="text-3xl font-bold mb-2 text-gray-900">
            {dog.name}
            {dog.age && (
              <span className="text-2xl text-gray-600 font-normal">
                , {dog.age} {dog.age === 1 ? 'год' : dog.age < 5 ? 'года' : 'лет'}
              </span>
            )}
          </h2>
          {dog.breed && (
            <p className="text-xl text-primary-600 font-semibold mb-3">{dog.breed}</p>
          )}
          {dog.description && (
            <p className="text-gray-700 leading-relaxed line-clamp-3">{dog.description}</p>
          )}
        </div>
        <div className="flex justify-center gap-8 pt-4 border-t border-gray-200">
          <button
            className="w-16 h-16 rounded-full bg-red-500 text-white text-3xl hover:bg-red-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-110 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onSwipe('left')}
            disabled={!isActive}
          >
            ✕
          </button>
          <button
            className="w-16 h-16 rounded-full bg-green-500 text-white text-3xl hover:bg-green-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-110 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onSwipe('right')}
            disabled={!isActive}
          >
            ♥
          </button>
        </div>
      </div>
    </div>
  );
}
