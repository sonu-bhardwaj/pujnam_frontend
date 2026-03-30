import React from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { placeholders } from '../lib/placeholders';
import { normalizeWeight } from '../lib/weight';

export const CartDrawer: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, isCartOpen, setIsCartOpen } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 animate-fade-in"
        onClick={() => setIsCartOpen(false)}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl animate-slide-in-right flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-[#FF8C00]" size={24} />
            <h2 className="text-2xl font-bold text-[#1A1A1A]">Your Cart</h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="text-gray-500 hover:text-[#FF8C00] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={64} className="text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">Your cart is empty</p>
              <p className="text-gray-400 text-sm mt-2">Add some divine products to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => {
                const displayWeight = normalizeWeight(item.product?.attributes?.weight);
                return (
                  <div
                    key={item.product.id}
                    className="flex gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <img
                      src={item.product.image_url || item.product.images?.[0] || placeholders.small}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#1A1A1A] mb-1">{item.product.name}</h3>
                      {displayWeight && (
                        <p className="text-xs text-gray-500 mb-1">Weight: {displayWeight}</p>
                      )}
                      <p className="text-[#FF8C00] font-bold">₹{item.product.price}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-[#FF8C00] hover:text-white hover:border-[#FF8C00] transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-[#FF8C00] hover:text-white hover:border-[#FF8C00] transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t p-6 space-y-4">
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold text-[#1A1A1A]">Subtotal:</span>
              <span className="font-bold text-[#FF8C00] text-xl">₹{cartTotal.toFixed(2)}</span>
            </div>
            <button
              onClick={() => {
                setIsCartOpen(false);
                window.location.hash = '/checkout';
              }}
              className="btn-primary w-full"
            >
              Proceed to Checkout
            </button>
            <button
              onClick={() => setIsCartOpen(false)}
              className="btn-secondary w-full"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
};
