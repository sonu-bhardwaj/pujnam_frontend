import React, { useEffect, useState } from 'react';
import { Truck, Tag } from 'lucide-react';

const announcements = [
  { icon: Tag, text: 'Save More: Get an Additional 5% Off on Orders Over ₹1499' },
  { icon: Tag, text: 'Extra 5%* Off all Prepaid Orders' },
  { icon: Truck, text: 'Free Shipping on Order Above ₹499/-' },
];

export const AnnouncementBar: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const CurrentIcon = announcements[currentIndex].icon;

  return (
    <div className="bg-[#FF8C00] text-white py-2 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 animate-fade-in">
          <CurrentIcon className="w-4 h-4" />
          <p className="text-sm font-medium">{announcements[currentIndex].text}</p>
        </div>
      </div>
    </div>
  );
};
