import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Product } from '../types';
import { productsApi } from '../lib/api';
import { mapProduct } from '../lib/mappers';
import { placeholders } from '../lib/placeholders';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchProducts = async () => {
      if (searchTerm.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      const { data, error } = await productsApi.getAll({ search: searchTerm, limit: 10 });
      if (!error) {
        setResults((data?.products || []).map(mapProduct));
      } else {
        console.error('Search failed', error);
      }
      setIsLoading(false);
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-2xl animate-slide-down">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for products..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FF8C00]"
                autoFocus
              />
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-[#FF8C00] transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {searchTerm.trim().length >= 2 && (
            <div className="mt-6 max-h-96 overflow-y-auto">
              {isLoading ? (
                <p className="text-center text-gray-500">Searching...</p>
              ) : results.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.map((product) => (
                    <a
                      key={product.id}
                      href={`#/product/${product.slug || product.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={onClose}
                    >
                      <img
                        src={product.image_url || product.images?.[0] || placeholders.small}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#1A1A1A] text-sm line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-[#FF8C00] font-bold text-sm">₹{product.price}</p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No products found</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
