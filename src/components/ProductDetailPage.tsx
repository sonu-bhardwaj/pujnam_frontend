import React, { useEffect, useState } from 'react';
import { Star, ShoppingCart, Award, Leaf, Shield, Plus, Minus, Share2, Zap } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';
import { AnnouncementBar } from './AnnouncementBar';
// import { PanchangBar } from './PanchangBar';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { productsApi } from '../lib/api';
import { mapProduct } from '../lib/mappers';
import { placeholders } from '../lib/placeholders';
import { normalizeWeight } from '../lib/weight';

interface ProductDetailPageProps {
  productSlug: string;
}

interface AccordionSection {
  title: string;
  content: string;
  isOpen: boolean;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productSlug }) => {
  const { showSuccess } = useNotification();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [quantity, setQuantity] = useState(1);
  const [accordionSections, setAccordionSections] = useState<AccordionSection[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await productsApi.getById(productSlug);
      if (error) {
        console.error('Unable to fetch product', error);
        setProduct(null);
        return;
      }

      const mapped = mapProduct(data?.product || data);
      setProduct(mapped);

      const variants = mapped.attributes && (mapped.attributes as any).variants;
      if (variants?.length > 0) {
        setSelectedVariant(variants[0]);
      }

      // Setup accordion sections
      const specs = mapped.attributes || {};
      const sections: AccordionSection[] = [
        {
          title: 'Description',
          content: mapped.description || 'No description available.',
          isOpen: true,
        },
        {
          title: 'Product Features',
          content: (specs as any).features || 
                  (specs as any).productFeatures ||
                  'Premium quality product with authentic ingredients.',
          isOpen: false,
        },
        {
          title: 'Ideal For',
          content: (specs as any).idealFor || 
                  (specs as any).ideal_for ||
                  'Daily puja rituals, festivals, and special occasions.',
          isOpen: false,
        },
        {
          title: 'Best uses',
          content: (specs as any).bestUses || 
                  (specs as any).best_uses ||
                  'Perfect for home puja, temple offerings, and spiritual practices.',
          isOpen: false,
        },
        {
          title: 'Spiritual Significance',
          content: (specs as any).spiritualSignificance || 
                  (specs as any).spiritual_significance ||
                  'Holds deep spiritual meaning in traditional rituals.',
          isOpen: false,
        },
        {
          title: 'How to Use?',
          content: (specs as any).howToUse || 
                  (specs as any).how_to_use ||
                  'Follow traditional puja rituals as per your family traditions.',
          isOpen: false,
        },
        {
          title: "Why You'll Love It?",
          content: (specs as any).whyYoullLoveIt || 
                  (specs as any).why_youll_love_it ||
                  'Authentic, pure, and made with devotion for your spiritual journey.',
          isOpen: false,
        },
        {
          title: "What Makes Us Special?",
          content: (specs as any).whatMakesUsSpecial || 
                  (specs as any).what_makes_us_special ||
                  'We source only the finest ingredients and follow traditional methods.',
          isOpen: false,
        },
        {
          title: "Pujnam Store's Promise",
          content: (specs as any).promise || 
                  (specs as any).storePromise ||
                  '100% authentic, pure, and blessed products for your spiritual needs.',
          isOpen: false,
        },
      ];
      setAccordionSections(sections);
    };

    fetchProduct();
  }, [productSlug]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const toggleAccordion = (index: number) => {
    setAccordionSections((prev) =>
      prev.map((section, i) => ({
        ...section,
        isOpen: i === index ? !section.isOpen : false,
      }))
    );
  };

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.hash = '/checkout';
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: url,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      showSuccess('Link copied to clipboard!');
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const images = [product.image_url, ...(product.images || [])].filter(Boolean) as string[];
  const mainImage = images[selectedImage] || images[0] || placeholders.xlarge;
  const comparePrice = product.compare_at_price ?? product.originalPrice ?? null;
  const discountPercent = comparePrice
    ? Math.round(((comparePrice - product.price) / comparePrice) * 100)
    : 0;

  const currentPrice = selectedVariant?.price || product.price;
  const currentComparePrice = selectedVariant?.compare_price || comparePrice;
  const unitWeight = normalizeWeight((product.attributes as any)?.weight || '');

  const stockAvailable = (product.stock_quantity ?? product.stock ?? 0) > 0;

  const qualityBadges = [
    { icon: Award, text: 'Ethically Sourced' },
    { icon: Leaf, text: '100% Natural' },
    { icon: Shield, text: 'No Chemicals & Preservatives' },
    { icon: Award, text: 'Superfood' }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AnnouncementBar />
      {/* <PanchangBar /> */}
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6 text-sm text-gray-600">
          <a href="#/" className="hover:text-[#FF8C00]">Home</a>
          {product.category && (
            <>
              <span className="mx-2">/</span>
              <a href={`#/category/${typeof product.category === 'object' ? product.category.slug : ''}`} className="hover:text-[#FF8C00]">
                {typeof product.category === 'object' ? product.category.name : 'Category'}
              </a>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-[#1A1A1A] font-semibold">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div>
            <div
              className="relative mb-4 rounded-lg overflow-hidden bg-gray-50 cursor-zoom-in"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
              style={{ paddingBottom: '100%' }}
            >
              <div className="absolute inset-0">
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-200"
                  style={
                    isZoomed
                      ? {
                          transform: 'scale(2)',
                          transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                        }
                      : {}
                  }
                />
              </div>
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 bg-[#FF8C00] text-white px-4 py-2 rounded-full text-sm font-bold z-10 shadow-lg">
                  {discountPercent}% OFF
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-[#FF8C00]' : 'border-gray-200'
                    }`}
                  >
                    <img src={image} alt="" className="w-full h-20 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-4xl font-bold text-[#1A1A1A] mb-4">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={18} className="fill-[#FF8C00] text-[#FF8C00]" />
                ))}
              </div>
              <span className="text-[#FF8C00] font-semibold">4.8</span>
              <span className="text-gray-500">(23 Reviews)</span>
            </div>

            {/* Pricing */}
            <div className="flex items-center gap-4 mb-6">
              {currentComparePrice && (
                <>
                  <span className="text-4xl font-bold text-[#1A1A1A]">₹{currentPrice}</span>
                  <span className="text-xl text-gray-400 line-through">
                    ₹{currentComparePrice}
                  </span>
                </>
              )}
              {!currentComparePrice && (
                <span className="text-4xl font-bold text-[#1A1A1A]">₹{currentPrice}</span>
              )}
            </div>
            {unitWeight && (
              <p className="mb-6 text-sm text-gray-600">
                You get per unit: <span className="font-semibold text-[#1A1A1A]">{unitWeight}</span>
              </p>
            )}

            {/* Sales Indicator */}
            <div className="mb-6 flex items-center gap-2 text-orange-600">
              <Zap size={20} className="fill-orange-600" />
              <span className="font-semibold">39 sold in the last 24 hours!</span>
            </div>

            {/* Variants */}
            {product.attributes?.variants && product.attributes.variants.length > 0 && (
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4">
                  {product.attributes.variants.map((variant: any, index: number) => (
                    <div
                      key={index}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedVariant === variant
                          ? 'border-[#FF8C00] bg-orange-50'
                          : 'border-gray-200 hover:border-[#FF8C00]'
                      }`}
                      onClick={() => setSelectedVariant(variant)}
                    >
                      <div className="text-center">
                        <div className="font-bold text-[#1A1A1A] mb-2">{variant.size}</div>
                        <div className="text-2xl font-bold text-[#1A1A1A]">₹{variant.price}</div>
                        {variant.compare_price && (
                          <div className="text-sm text-gray-400 line-through">
                            ₹{variant.compare_price}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-50 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus size={20} className={quantity <= 1 ? 'text-gray-300' : 'text-[#1A1A1A]'} />
                  </button>
                  <span className="px-6 py-3 text-lg font-semibold text-[#1A1A1A] min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-50 transition-colors"
                    disabled={!stockAvailable || quantity >= (product.stock_quantity ?? product.stock ?? 999)}
                  >
                    <Plus size={20} className={!stockAvailable ? 'text-gray-300' : 'text-[#1A1A1A]'} />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={!stockAvailable}
                className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={24} />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!stockAvailable}
                className="w-full py-4 text-lg bg-[#1A1A1A] text-white rounded-lg font-semibold hover:bg-[#2A2A2A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                Buy It Now
              </button>
              <p className="text-sm text-center text-gray-600">5% off on prepaid orders</p>
            </div>

            {/* Benefits */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  Free shipping on orders over ₹499
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  5% off on prepaid orders
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  5% off on orders over ₹1499
                </li>
              </ul>
            </div>

            {/* Share */}
            <div className="mb-6">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 text-[#FF8C00] hover:text-[#FF6B00] transition-colors"
              >
                <Share2 size={20} />
                <span className="font-semibold">Share</span>
              </button>
            </div>

            {/* Quality Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-gray-200">
              {qualityBadges.map((badge, index) => {
                const Icon = badge.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-2">
                      <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                        <Icon className="text-[#FF8C00]" size={24} />
                      </div>
                    </div>
                    <p className="text-xs text-gray-700 font-medium leading-tight">
                      {badge.text}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Stock Alert */}
            {stockAvailable && product.stock_quantity !== undefined && product.low_stock_threshold !== undefined && product.stock_quantity <= product.low_stock_threshold && (
              <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-800 font-semibold">
                  Only {product.stock_quantity} left in stock!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Accordion Sections */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[#1A1A1A] mb-8">Product Details</h2>
          <div className="space-y-4">
            {accordionSections.map((section, index) => (
              <div key={index} className="border-b border-gray-200">
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between py-4 text-left hover:text-[#FF8C00] transition-colors"
                >
                  <h3 className="text-xl font-semibold text-[#1A1A1A]">{section.title}</h3>
                  {section.isOpen ? (
                    <Minus size={24} className="text-[#FF8C00]" />
                  ) : (
                    <Plus size={24} className="text-gray-400" />
                  )}
                </button>
                {section.isOpen && (
                  <div className="pb-6 text-gray-700 leading-relaxed">
                    {section.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};
