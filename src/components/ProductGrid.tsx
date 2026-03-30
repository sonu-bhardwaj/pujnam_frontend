import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { productsApi } from '../lib/api';
import { mapProduct } from '../lib/mappers';
import { ProductCard } from './ProductCard';
import { placeholders } from '../lib/placeholders';

interface ProductGridProps {
  title: string;
  filter?: 'featured' | 'bestseller';
  limit?: number;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ title, filter, limit = 8 }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await productsApi.getAll({
          featured: filter === 'featured' ? true : undefined,
          bestseller: filter === 'bestseller' ? true : undefined,
          limit,
        });

        if (error) {
          console.error('❌ Failed to load products:', error);
          console.error('📊 Response data:', data);
          setLoading(false);
          return;
        }

        console.log('✅ Products API Response:', data);
        const productsList = data?.products || (Array.isArray(data) ? data : []);
        console.log('📦 Products List:', productsList, 'Count:', productsList?.length);
        
        if (!productsList || productsList.length === 0) {
          console.warn('⚠️ No products found in response');
        }
        
        const mapped = Array.isArray(productsList) ? productsList.map(mapProduct) : [];
        console.log('🔄 Mapped products:', mapped.length);
        
        // Additional frontend filter as fallback to ensure only bestseller products are shown
        const filtered = filter === 'bestseller'
          ? mapped.filter((product) => product.is_bestseller === true).slice(0, limit)
          : mapped.slice(0, limit);
        
        console.log('✨ Final filtered products:', filtered.length);
        setProducts(filtered);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filter, limit]);

  // For featured collection, show first 4 in arched display, rest in grid
  const featuredProducts = filter === 'featured' ? products.slice(0, 4) : [];
  const remainingProducts = filter === 'featured' ? products.slice(4) : products;

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-[#1A1A1A] mb-12">
          {title} <span className="text-gradient">Collection</span>
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : products.length > 0 ? (
          <>
            {/* Arched Display for Featured Products */}
            {filter === 'featured' && featuredProducts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {featuredProducts.map((product, index) => {
                  const bgColors = [
                    'bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100',
                    'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100',
                    'bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100',
                    'bg-gradient-to-br from-green-50 via-emerald-50 to-green-100',
                  ];

                  const image = product.image_url || product.images?.[0] || placeholders.product;
                  const comparePrice = product.compare_at_price ?? product.originalPrice ?? null;
                  const discountPercent = comparePrice
                    ? Math.round(((comparePrice - product.price) / comparePrice) * 100)
                    : 0;

                  return (
                    <a
                      key={product.id}
                      href={`#/product/${product.slug || product.id}`}
                      className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3"
                    >
                      <div className={`${bgColors[index % bgColors.length]} relative h-96 md:h-[420px] flex flex-col items-center justify-center p-6`}>
                        {/* Decorative arch */}
                        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white/30 via-white/10 to-transparent rounded-t-3xl"></div>
                        
                        {/* Discount Badge */}
                        {discountPercent > 0 && (
                          <div className="absolute top-4 left-4 bg-[#FF8C00] text-white px-3 py-1.5 rounded-full text-xs md:text-sm font-bold z-20 shadow-lg">
                            {discountPercent}% OFF
                          </div>
                        )}

                        {/* Product Image - Large circular */}
                        <div className="relative z-10 mb-4">
                          <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden bg-white/90 shadow-2xl border-4 border-white ring-4 ring-white/50 group-hover:scale-110 transition-transform duration-500">
                            <img
                              src={image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="relative z-10 text-center px-2">
                          {product.deity && (
                            <p className="text-xs text-[#FF8C00] font-semibold mb-1 uppercase tracking-wide">
                              {product.deity}
                            </p>
                          )}
                          <h3 className="text-base md:text-lg font-bold text-[#1A1A1A] mb-2 line-clamp-2 group-hover:text-[#FF8C00] transition-colors">
                            {product.name}
                          </h3>
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="text-lg md:text-xl font-bold text-[#1A1A1A]">₹{product.price}</span>
                            {comparePrice && (
                              <span className="text-sm text-gray-500 line-through">
                                ₹{comparePrice}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute bottom-6 right-6 opacity-20 group-hover:opacity-40 transition-opacity">
                          <div className="w-20 h-20 rounded-full bg-white/60 blur-sm"></div>
                        </div>
                        <div className="absolute top-6 left-6 opacity-10 group-hover:opacity-20 transition-opacity">
                          <div className="w-12 h-12 rounded-full bg-white/40"></div>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}

            {/* Regular Grid for Remaining Products (only for featured) */}
            {filter === 'featured' && remainingProducts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {remainingProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* If not featured, show all in regular grid */}
            {filter !== 'featured' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found</p>
            <p className="text-sm text-gray-400 mt-2">Check browser console for details</p>
          </div>
        )}
      </div>
    </section>
  );
};
