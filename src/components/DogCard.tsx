// DogCard.tsx
import React from 'react';

interface DogCardProps {
  photo: string;
  description: string;
}

const DogCard: React.FC<DogCardProps> = ({ photo, description }) => {
  return (
      <div className="dog-card flex flex-col items-center p-4 bg-white rounded-lg shadow-md">
        <img src={photo} alt="Dog" className="w-full h-148 object-cover rounded-lg mb-4" />
        <p className="text-center text-customGrayText">{description}</p>
      </div>
  );
};

export default DogCard;