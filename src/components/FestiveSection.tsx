import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { festivalsApi } from '../lib/api';

interface Festival {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  image?: string;
  products?: any[];
  slug?: string;
}

export const FestiveSection: React.FC = () => {
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFestivals();
  }, []);

  const fetchFestivals = async () => {
    try {
      setLoading(true);
      const { data, error } = await festivalsApi.getAll();
      if (error) {
        console.error('Failed to load festivals:', error);
        return;
      }
      setFestivals(data?.festivals || []);
    } catch (error) {
      console.error('Error fetching festivals:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-[#1A1A1A] mb-12">
            Festive <span className="text-gradient">Essentials</span>
          </h2>
          <div className="text-center py-8">
            <p className="text-gray-500">Loading festivals...</p>
          </div>
        </div>
      </section>
    );
  }

  if (festivals.length === 0) {
    return null; // Don't show section if no festivals
  }

  // Show first 2 festivals in grid layout
  const displayFestivals = festivals.slice(0, 2);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-[#1A1A1A] mb-12">
          Festive <span className="text-gradient">Essentials</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {displayFestivals.map((festival) => {
            const festivalId = festival._id || festival.id || '';
            const festivalSlug = festival.slug || festivalId;
            const productCount = Array.isArray(festival.products) ? festival.products.length : 0;
            
            return (
              <div key={festivalId} className="relative group overflow-hidden rounded-2xl shadow-xl card-hover">
                <img
                  src={festival.image || 'https://images.pexels.com/photos/11375757/pexels-photo-11375757.jpeg'}
                  alt={festival.name}
                  className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/11375757/pexels-photo-11375757.jpeg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="text-[#FF8C00]" size={28} />
                    <h3 className="text-3xl font-bold text-white">{festival.name}</h3>
                  </div>
                  <p className="text-white/90 mb-2">
                    {festival.description || 'Complete puja kits and sacred items'}
                  </p>
                  {productCount > 0 && (
                    <p className="text-white/70 text-sm mb-4">
                      {productCount} {productCount === 1 ? 'product' : 'products'} in this collection
                    </p>
                  )}
                  <a
                    href={`#/festival/${festivalSlug}`}
                    className="btn-primary inline-flex items-center gap-2 w-fit"
                  >
                    Shop Collection
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
