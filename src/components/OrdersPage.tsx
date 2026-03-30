import React, { useEffect, useState } from 'react';
import { Package, MapPin, Calendar, CreditCard, Truck, CheckCircle } from 'lucide-react';
import { Order } from '../types';
import { ordersApi, authApi, refundsApi, paymentsApi } from '../lib/api';
import { mapOrder } from '../lib/mappers';
import { generateOrderInvoicePDF } from '../lib/invoiceGenerator';
import { placeholders } from '../lib/placeholders';
import { useCart } from '../contexts/CartContext';
import { AnnouncementBar } from './AnnouncementBar';
// import { PanchangBar } from './PanchangBar';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';

export const OrdersPage: React.FC = () => {
  const { clearCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [refundFeedback, setRefundFeedback] = useState<string>('');
  const [isRequestingRefund, setIsRequestingRefund] = useState(false);
  const [paymentVerificationMessage, setPaymentVerificationMessage] = useState('');
  
  const requestRefund = async (order: Order) => {
    const reason = prompt('Please enter a reason for the refund request:');
    if (!reason) return;
    setIsRequestingRefund(true);
    setRefundFeedback('');
    try {
      const { data, error } = await refundsApi.create(order.id || (order as any)._id, order.total, reason);
      if (error || !data) {
        throw new Error(error || 'Refund request failed');
      }
      setRefundFeedback('Refund request submitted successfully. Admin will review it soon.');
    } catch (err) {
      setRefundFeedback(err instanceof Error ? err.message : 'Refund request failed');
    } finally {
      setIsRequestingRefund(false);
    }
  };

  // const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    checkAuthAndLoadOrders();
  }, []);

  const verifyReturnedPayment = async () => {
    const hash = window.location.hash || '';
    const query = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(query);
    const shouldVerify = params.get('verifyPayment');
    const orderId = params.get('orderId');

    if (shouldVerify !== '1' || !orderId) return;

    setPaymentVerificationMessage('Verifying your payment...');

    const { data, error } = await paymentsApi.confirm({ orderId });
    const verifiedOrder = data?.order ? mapOrder(data.order) : null;

    if (!error && verifiedOrder?.paymentStatus === 'paid') {
      clearCart();
      setPaymentVerificationMessage('Payment successful. Your order is confirmed.');
    } else if (verifiedOrder?.paymentStatus === 'cancelled' || verifiedOrder?.paymentStatus === 'failed') {
      setPaymentVerificationMessage('Payment was not completed. Your cart is still available.');
    } else {
      setPaymentVerificationMessage('Payment verification is still pending.');
    }

    const { data: refreshedOrders } = await ordersApi.getAll();
    if (refreshedOrders?.orders) {
      setOrders(refreshedOrders.orders.map(mapOrder));
    }

    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#/orders`);
  };

  const checkAuthAndLoadOrders = async () => {
    try {
      // Get user profile
      const { data: userData, error: userError } = await authApi.getProfile();
      if (userError || !userData?.user) {
        window.location.hash = '/login?return=/orders';
        return;
      }
      setUser(userData.user);

      // Get orders
      const { data, error } = await ordersApi.getAll();
      if (error) {
        console.error('Failed to load orders', error);
        setOrders([]);
      } else {
        setOrders((data?.orders || []).map(mapOrder));
      }

      await verifyReturnedPayment();
    } catch (err) {
      console.error('Error loading orders', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'shipped':
        return <Truck size={20} className="text-purple-600" />;
      case 'processing':
      case 'confirmed':
        return <Package size={20} className="text-blue-600" />;
      default:
        return <Package size={20} className="text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <AnnouncementBar />
        {/* <PanchangBar /> */}
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-gray-500">Loading your orders...</p>
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-2">My Orders</h1>
          {user && (
            <p className="text-gray-600">
              Welcome back, {user.name || user.email}!
            </p>
          )}
          {refundFeedback && (
            <p className="text-sm text-blue-600 mt-2">{refundFeedback}</p>
          )}
          {paymentVerificationMessage && (
            <p className="text-sm text-green-600 mt-2">{paymentVerificationMessage}</p>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <a href="#/" className="btn-primary inline-block">
              Start Shopping
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                        <Package className="text-[#FF8C00]" size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1A1A1A]">
                          Order #{order.order_number || order.id.slice(-8).toUpperCase()}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <Calendar size={14} />
                          {new Date(order.created_at || order.createdAt || Date.now()).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col md:items-end gap-2">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize inline-flex items-center gap-2 ${getStatusColor(order.status || order.orderStatus || 'pending')}`}>
                        {getStatusIcon(order.status || order.orderStatus || 'pending')}
                        {order.status || order.orderStatus || 'pending'}
                      </span>
                      <p className="text-2xl font-bold text-[#FF8C00]">₹{order.total.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  {order.items && order.items.length > 0 && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h4 className="font-semibold text-[#1A1A1A] mb-3">Items ({order.items.length})</h4>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            {typeof item.product === 'object' && item.product && (
                              <img
                                src={(item.product as any).image_url || (item.product as any).images?.[0] || placeholders.small}
                                alt={item.name || 'Product'}
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-[#1A1A1A]">
                                {item.name || 'Product'}
                              </p>
                              <p className="text-sm text-gray-600">
                                Quantity: {item.quantity} × ₹{item.price}
                              </p>
                            </div>
                            <p className="font-bold text-[#FF8C00]">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                    <div>
                      <h4 className="font-semibold text-[#1A1A1A] mb-2 flex items-center gap-2">
                        <MapPin size={18} className="text-[#FF8C00]" />
                        Shipping Address
                      </h4>
                      {order.shippingAddress || order.shipping_address ? (
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">{(order.shippingAddress || order.shipping_address)?.name}</p>
                          <p>{(order.shippingAddress || order.shipping_address)?.street || (order.shippingAddress || order.shipping_address)?.address}</p>
                          <p>
                            {(order.shippingAddress || order.shipping_address)?.city}, {(order.shippingAddress || order.shipping_address)?.state} - {(order.shippingAddress || order.shipping_address)?.zipCode || (order.shippingAddress || order.shipping_address)?.pincode}
                          </p>
                          <p>Phone: {(order.shippingAddress || order.shipping_address)?.phone}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No address available</p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1A1A1A] mb-2 flex items-center gap-2">
                        <CreditCard size={18} className="text-[#FF8C00]" />
                        Payment Details
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Method:</span> {(order.paymentMethod || order.payment_method || 'N/A').toUpperCase()}
                        </p>
                        <p>
                          <span className="font-medium">Status:</span>{' '}
                          <span className={`capitalize ${
                            (order.paymentStatus || order.payment_status) === 'paid' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {order.paymentStatus || order.payment_status || 'pending'}
                          </span>
                        </p>
                        {order.invoiceNumber && (
                          <p>
                            <span className="font-medium">Invoice:</span> {order.invoiceNumber}
                            {' '}• <button
                              type="button"
                              onClick={() => generateOrderInvoicePDF(order)}
                              className="text-[#FF8C00] hover:underline"
                            >
                              Download PDF
                            </button>
                          </p>
                        )}

                        {order.paymentStatus?.toLowerCase() === 'paid' && order.orderStatus !== 'cancelled' && (
                          <p>
                            <button
                              type="button"
                              onClick={() => requestRefund(order)}
                              disabled={isRequestingRefund}
                              className="text-[#FF8C00] hover:underline"
                            >
                              {isRequestingRefund ? 'Submitting refund...' : 'Request Refund'}
                            </button>
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Subtotal:</span> ₹{order.subtotal.toFixed(2)}
                        </p>
                        {order.shippingCost !== undefined && (
                          <p>
                            <span className="font-medium">Shipping:</span> ₹{order.shippingCost.toFixed(2)}
                          </p>
                        )}
                        {order.tax !== undefined && (
                          <p>
                            <span className="font-medium">Tax:</span> ₹{order.tax.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {order.orderTimeline && order.orderTimeline.length > 0 && (
                    <div className="bg-gray-50 border-t border-gray-200 p-4">
                      <h4 className="font-semibold text-[#1A1A1A] mb-2">Order Timeline</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        {order.orderTimeline.map((event: any, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-2 h-2 mt-2 rounded-full bg-[#FF8C00]" />
                            <span>
                              <strong className="capitalize">{event.status}</strong> - {event.note || "Status updated"} <span className="text-gray-400">({new Date(event.timestamp).toLocaleString()})</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};
