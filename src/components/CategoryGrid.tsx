import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { categoriesApi } from '../lib/api';
import { mapCategory } from '../lib/mappers';
import { placeholders } from '../lib/placeholders';

export const CategoryGrid: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await categoriesApi.getAll();
      if (error) {
        console.error('Failed to load categories', error);
        return;
      }
      setCategories((data?.categories || []).map(mapCategory));
    };
    fetchCategories();
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-[#1A1A1A] mb-12">
          Shop by <span className="text-gradient">Category</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => (
            <a
              key={category.id}
              href={`#/category/${category.slug || category.id}`}
              className="group text-center"
            >
              <div className="mb-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <img
                  src={category.image_url || placeholders.category}
                  alt={category.name}
                  className="w-full h-32 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="font-semibold text-[#1A1A1A] group-hover:text-[#FF8C00] transition-colors">
                {category.name}
              </h3>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
