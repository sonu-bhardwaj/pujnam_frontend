import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, Wallet, MapPin, CheckCircle, Tag, X, ChevronDown, ChevronUp, Plus, Home, Briefcase, Map, Edit } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useSettings } from '../contexts/SettingsContext';
import { useNotification } from '../contexts/NotificationContext';
import { ordersApi, paymentsApi, authApi, couponsApi } from '../lib/api';
import { load } from '@cashfreepayments/cashfree-js';
import { placeholders } from '../lib/placeholders';
import { AnnouncementBar } from './AnnouncementBar';
// import { PanchangBar } from './PanchangBar';
import { Header } from './Header';
import { Footer } from './Footer';

export const CheckoutPage: React.FC = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { settings } = useSettings();
  const { showSuccess, showError } = useNotification();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [cashfree, setCashfree] = useState<any>(null);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    const initializeCashfree = async () => {
      try {
        const cf = await load({ mode: 'sandbox' });
        setCashfree(cf);
      } catch (error) {
        console.error('Cashfree SDK load failed:', error);
      }
    };
    initializeCashfree();
  }, []);

  const checkAuthentication = async () => {
    try {
      const { data, error } = await authApi.getProfile();
      if (error || !data?.user) {
        // Not authenticated, redirect to login
        const returnUrl = encodeURIComponent(window.location.hash);
        window.location.hash = `/login?return=${returnUrl}`;
        return;
      }
      setIsAuthenticated(true);
      
      // Fetch saved addresses
      const { data: addressesData, error: addressesError } = await authApi.getAddresses();
      if (!addressesError && addressesData?.addresses) {
        setSavedAddresses(addressesData.addresses);
        // Set default address if available
        const defaultAddress = addressesData.addresses.find((addr: any) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress._id || defaultAddress.id);
          setFormData({
            name: defaultAddress.name || data.user?.name || '',
            email: defaultAddress.email || data.user?.email || '',
            phone: defaultAddress.phone || data.user?.phone || '',
            addressLine1: defaultAddress.addressLine1 || '',
            addressLine2: defaultAddress.addressLine2 || '',
            landmark: defaultAddress.landmark || '',
            city: defaultAddress.city || '',
            state: defaultAddress.state || '',
            pincode: defaultAddress.pincode || '',
            country: defaultAddress.country || 'India',
            addressType: defaultAddress.addressType || 'home',
          });
        } else if (data.user) {
          // Pre-fill with user data if no saved addresses
          setFormData(prev => ({
            ...prev,
            name: data.user.name || prev.name,
            email: data.user.email || prev.email,
            phone: data.user.phone || prev.phone,
          }));
        }
      } else if (data.user) {
        // Pre-fill with user data if no saved addresses
        setFormData(prev => ({
          ...prev,
          name: data.user.name || prev.name,
          email: data.user.email || prev.email,
          phone: data.user.phone || prev.phone,
        }));
      }
    } catch (err) {
      const returnUrl = encodeURIComponent(window.location.hash);
      window.location.hash = `/login?return=${returnUrl}`;
    } finally {
      setIsCheckingAuth(false);
    }
  };
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('upi');
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    addressType: 'home' as 'home' | 'work' | 'other',
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [activeCoupons, setActiveCoupons] = useState<any[]>([]);
  const [showCoupons, setShowCoupons] = useState(false);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  useEffect(() => {
    fetchActiveCoupons();
  }, []);

  const fetchActiveCoupons = async () => {
    const { data, error } = await couponsApi.getActive();
    if (!error && data?.coupons) {
      setActiveCoupons(data.coupons);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError('');

    const { data, error } = await couponsApi.validate(couponCode.trim());
    if (error || !data?.coupon) {
      setCouponError(error || 'Invalid or expired coupon');
      setIsValidatingCoupon(false);
      return;
    }

    const coupon = data.coupon;
    const minOrderValue = coupon.min_order_value || 0;
    
    if (cartTotal < minOrderValue) {
      setCouponError(`Minimum order value of ₹${minOrderValue} required`);
      setIsValidatingCoupon(false);
      return;
    }

    setAppliedCoupon(coupon);
    setCouponCode('');
    setIsValidatingCoupon(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const freeShippingThreshold = settings?.freeShippingThreshold || 499;
  const shippingCost = cartTotal >= freeShippingThreshold ? 0 : (settings?.shippingCost || 50);
  const taxRate = settings?.taxRate || 18;
  
  // Calculate coupon discount
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percentage') {
      couponDiscount = (cartTotal * appliedCoupon.discount_value) / 100;
      if (appliedCoupon.max_discount && couponDiscount > appliedCoupon.max_discount) {
        couponDiscount = appliedCoupon.max_discount;
      }
    } else {
      couponDiscount = appliedCoupon.discount_value;
    }
  }

  const subtotalAfterDiscount = Math.max(0, cartTotal - couponDiscount);
  const tax = Math.round(subtotalAfterDiscount * (taxRate / 100));
  const total = subtotalAfterDiscount + shippingCost + tax;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setOrderError('');
    setPaymentMessage('');

    try {
      // Prepare order items from cart
      const items = cartItems.map(item => {
        const productId = item.product._id || item.product.id;
        if (!productId) {
          throw new Error(`Product ID missing for ${item.product.name}`);
        }
        return {
          productId: productId,
          product: {
            id: productId,
            _id: productId,
            name: item.product.name,
            price: item.product.price
          },
          quantity: item.quantity
        };
      });

      // Validate address
      if (!formData.name || !formData.phone || !formData.addressLine1 || !formData.city || !formData.state || !formData.pincode) {
        setOrderError('Please fill all required address fields');
        setIsSubmitting(false);
        return;
      }

      // Prepare shipping address
      const shippingAddress = {
        name: formData.name,
        address: formData.addressLine1,
        addressLine2: formData.addressLine2,
        landmark: formData.landmark,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: formData.country,
        phone: formData.phone,
        email: formData.email
      };

      // Map payment method
      const paymentMethodMap: Record<string, string> = {
        'upi': 'upi',
        'card': 'online',
        'cod': 'cod'
      };

      const selectedPaymentMethod = paymentMethodMap[paymentMethod] || 'cod';

      const { data, error } = await ordersApi.create({
        items,
        shippingAddress,
        paymentMethod: selectedPaymentMethod,
        notes: `Order placed via ${paymentMethod}`,
        couponCode: appliedCoupon?.code || null,
        couponDiscount: couponDiscount || 0
      });

      if (error) {
        setOrderError(error);
        setIsSubmitting(false);
        return;
      }

      if (!data?.order) {
        setOrderError('Order creation failed');
        setIsSubmitting(false);
        return;
      }

      const createdOrder = data.order;

      if (selectedPaymentMethod === 'cod') {
        setOrderSuccess(true);
        showSuccess('Order placed successfully! Cash on delivery selected.');
        clearCart();
        setTimeout(() => { window.location.hash = '/orders'; }, 1500);
      } else {
        setIsPaymentLoading(true);

        const { data: paymentData, error: paymentError } = await paymentsApi.create({
          orderId: createdOrder._id,
          amount: total,
          currency: 'INR',
          customer: {
            id: createdOrder.user || createdOrder.shippingAddress?.email,
            email: formData.email,
            phone: formData.phone
          }
        });

        if (paymentError || !paymentData?.payment_session_id) {
          throw new Error(paymentError || 'Unable to initialize payment gateway');
        }

        if (!cashfree) {
          throw new Error('Payment SDK not loaded');
        }

        try {
          const returnUrl = `${window.location.origin}${window.location.pathname}#/orders?verifyPayment=1&orderId=${createdOrder._id}`;

          await cashfree.checkout({
            paymentSessionId: paymentData.payment_session_id,
            redirectTarget: '_self',
            returnUrl
          });
        } catch (checkoutError) {
          console.error('Cashfree checkout error', checkoutError);
          setOrderError('Payment was cancelled or could not be started. Your cart is still saved.');
          await paymentsApi.confirm({
            orderId: createdOrder._id,
            paymentId: paymentData.orderId || createdOrder._id,
            paymentStatus: 'cancelled'
          });
        } finally {
          setIsPaymentLoading(false);
        }
      }
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : 'Failed to place order');
      setIsSubmitting(false);
      setIsPaymentLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <AnnouncementBar />
        {/* <PanchangBar /> */}
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-gray-500">Checking authentication...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <AnnouncementBar />
        {/* <PanchangBar /> */}
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-4">Your cart is empty</h1>
            <a href="/" className="btn-primary inline-block">
              Continue Shopping
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AnnouncementBar />
      {/* <PanchangBar /> */}
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-[#1A1A1A] mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="text-[#FF8C00]" size={24} />
                  <h2 className="text-2xl font-bold text-[#1A1A1A]">Delivery Address</h2>
                </div>
                {!showAddAddress && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddAddress(true);
                      setSelectedAddressId(null);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        addressLine1: '',
                        addressLine2: '',
                        landmark: '',
                        city: '',
                        state: '',
                        pincode: '',
                        country: 'India',
                        addressType: 'home',
                      });
                    }}
                    className="text-[#FF8C00] hover:text-[#FF7A00] font-semibold flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Add New Address
                  </button>
                )}
              </div>

              {/* Saved Addresses */}
              {!showAddAddress && savedAddresses.length > 0 && (
                <div className="mb-6 space-y-3">
                  {savedAddresses.map((address) => {
                    const addressId = address._id || address.id;
                    const isSelected = selectedAddressId === addressId;
                    const getAddressTypeIcon = (type: string) => {
                      switch (type) {
                        case 'home': return <Home size={18} />;
                        case 'work': return <Briefcase size={18} />;
                        default: return <Map size={18} />;
                      }
                    };
                    const getAddressTypeLabel = (type: string) => {
                      switch (type) {
                        case 'home': return 'Home';
                        case 'work': return 'Work';
                        default: return 'Other';
                      }
                    };

                    return (
                      <div
                        key={addressId}
                        onClick={() => {
                          setSelectedAddressId(addressId);
                          setFormData({
                            name: address.name,
                            email: address.email || '',
                            phone: address.phone,
                            addressLine1: address.addressLine1,
                            addressLine2: address.addressLine2 || '',
                            landmark: address.landmark || '',
                            city: address.city,
                            state: address.state,
                            pincode: address.pincode,
                            country: address.country || 'India',
                            addressType: address.addressType || 'home',
                          });
                        }}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#FF8C00] bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <input
                              type="radio"
                              name="selectedAddress"
                              checked={isSelected}
                              onChange={() => {}}
                              className="mt-1 w-4 h-4 text-[#FF8C00] border-gray-300 focus:ring-[#FF8C00]"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getAddressTypeIcon(address.addressType)}
                                <span className="font-bold text-[#1A1A1A]">{address.name}</span>
                                <span className="text-sm text-gray-600">({getAddressTypeLabel(address.addressType)})</span>
                                {address.isDefault && (
                                  <span className="bg-[#FF8C00] text-white px-2 py-0.5 rounded text-xs font-semibold">
                                    DEFAULT
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-700 space-y-1">
                                <p>{address.addressLine1}</p>
                                {address.addressLine2 && <p>{address.addressLine2}</p>}
                                {address.landmark && <p className="text-gray-500">Landmark: {address.landmark}</p>}
                                <p>
                                  {address.city}, {address.state} - {address.pincode}
                                </p>
                                <p>{address.country || 'India'}</p>
                                <p className="font-semibold">Phone: {address.phone}</p>
                                {address.email && <p>Email: {address.email}</p>}
                              </div>
                            </div>
                          </div>
                          <a
                            href="#/profile"
                            className="text-[#FF8C00] hover:text-[#FF7A00] ml-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Edit size={18} />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add/Edit Address Form */}
              {showAddAddress && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 mb-6">
                  <h3 className="text-xl font-bold text-[#1A1A1A] mb-4">Add New Address</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                          placeholder="Enter full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                          placeholder="10 digit phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email (Optional)</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Address Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.addressType}
                          onChange={(e) => setFormData({ ...formData, addressType: e.target.value as 'home' | 'work' | 'other' })}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                        >
                          <option value="home">Home</option>
                          <option value="work">Work</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Address Line 1 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.addressLine1}
                        onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                        placeholder="House/Flat No., Building Name, Street"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Address Line 2 (Optional)</label>
                      <input
                        type="text"
                        value={formData.addressLine2}
                        onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                        placeholder="Area, Colony, Sector"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Landmark (Optional)</label>
                      <input
                        type="text"
                        value={formData.landmark}
                        onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                        placeholder="Nearby landmark"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          State <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                          placeholder="State"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Pincode <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.pincode}
                          onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                          placeholder="6 digit pincode"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#FF8C00]"
                        placeholder="Country"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={async () => {
                          if (!formData.name || !formData.phone || !formData.addressLine1 || !formData.city || !formData.state || !formData.pincode) {
                            showError('Please fill all required fields');
                            return;
                          }

                          try {
                            await authApi.addAddress({
                              ...formData,
                              isDefault: savedAddresses.length === 0, // Set as default if first address
                            });
                            showSuccess('Address saved successfully!');
                            const { data: addressesData } = await authApi.getAddresses();
                            if (addressesData?.addresses) {
                              setSavedAddresses(addressesData.addresses);
                              const newAddress = addressesData.addresses[addressesData.addresses.length - 1];
                              setSelectedAddressId(newAddress._id || newAddress.id);
                            }
                            setShowAddAddress(false);
                          } catch (error: any) {
                            showError('Failed to save address: ' + (error?.error || 'Unknown error'));
                          }
                        }}
                        className="btn-primary flex-1"
                      >
                        Save Address
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddAddress(false);
                          if (selectedAddressId) {
                            const selected = savedAddresses.find(a => (a._id || a.id) === selectedAddressId);
                            if (selected) {
                              setFormData({
                                name: selected.name,
                                email: selected.email || '',
                                phone: selected.phone,
                                addressLine1: selected.addressLine1,
                                addressLine2: selected.addressLine2 || '',
                                landmark: selected.landmark || '',
                                city: selected.city,
                                state: selected.state,
                                pincode: selected.pincode,
                                country: selected.country || 'India',
                                addressType: selected.addressType || 'home',
                              });
                            }
                          }
                        }}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Address Form (when no saved addresses or address selected) */}
              {!showAddAddress && selectedAddressId && (
                <div className="text-sm text-gray-600 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-semibold text-green-800">✓ Address Selected</p>
                  <p className="text-green-700 mt-1">You can edit this address from your profile page.</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Payment Method</h2>

              <div className="space-y-3">
                <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'upi' ? 'border-[#FF8C00] bg-orange-50' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    className="w-5 h-5 text-[#FF8C00]"
                  />
                  <Smartphone className="text-[#FF8C00]" size={24} />
                  <span className="font-semibold text-[#1A1A1A]">UPI / QR</span>
                </label>

                <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'card' ? 'border-[#FF8C00] bg-orange-50' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="w-5 h-5 text-[#FF8C00]"
                  />
                  <CreditCard className="text-[#FF8C00]" size={24} />
                  <span className="font-semibold text-[#1A1A1A]">Credit / Debit Card</span>
                </label>

                <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'cod' ? 'border-[#FF8C00] bg-orange-50' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="w-5 h-5 text-[#FF8C00]"
                  />
                  <Wallet className="text-[#FF8C00]" size={24} />
                  <span className="font-semibold text-[#1A1A1A]">Cash on Delivery</span>
                </label>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <img
                      src={item.product.image_url || item.product.images?.[0] || placeholders.small}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-[#1A1A1A] text-sm line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                      <p className="text-[#FF8C00] font-bold text-sm">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                {!appliedCoupon ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError('');
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApplyCoupon();
                          }
                        }}
                        placeholder="Enter coupon code"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF8C00]"
                        disabled={isValidatingCoupon}
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={isValidatingCoupon || !couponCode.trim()}
                        className="px-4 py-2 bg-[#FF8C00] text-white rounded-lg hover:bg-[#FF7A00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Tag size={18} />
                        {isValidatingCoupon ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-red-600 text-sm">{couponError}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowCoupons(!showCoupons)}
                      className="w-full flex items-center justify-between text-sm text-[#FF8C00] hover:text-[#FF7A00] transition-colors"
                    >
                      <span>View Available Coupons</span>
                      {showCoupons ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    {showCoupons && activeCoupons.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
                        {activeCoupons.map((coupon) => (
                          <div key={coupon._id || coupon.id} className="bg-white p-3 rounded border border-gray-200">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-[#FF8C00]">{coupon.code}</span>
                              <span className="text-sm text-gray-600">
                                {coupon.discount_type === 'percentage'
                                  ? `${coupon.discount_value}% OFF`
                                  : `₹${coupon.discount_value} OFF`}
                              </span>
                            </div>
                            {coupon.min_order_value > 0 && (
                              <p className="text-xs text-gray-500">
                                Min. order: ₹{coupon.min_order_value}
                              </p>
                            )}
                            {coupon.max_discount && coupon.discount_type === 'percentage' && (
                              <p className="text-xs text-gray-500">
                                Max discount: ₹{coupon.max_discount}
                              </p>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setCouponCode(coupon.code);
                                handleApplyCoupon();
                              }}
                              className="mt-2 text-xs text-[#FF8C00] hover:underline"
                            >
                              Use this coupon
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="text-green-600" size={18} />
                        <span className="font-semibold text-green-800">{appliedCoupon.code}</span>
                        <span className="text-sm text-green-700">
                          - ₹{couponDiscount.toFixed(2)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount ({appliedCoupon.code})</span>
                    <span>- ₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shippingCost === 0 ? 'text-green-600 font-semibold' : ''}>
                    {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (GST {taxRate}%)</span>
                  <span>₹{tax}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-[#1A1A1A] pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-[#FF8C00]">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {cartTotal < freeShippingThreshold && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                  <p className="text-yellow-800 text-sm">
                    Add ₹{(freeShippingThreshold - cartTotal).toFixed(2)} more to get FREE shipping!
                  </p>
                </div>
              )}

              {orderSuccess ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <CheckCircle className="text-green-600 mx-auto mb-2" size={32} />
                  <p className="text-green-800 font-semibold mb-1">Order Placed Successfully!</p>
                  <p className="text-green-700 text-sm">Redirecting to your orders...</p>
                </div>
              ) : (
                <>
                  {orderError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-red-800 text-sm">{orderError}</p>
                    </div>
                  )}
                  {paymentMessage && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-blue-800 text-sm">{paymentMessage}</p>
                    </div>
                  )}
                  <button 
                    type="submit" 
                    disabled={isSubmitting || isPaymentLoading}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting || isPaymentLoading ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order' : 'Proceed to Payment'}
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};
