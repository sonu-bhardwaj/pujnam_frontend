import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Banner } from '../types';
import { bannersApi } from '../lib/api';

/* ✅ API response type */
interface BannerApiResponse {
  banners: Banner[];
}

export const HeroCarousel: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      const { data, error } = (await bannersApi.getAll({
        position: 'hero',
        active: true,
      })) as {
        data?: BannerApiResponse;
        error?: unknown;
      };

      if (!error && data?.banners?.length) {
        setBanners(
          data.banners.map((b) => ({
            id: b.id,
            title: b.title,
            subtitle: b.subtitle,
            image_url: b.image_url,
            link_url: b.link_url || '#/',
            button_text: b.button_text || 'Shop Now',
          }))
        );
      } else {
        setBanners([]);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (!banners.length) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % banners.length);

  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);

  // 🚫 No banners → render nothing
  if (!banners.length) return null;

  return (
    <div className="relative w-full h-[500px] lg:h-[600px] overflow-hidden group">
      {banners.map((banner, index) => (
        <div
          key={banner.id || banner.image_url || `banner-${index}`}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="relative w-full h-full">
            <img
              src={banner.image_url}
              alt={banner.title}
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-2xl text-white space-y-4 animate-fade-in">
                  <h2 className="text-4xl lg:text-6xl font-bold">
                    {banner.title}
                  </h2>
                  <p className="text-xl lg:text-2xl">
                    {banner.subtitle}
                  </p>
                  <a href={banner.link_url} className="inline-block btn-primary">
                    {banner.button_text}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* ⬅ Prev */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full opacity-0 group-hover:opacity-100 hover:bg-[#FF8C00] hover:text-white transition"
      >
        <ChevronLeft size={24} />
      </button>

      {/* ➡ Next */}
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full opacity-0 group-hover:opacity-100 hover:bg-[#FF8C00] hover:text-white transition"
      >
        <ChevronRight size={24} />
      </button>

      {/* ● Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={`dot-${banners[index]?.id || banners[index]?.image_url || index}`}
            onClick={() => setCurrentSlide(index)}
            className={`h-3 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-[#FF8C00] w-8'
                : 'bg-white/50 w-3'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
