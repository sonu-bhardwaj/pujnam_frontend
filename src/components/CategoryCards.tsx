import React, { useState, useEffect } from 'react';
import { Category, Product } from '../types';
import { categoriesApi, productsApi } from '../lib/api';
import { mapCategory, mapProduct } from '../lib/mappers';
import { getPlaceholderImage } from '../lib/placeholders';
import { ChevronRight } from 'lucide-react';

const IMAGE_NOT_AVAILABLE = getPlaceholderImage(400, 300, 'Image not available');

export const CategoryCards: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Record<string, Product[]>>({});

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await categoriesApi.getAll();
      if (error) {
        console.error('Failed to load categories', error);
        return;
      }
      const mappedCategories = (data?.categories || []).map(mapCategory);
      const mainCategories = mappedCategories.filter(cat => !cat.parent_id && cat.isActive !== false);
      setCategories(mainCategories);

      // Fetch a few products per category for image variety (first 8 categories)
      const toFetch = mainCategories.slice(0, 8);
      const productsMap: Record<string, Product[]> = {};

      for (const category of toFetch) {
        try {
          const { data: productsData } = await productsApi.getAll({
            category: category.id,
            limit: 2,
          });
          if (productsData?.products) {
            productsMap[category.id] = (productsData.products || []).map(mapProduct);
          }
        } catch (err) {
          console.error(`Error fetching products for ${category.name}:`, err);
        }
      }
      setCategoryProducts(productsMap);
    };
    fetchData();
  }, []);

  const displayCategories = categories.slice(0, 8);
  if (displayCategories.length === 0) return null;

  return (
    <section className="py-10 md:py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-[#1A1A1A] mb-6 md:mb-8">
          Shop Product by <span className="text-[#FF8C00]">Category</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5">
          {displayCategories.map((category) => {
            const products = categoryProducts[category.id] || [];
            const categoryImage = category.image_url || category.image;
            const productImage = products.length > 0
              ? (products[0].image_url || products[0].images?.[0])
              : null;
            const displayImage = categoryImage || productImage || IMAGE_NOT_AVAILABLE;

            return (
              <a
                key={category.id}
                href={`#/category/${category.slug || category.id}`}
                className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8C00] focus-visible:ring-offset-2 rounded-xl"
              >
                <div className="relative rounded-xl overflow-hidden transition-all duration-300 ease-out bg-white shadow-sm hover:shadow-md hover:-translate-y-1 border border-gray-200">
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                      src={displayImage}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = IMAGE_NOT_AVAILABLE;
                      }}
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-bold text-[#1A1A1A] group-hover:text-[#FF8C00] transition-colors uppercase tracking-wide text-xs md:text-sm min-h-[2.25rem] flex items-center justify-center">
                      {category.name}
                    </h3>
                    <span className="btn-gradient-flow inline-flex items-center justify-center gap-1.5 mt-2.5 w-full py-2 px-3 rounded-lg text-white text-xs md:text-sm font-semibold shadow-sm transition-all duration-300 group-hover:scale-[1.02]">
                      Shop now
                      <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
        {categories.length > 8 && (
          <div className="flex justify-center mt-6 md:mt-8">
            <a
              href="#/categories"
              className="btn-secondary px-6 py-2.5 rounded-lg text-sm font-semibold"
            >
              View All Categories
            </a>
          </div>
        )}
      </div>
    </section>
  );
};
