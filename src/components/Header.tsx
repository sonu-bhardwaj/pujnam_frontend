import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, ChevronDown, Package, LogOut, Menu, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useSettings } from '../contexts/SettingsContext';
import { SearchModal } from './SearchModal';
import { authApi, categoriesApi, productsApi } from '../lib/api';
import { mapCategory, mapProduct } from '../lib/mappers';
import { Category, Product } from '../types';

const aboutUsLinks = [
  { name: 'Our Story', url: '#/about', hash: 'our-story' },
  // { name: 'Management Team', url: '#/about', hash: 'management-team' },
  // { name: 'Our Presence', url: '#/about', hash: 'our-presence' },
  { name: 'Events & Media', url: '#/about', hash: 'events' },
  { name: 'Contact Us', url: '#/contact' }
];

interface CategoryWithProducts extends Category {
  products?: Product[];
}

export const Header: React.FC = () => {
  const { cartCount, setIsCartOpen } = useCart();
  const { settings } = useSettings();
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [categoriesWithProducts, setCategoriesWithProducts] = useState<CategoryWithProducts[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [shopDropdownTimeout, setShopDropdownTimeout] = useState<NodeJS.Timeout | null>(null);
  const [aboutDropdownTimeout, setAboutDropdownTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkAuth();
    fetchCategoriesWithProducts();
    
    // Close user menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };
    
    if (isUserMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isUserMenuOpen]);

  // Lock body scroll and close on Escape when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsMobileMenuOpen(false);
      };
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
      };
    } else {
      document.body.style.overflow = '';
      return undefined;
    }
  }, [isMobileMenuOpen]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (shopDropdownTimeout) {
        clearTimeout(shopDropdownTimeout);
      }
      if (aboutDropdownTimeout) {
        clearTimeout(aboutDropdownTimeout);
      }
    };
  }, [shopDropdownTimeout, aboutDropdownTimeout]);

  const fetchCategoriesWithProducts = async () => {
    try {
      setLoadingCategories(true);
      
      // Get all categories
      const { data: categoriesData, error: categoriesError } = await categoriesApi.getAll();
      if (categoriesError) {
        console.error('Failed to load categories:', categoriesError);
        setLoadingCategories(false);
        return;
      }

      const categories = (categoriesData?.categories || []).map(mapCategory);
      
      // Get main categories (no parent)
      const mainCategories = categories.filter(cat => !cat.parent_id && cat.isActive !== false);
      
      // For each main category, get products
      const categoriesWithProductsData = await Promise.all(
        mainCategories.map(async (category) => {
          try {
            const { data: productsData, error: productsError } = await productsApi.getAll({
              category: category.id,
              limit: 10,
            });
            
            if (productsError) {
              console.error(`Failed to load products for ${category.name}:`, productsError);
              return { ...category, products: [] };
            }
            
            const products = (productsData?.products || []).map(mapProduct);
            return { ...category, products };
          } catch (err) {
            console.error(`Error loading products for ${category.name}:`, err);
            return { ...category, products: [] };
          }
        })
      );
      
      setCategoriesWithProducts(categoriesWithProductsData);
    } catch (error) {
      console.error('Error fetching categories with products:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const checkAuth = async () => {
    try {
      const { data, error } = await authApi.getProfile();
      if (!error && data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    }
  };

  const handleLogout = async () => {
    await authApi.logout();
    setUser(null);
    setIsUserMenuOpen(false);
    window.location.hash = '/';
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <a href="#/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
              <img
                src={settings?.logo}
                alt={settings?.storeName || 'Pujnam Store'}
                className="w-[5rem] h-[5rem] rounded-full object-cover"
                // onError={(e) => {
                //   (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/8989571/pexels-photo-8989571.jpeg';
                // }}
              />
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-[#1A1A1A] font-serif">{settings?.storeName?.toUpperCase() || 'PUJNAM STORE'}</h1>
                <p className="text-xs text-gray-600">{settings?.tagline || 'AAPKI AASTHA KA SAARTHI'}</p>
              </div>
            </a>

            <nav className="hidden lg:flex items-center gap-8">
              <div
                className="relative shop-dropdown-container"
                onMouseEnter={() => {
                  if (shopDropdownTimeout) {
                    clearTimeout(shopDropdownTimeout);
                    setShopDropdownTimeout(null);
                  }
                  setIsShopOpen(true);
                }}
                onMouseLeave={() => {
                  const timeout = setTimeout(() => {
                    setIsShopOpen(false);
                  }, 200); // Small delay before closing
                  setShopDropdownTimeout(timeout);
                }}
              >
                <button className={`flex items-center gap-1 font-medium transition-colors ${
                  isShopOpen ? 'text-[#FF8C00]' : 'text-[#1A1A1A] hover:text-[#FF8C00]'
                }`}>
                  Pooja Products
                  <ChevronDown size={16} className={`transition-transform duration-200 ${isShopOpen ? 'rotate-180' : ''}`} />
                </button>

                {isShopOpen && (
                  <div 
                    className="absolute top-full left-0 mt-2 bg-white shadow-2xl rounded-lg p-8 w-[900px] animate-fade-in z-50 border border-gray-100"
                    onMouseEnter={() => {
                      if (shopDropdownTimeout) {
                        clearTimeout(shopDropdownTimeout);
                        setShopDropdownTimeout(null);
                      }
                      setIsShopOpen(true);
                    }}
                    onMouseLeave={() => {
                      const timeout = setTimeout(() => {
                        setIsShopOpen(false);
                      }, 200);
                      setShopDropdownTimeout(timeout);
                    }}
                  >
                    {loadingCategories ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Loading categories...</p>
                      </div>
                    ) : categoriesWithProducts.length > 0 ? (
                      <div className="grid grid-cols-5 gap-8">
                        {categoriesWithProducts.map((category) => (
                          <div key={category.id}>
                            <a
                              href={`#/category/${category.slug || category.id}`}
                              className="font-bold text-[#1A1A1A] mb-3 text-sm block hover:text-[#FF8C00] transition-colors uppercase"
                              onClick={() => setIsShopOpen(false)}
                            >
                              {category.name}
                            </a>
                            <ul className="space-y-2">
                              {category.products && category.products.length > 0 ? (
                                <>
                                  {category.products.map((product) => (
                                    <li key={product.id}>
                                      <a
                                        href={`#/product/${product.slug || product.id}`}
                                        className="text-sm text-gray-700 hover:text-[#FF8C00] transition-colors block py-1"
                                        onClick={() => setIsShopOpen(false)}
                                      >
                                        {product.name}
                                      </a>
                                    </li>
                                  ))}
                                </>
                              ) : (
                                <li className="text-sm text-gray-400 italic">No products yet</li>
                              )}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No categories available</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div
                className="relative about-dropdown-container"
                onMouseEnter={() => {
                  if (aboutDropdownTimeout) {
                    clearTimeout(aboutDropdownTimeout);
                    setAboutDropdownTimeout(null);
                  }
                  setIsAboutOpen(true);
                }}
                onMouseLeave={() => {
                  const timeout = setTimeout(() => {
                    setIsAboutOpen(false);
                  }, 200); // Small delay before closing
                  setAboutDropdownTimeout(timeout);
                }}
              >
                <button className={`flex items-center gap-1 font-medium transition-colors ${
                  isAboutOpen ? 'text-[#FF8C00]' : 'text-[#1A1A1A] hover:text-[#FF8C00]'
                }`}>
                  About Us
                  <ChevronDown size={16} className={`transition-transform duration-200 ${isAboutOpen ? 'rotate-180' : ''}`} />
                </button>

                {isAboutOpen && (
                  <div 
                    className="absolute top-full left-0 mt-2 bg-white shadow-2xl rounded-lg p-6 w-64 animate-fade-in z-50 border border-gray-100"
                    onMouseEnter={() => {
                      if (aboutDropdownTimeout) {
                        clearTimeout(aboutDropdownTimeout);
                        setAboutDropdownTimeout(null);
                      }
                      setIsAboutOpen(true);
                    }}
                    onMouseLeave={() => {
                      const timeout = setTimeout(() => {
                        setIsAboutOpen(false);
                      }, 200);
                      setAboutDropdownTimeout(timeout);
                    }}
                  >
                    <ul className="space-y-3">
                      {aboutUsLinks.map((link) => (
                        <li key={link.name}>
                          <a
                            href={link.hash ? `${link.url}#${link.hash}` : link.url}
                            className="text-[#1A1A1A] hover:text-[#FF8C00] transition-colors block font-serif text-lg py-1"
                            onClick={() => {
                              setIsAboutOpen(false);
                              // Let the default navigation happen, then scroll
                              if (link.hash) {
                                setTimeout(() => {
                                  const element = document.getElementById(link.hash!);
                                  if (element) {
                                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  }
                                }, 500);
                              }
                            }}
                          >
                            {link.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <a href="#/bestsellers" className="text-[#1A1A1A] font-medium hover:text-[#FF8C00] transition-colors">
                Best Seller
              </a>

              <a href="#/astro-puja-booking" className="text-[#1A1A1A] font-medium hover:text-[#FF8C00] transition-colors">
                Astro Puja Booking
              </a>

              <a href="#/contact" className="text-[#1A1A1A] font-medium hover:text-[#FF8C00] transition-colors">
                Contact Us
              </a>
            </nav>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="text-[#1A1A1A] hover:text-[#FF8C00] transition-colors"
              >
                <Search size={20} />
              </button>

              <div className="relative user-menu-container">
                {user ? (
                  <>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 text-[#1A1A1A] hover:text-[#FF8C00] transition-colors"
                    >
                      <User size={20} />
                      <span className="hidden md:inline text-sm">{user.name || user.email}</span>
                      <ChevronDown size={16} />
                    </button>
                    {isUserMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 bg-white shadow-2xl rounded-lg p-4 w-48 animate-fade-in z-50 border border-gray-200">
                        <div className="border-b border-gray-200 pb-3 mb-3">
                          <p className="font-semibold text-[#1A1A1A]">{user.name || 'User'}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <a
                          href="#/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 text-[#1A1A1A] hover:text-[#FF8C00] transition-colors py-2"
                        >
                          <User size={18} />
                          My Profile
                        </a>
                        <a
                          href="#/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 text-[#1A1A1A] hover:text-[#FF8C00] transition-colors py-2"
                        >
                          <Package size={18} />
                          My Orders
                        </a>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors py-2 mt-2"
                        >
                          <LogOut size={18} />
                          Logout
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <a href="#/login" className="text-[#1A1A1A] hover:text-[#FF8C00] transition-colors">
                    <User size={20} />
                  </a>
                )}
              </div>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative text-[#1A1A1A] hover:text-[#FF8C00] transition-colors"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#FF8C00] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-[#1A1A1A] hover:text-[#FF8C00] transition-colors rounded-md hover:bg-gray-100"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu: backdrop + right-side drawer (only on small screens) */}
      <div className="lg:hidden">
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-[60] animate-fade-in"
            aria-hidden="true"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        <div
          className={`fixed top-0 right-0 h-full w-[min(320px,85vw)] max-w-full bg-white shadow-2xl z-[70] flex flex-col transition-transform duration-300 ease-out lg:hidden ${
            isMobileMenuOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
          }`}
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-[#1A1A1A] font-serif">Menu</h2>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-[#1A1A1A] hover:text-[#FF8C00] hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="border-t border-gray-100 mt-2 pt-4 px-4">
              <p className="px-3 py-2 text-sm font-bold text-[#1A1A1A] uppercase tracking-wider">SHOP PRODUCT BY CATEGORY</p>
              {loadingCategories ? (
                <p className="px-3 py-2 text-sm text-gray-400">Loading...</p>
              ) : (
                <ul className="space-y-0">
                  {categoriesWithProducts.map((category) => (
                    <li key={category.id}>
                      <a
                        href={`#/category/${category.slug || category.id}`}
                        className="py-3 px-3 block font-medium text-[#1A1A1A] hover:text-[#FF8C00] hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {category.name}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="border-t border-gray-100 mt-2 pt-4 px-4">
              <a
                href="#/astro-puja-booking"
                className="py-3 px-3 block font-bold uppercase text-[#1A1A1A] hover:text-[#FF8C00] hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ASTRO PUJA BOOKING
              </a>
              <a
                href="#/bestsellers"
                className="py-3 px-3 block font-bold uppercase text-[#1A1A1A] hover:text-[#FF8C00] hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                BEST SELLER
              </a>
            </div>
            <div className="border-t border-gray-100 mt-2 pt-4 px-4 pb-6">
              <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">About Us</p>
              <ul className="space-y-0">
                {aboutUsLinks.filter((link) => link.name === 'Our Story' || link.name === 'Events & Media' || link.name === 'Contact Us').map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.hash ? `${link.url}#${link.hash}` : link.url}
                      className="py-3 px-3 block font-medium text-[#1A1A1A] hover:text-[#FF8C00] hover:bg-gray-50 rounded-md transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
