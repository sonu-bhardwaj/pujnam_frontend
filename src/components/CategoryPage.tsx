import React, { useEffect, useState } from 'react';
import { Filter, X, Plus, Minus } from 'lucide-react';
import { Product, Category } from '../types';
import { productsApi, categoriesApi } from '../lib/api';
import { mapProduct, mapCategory } from '../lib/mappers';
import { ProductCard } from './ProductCard';
import { AnnouncementBar } from './AnnouncementBar';
// import { PanchangBar } from './PanchangBar';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';

interface CategoryPageProps {
  categorySlug?: string;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ categorySlug = 'all' }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [sortBy, setSortBy] = useState('best-selling');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedWeights, setSelectedWeights] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [availableWeights, setAvailableWeights] = useState<{ weight: string; count: number }[]>([]);
  const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({
    price: true,
    weight: true,
    sortBy: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      let selectedCategory: Category | null = null;

      if (categorySlug !== 'all') {
        const { data: categoryData, error } = await categoriesApi.getAll();
        if (error) {
          console.error('Unable to load categories', error);
        } else {
          const mappedCategories = (categoryData?.categories || []).map(mapCategory);
          selectedCategory =
            mappedCategories.find(
              (item) => item.slug === categorySlug || item.id === categorySlug
            ) || null;
          setCategory(selectedCategory);
        }
      } else {
        setCategory(null);
      }

      // Fetch all products without API sorting - we'll sort on frontend
      const { data, error } = await productsApi.getAll({
        category: selectedCategory?.id,
        limit: 200,
        sort: '-createdAt', // Default sort, frontend will handle actual sorting
      });

      if (error) {
        console.error('Failed to load products', error);
        setAllProducts([]);
        setProducts([]);
        return;
      }

      const mapped = (data?.products || []).map(mapProduct);
      setAllProducts(mapped);

      // Extract available weights
      const weightMap = new Map<string, number>();
      mapped.forEach((product) => {
        const weight = (product.attributes as any)?.weight || 
                      (product.attributes as any)?.specifications?.get?.('weight') ||
                      (product.attributes as any)?.specifications?.weight;
        if (weight) {
          weightMap.set(weight, (weightMap.get(weight) || 0) + 1);
        }
      });
      setAvailableWeights(
        Array.from(weightMap.entries())
          .map(([weight, count]) => ({ weight, count }))
          .sort((a, b) => a.weight.localeCompare(b.weight))
      );
    };

    fetchData();
  }, [categorySlug]);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...allProducts];

    // Price filter
    filtered = filtered.filter(
      (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Weight filter
    if (selectedWeights.length > 0) {
      filtered = filtered.filter((product) => {
        const weight = (product.attributes as any)?.weight || 
                      (product.attributes as any)?.specifications?.get?.('weight') ||
                      (product.attributes as any)?.specifications?.weight;
        return weight && selectedWeights.includes(weight);
      });
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'featured':
          // Sort by featured status (featured products first)
          const aFeatured = a.featured || a.is_featured || false;
          const bFeatured = b.featured || b.is_featured || false;
          return (bFeatured ? 1 : 0) - (aFeatured ? 1 : 0);
        case 'best-selling':
          // Sort by bestseller status (bestsellers first)
          const aBestseller = a.is_bestseller || a.isBestseller || false;
          const bBestseller = b.is_bestseller || b.isBestseller || false;
          return (bBestseller ? 1 : 0) - (aBestseller ? 1 : 0);
        case 'alphabetically-az':
          return a.name.localeCompare(b.name);
        case 'alphabetically-za':
          return b.name.localeCompare(a.name);
        case 'price-low-high':
          return a.price - b.price;
        case 'price-high-low':
          return b.price - a.price;
        case 'date-old-new':
          const aDate = new Date(a.createdAt || a.created_at || 0).getTime();
          const bDate = new Date(b.createdAt || b.created_at || 0).getTime();
          return aDate - bDate;
        case 'date-new-old':
          const aDateNew = new Date(a.createdAt || a.created_at || 0).getTime();
          const bDateNew = new Date(b.createdAt || b.created_at || 0).getTime();
          return bDateNew - aDateNew;
        default:
          return 0;
      }
    });

    setProducts(sorted);
  }, [allProducts, priceRange, selectedWeights, sortBy]);

  const handleWeightToggle = (weight: string) => {
    setSelectedWeights((prev) =>
      prev.includes(weight) ? prev.filter((w) => w !== weight) : [...prev, weight]
    );
  };

  const maxPrice = Math.max(...allProducts.map((p) => p.price), 10000);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AnnouncementBar />
      {/* <PanchangBar /> */}
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6 text-sm text-gray-600">
          <a href="#/" className="hover:text-[#FF8C00]">Home</a>
          {category && (
            <>
              <span className="mx-2">/</span>
              <span className="text-[#1A1A1A] font-semibold">{category.name}</span>
            </>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Sidebar */}
          <aside className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
                <h2 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                  <span className="text-red-600">◆</span>
                  Filters
                  <span className="text-red-600">◆</span>
                </h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-gray-500 hover:text-[#FF8C00]"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-0">
                {/* Price Filter */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => setExpandedFilters({ ...expandedFilters, price: !expandedFilters.price })}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <h3 className="font-semibold text-[#1A1A1A]">Price</h3>
                    {expandedFilters.price ? (
                      <Minus size={18} className="text-gray-600" />
                    ) : (
                      <Plus size={18} className="text-gray-600" />
                    )}
                  </button>
                  {expandedFilters.price && (
                    <div className="pb-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max={maxPrice}
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00] text-sm"
                          placeholder="₹ 0"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="number"
                          min={priceRange[0]}
                          max={maxPrice}
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || maxPrice])}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00] text-sm"
                          placeholder={`₹ ${maxPrice}`}
                        />
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={maxPrice}
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #FF8C00 0%, #FF8C00 ${(priceRange[1] / maxPrice) * 100}%, #e5e7eb ${(priceRange[1] / maxPrice) * 100}%, #e5e7eb 100%)`
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Weight Filter */}
                {availableWeights.length > 0 && (
                  <div className="border-b border-gray-200">
                    <button
                      onClick={() => setExpandedFilters({ ...expandedFilters, weight: !expandedFilters.weight })}
                      className="w-full flex items-center justify-between py-4 text-left"
                    >
                      <h3 className="font-semibold text-[#1A1A1A]">Weight</h3>
                      {expandedFilters.weight ? (
                        <Minus size={18} className="text-gray-600" />
                      ) : (
                        <Plus size={18} className="text-gray-600" />
                      )}
                    </button>
                    {expandedFilters.weight && (
                      <div className="pb-4 space-y-2">
                      {availableWeights.map(({ weight, count }) => (
                        <label
                          key={weight}
                          className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedWeights.includes(weight)}
                              onChange={() => handleWeightToggle(weight)}
                              className="w-4 h-4 text-[#FF8C00] border-gray-300 rounded focus:ring-[#FF8C00]"
                            />
                            <span className="text-sm text-[#1A1A1A]">{weight}</span>
                          </div>
                          <span className="text-xs text-gray-500">({count})</span>
                        </label>
                      ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Sort By */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => setExpandedFilters({ ...expandedFilters, sortBy: !expandedFilters.sortBy })}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <h3 className="font-semibold text-[#1A1A1A]">Sort by</h3>
                    {expandedFilters.sortBy ? (
                      <Minus size={18} className="text-gray-600" />
                    ) : (
                      <Plus size={18} className="text-gray-600" />
                    )}
                  </button>
                  {expandedFilters.sortBy && (
                    <div className="pb-4 space-y-2">
                    {[
                      { value: 'featured', label: 'Featured' },
                      { value: 'best-selling', label: 'Best selling' },
                      { value: 'alphabetically-az', label: 'Alphabetically, A-Z' },
                      { value: 'alphabetically-za', label: 'Alphabetically, Z-A' },
                      { value: 'price-low-high', label: 'Price, low to high' },
                      { value: 'price-high-low', label: 'Price, high to low' },
                      { value: 'date-old-new', label: 'Date, old to new' },
                      { value: 'date-new-old', label: 'Date, new to old' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="radio"
                          name="sort"
                          value={option.value}
                          checked={sortBy === option.value}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-4 h-4 text-[#FF8C00] border-gray-300 focus:ring-[#FF8C00]"
                        />
                        <span className="text-sm text-[#1A1A1A]">{option.label}</span>
                      </label>
                    ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing {products.length} product{products.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 text-[#FF8C00] font-semibold"
              >
                <Filter size={20} />
                Filters
              </button>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};
