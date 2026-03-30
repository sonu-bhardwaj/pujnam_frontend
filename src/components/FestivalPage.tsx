import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { festivalsApi } from '../lib/api';
import { mapProduct } from '../lib/mappers';
import { ProductCard } from './ProductCard';
import { AnnouncementBar } from './AnnouncementBar';
// import { PanchangBar } from './PanchangBar';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { Sparkles } from 'lucide-react';

interface FestivalPageProps {
  festivalSlug: string;
}

export const FestivalPage: React.FC<FestivalPageProps> = ({ festivalSlug }) => {
  const [festival, setFestival] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFestival = async () => {
      setLoading(true);
      try {
        // First, get all festivals to find the one with matching slug
        const { data: allFestivalsData, error: allError } = await festivalsApi.getAll();
        if (allError) {
          console.error('Failed to load festivals', allError);
          setLoading(false);
          return;
        }

        const allFestivals = allFestivalsData?.festivals || [];
        const foundFestival = allFestivals.find(
          (f: any) => f.slug === festivalSlug || f._id === festivalSlug || f.id === festivalSlug
        );

        if (!foundFestival) {
          console.error('Festival not found');
          setLoading(false);
          return;
        }

        setFestival(foundFestival);

        // Map products if they exist
        if (foundFestival.products && Array.isArray(foundFestival.products)) {
          const mappedProducts = foundFestival.products
            .filter((p: any) => p && (p.name || p._id))
            .map((p: any) => mapProduct(p));
          setProducts(mappedProducts);
        }
      } catch (error) {
        console.error('Error fetching festival:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFestival();
  }, [festivalSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <AnnouncementBar />
        {/* <PanchangBar /> */}
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 text-center">
          <p className="text-gray-500">Loading festival...</p>
        </main>
        <Footer />
        <CartDrawer />
      </div>
    );
  }

  if (!festival) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <AnnouncementBar />
        {/* <PanchangBar /> */}
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-4">Festival Not Found</h1>
          <p className="text-gray-600 mb-6">The festival you're looking for doesn't exist.</p>
          <a href="#/" className="btn-primary inline-block">
            Go to Home
          </a>
        </main>
        <Footer />
        <CartDrawer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AnnouncementBar />
      {/* <PanchangBar /> */}
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-96 overflow-hidden">
          <img
            src={festival.image || 'https://images.pexels.com/photos/11375757/pexels-photo-11375757.jpeg'}
            alt={festival.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/11375757/pexels-photo-11375757.jpeg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8 md:p-12">
            <div className="container mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="text-[#FF8C00]" size={32} />
                <h1 className="text-4xl md:text-5xl font-bold text-white">{festival.name}</h1>
              </div>
              {festival.description && (
                <p className="text-white/90 text-lg md:text-xl max-w-3xl mb-4">
                  {festival.description}
                </p>
              )}
              {festival.startDate && festival.endDate && (
                <p className="text-white/70 text-sm">
                  {new Date(festival.startDate).toLocaleDateString()} - {new Date(festival.endDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#1A1A1A] mb-2">
                Products in this Collection
              </h2>
              <p className="text-gray-600">
                {products.length} {products.length === 1 ? 'product' : 'products'} available
              </p>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products available in this collection yet.</p>
                <a href="#/products" className="btn-primary inline-block mt-4">
                  Browse All Products
                </a>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};
