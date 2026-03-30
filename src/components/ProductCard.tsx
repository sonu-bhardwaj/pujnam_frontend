import React, { useState } from 'react';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { placeholders } from '../lib/placeholders';
import { normalizeWeight } from '../lib/weight';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  const comparePrice = product.compare_at_price ?? product.originalPrice ?? null;
  const discountPercent = comparePrice
    ? Math.round(((comparePrice - product.price) / comparePrice) * 100)
    : 0;
  const stockAvailable = (product.stock_quantity ?? product.stock ?? 0) > 0;
  const unitWeight = normalizeWeight((product.attributes as any)?.weight || '');

  const image = product.image_url || product.images?.[0] || placeholders.product;
  const productLink = `#/product/${product.slug || product.id}`;

  return (
    <div
      className="bg-white rounded-xl overflow-hidden card-hover relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {discountPercent > 0 && (
        <>
          <div className="absolute top-4 left-4 bg-[#FF8C00] text-white px-3 py-1.5 rounded-full text-xs font-bold z-10 shadow-lg">
            SALE
          </div>
          <div className="absolute top-4 right-4 bg-[#FF8C00] text-white px-3 py-1.5 rounded-full text-xs font-bold z-10 shadow-lg">
            {discountPercent}% OFF
          </div>
        </>
      )}

      {product.is_bestseller && !discountPercent && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10 shadow-lg">
          BESTSELLER
        </div>
      )}

      {!stockAvailable && (
        <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold z-10 shadow-lg">
          OUT OF STOCK
        </div>
      )}

      <div className="relative overflow-hidden group">
        <a href={productLink}>
          <img
            src={image}
            alt={product.name}
            className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </a>

        <div
          className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-3 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button
            onClick={() => addToCart(product)}
            disabled={!stockAvailable}
            className={`p-3 rounded-full transition-all shadow-lg ${
              stockAvailable
                ? 'bg-white text-[#FF8C00] hover:bg-[#FF8C00] hover:text-white hover:scale-110'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ShoppingCart size={20} />
          </button>
          <button className="bg-white text-[#FF8C00] p-3 rounded-full hover:bg-[#FF8C00] hover:text-white transition-all hover:scale-110 shadow-lg">
            <Heart size={20} />
          </button>
          <a
            href={productLink}
            className="bg-white text-[#FF8C00] p-3 rounded-full hover:bg-[#FF8C00] hover:text-white transition-all hover:scale-110 shadow-lg"
          >
            <Eye size={20} />
          </a>
        </div>
      </div>

      <div className="p-4">
        {product.deity && (
          <p className="text-xs text-[#FF8C00] font-semibold mb-1">{product.deity}</p>
        )}
        <a href={productLink}>
          <h3 className="font-semibold text-[#1A1A1A] mb-2 line-clamp-2 h-12 hover:text-[#FF8C00] transition-colors">
            {product.name}
          </h3>
        </a>
        {product.short_description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.short_description}</p>
        )}
        {unitWeight && (
          <p className="text-xs text-gray-500 mb-2">Per unit: {unitWeight}</p>
        )}

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl font-bold text-[#1A1A1A]">₹{product.price}</span>
          {comparePrice && (
            <span className="text-sm text-gray-400 line-through">
              ₹{comparePrice}
            </span>
          )}
        </div>

        <button
          onClick={() => addToCart(product)}
          disabled={!stockAvailable}
          className={`w-full ${stockAvailable ? 'btn-primary' : 'bg-gray-300 text-gray-600 px-6 py-3 rounded-lg font-semibold cursor-not-allowed'}`}
        >
          {stockAvailable ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};
